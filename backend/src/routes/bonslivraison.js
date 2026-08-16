const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const { authMiddleware } = require('../middleware/auth')
const db = require('../config/database')

// Get all delivery notes
router.get('/', authMiddleware, (req, res) => {
  const { type, date_debut, date_fin } = req.query
  
  let query = `SELECT bl.*, 
          CASE 
            WHEN bl.type = 'VENTE' THEN c.nom
            WHEN bl.type = 'ACHAT' THEN f.nom
          END as partenaire_nom,
          CASE 
            WHEN bl.type = 'VENTE' THEN 'Client'
            WHEN bl.type = 'ACHAT' THEN 'Fournisseur'
          END as partenaire_type
          FROM bons_livraison bl
          LEFT JOIN clients c ON bl.type = 'VENTE' AND bl.reference_id IN (SELECT id FROM ventes WHERE client_id = c.id)
          LEFT JOIN fournisseurs f ON bl.type = 'ACHAT' AND bl.reference_id IN (SELECT id FROM bons_commande WHERE fournisseur_id = f.id)`
  let params = []
  let conditions = []
  
  if (type) {
    conditions.push('bl.type = ?')
    params.push(type)
  }
  
  if (date_debut && date_fin) {
    conditions.push('bl.date_livraison BETWEEN ? AND ?')
    params.push(date_debut, date_fin)
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ')
  }
  
  query += ' ORDER BY bl.date_livraison DESC'
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des bons de livraison' })
    }
    res.json(rows)
  })
})

// Get delivery note by ID with lines
router.get('/:id', authMiddleware, (req, res) => {
  db.get(`SELECT bl.* 
          FROM bons_livraison bl
          WHERE bl.id = ?`, [req.params.id], (err, bl) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur serveur' })
    }
    if (!bl) {
      return res.status(404).json({ message: 'Bon de livraison non trouvé' })
    }
    
    // Get partner information based on type
    let partnerQuery, partnerParams
    if (bl.type === 'VENTE') {
      partnerQuery = 'SELECT c.* FROM clients c JOIN ventes v ON v.client_id = c.id WHERE v.id = ?'
      partnerParams = [bl.reference_id]
    } else {
      partnerQuery = 'SELECT f.* FROM fournisseurs f JOIN bons_commande bc ON bc.fournisseur_id = f.id WHERE bc.id = ?'
      partnerParams = [bl.reference_id]
    }
    
    db.get(partnerQuery, partnerParams, (err, partner) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur serveur' })
      }
      
      // Get delivery lines
      db.all(`SELECT lbl.*, p.designation as produit_nom 
              FROM ligne_bons_livraison lbl
              JOIN produits p ON lbl.produit_id = p.id
              WHERE lbl.bon_livraison_id = ?`, [req.params.id], (err, lines) => {
        if (err) {
          return res.status(500).json({ message: 'Erreur serveur' })
        }
        
        res.json({ ...bl, partenaire: partner, lignes: lines })
      })
    })
  })
})

// Create delivery note from sale
router.post('/vente/:vente_id', authMiddleware, [
  body('date_livraison').notEmpty().withMessage('Date requise')
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { date_livraison, remarques } = req.body

  // Get sale details
  db.get('SELECT * FROM ventes WHERE id = ?', [req.params.vente_id], (err, sale) => {
    if (err || !sale) {
      return res.status(404).json({ message: 'Vente non trouvée' })
    }

    // Generate delivery note number
    const numero = `BL${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`

    db.run(
      `INSERT INTO bons_livraison (numero, type, reference_id, date_livraison, montant_ht, montant_tva, montant_ttc, remarques)
       VALUES (?, 'VENTE', ?, ?, ?, ?, ?, ?)`,
      [numero, req.params.vente_id, date_livraison, sale.montant_ht, sale.montant_tva, sale.montant_ttc, remarques],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Erreur lors de la création du bon de livraison' })
        }
        
        const blId = this.lastID

        // Get sale lines
        db.all('SELECT * FROM ligne_ventes WHERE vente_id = ?', [req.params.vente_id], (err, lines) => {
          if (err) {
            return res.status(500).json({ message: 'Erreur lors de la récupération des lignes' })
          }

          const linePromises = lines.map(line => {
            return new Promise((resolve, reject) => {
              db.run(
                `INSERT INTO ligne_bons_livraison (bon_livraison_id, produit_id, quantite, prix_unitaire, total_ht, total_tva, total_ttc)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [blId, line.produit_id, line.quantite, line.prix_unitaire, line.total_ht, line.total_tva, line.total_ttc],
                (err) => {
                  if (err) reject(err)
                  else resolve()
                }
              )
            })
          })

          Promise.all(linePromises)
            .then(() => {
              // Update stock for each product
              lines.forEach(line => {
                db.run('UPDATE stock SET quantite = quantite - ? WHERE produit_id = ?', [line.quantite, line.produit_id])
                db.run('UPDATE produits SET stock_actuel = stock_actuel - ? WHERE id = ?', [line.quantite, line.produit_id])
                
                // Record stock movement
                db.run(
                  `INSERT INTO mouvements_stock (produit_id, type, quantite, reference_type, reference_id, remarques)
                   VALUES (?, 'SORTIE', ?, 'VENTE', ?, ?)`,
                  [line.produit_id, line.quantite, req.params.vente_id, `Bon livraison ${numero}`]
                )
              })
              
              // Update sale status
              db.run('UPDATE ventes SET statut = ? WHERE id = ?', ['LIVRE', req.params.vente_id])
              
              db.get('SELECT * FROM bons_livraison WHERE id = ?', [blId], (err, row) => {
                if (err) {
                  return res.status(500).json({ message: 'Erreur serveur' })
                }
                res.status(201).json(row)
              })
            })
            .catch(err => {
              res.status(500).json({ message: 'Erreur lors de la création des lignes' })
            })
        })
      }
    )
  })
})

// Create delivery note from purchase order
router.post('/achat/:commande_id', authMiddleware, [
  body('date_livraison').notEmpty().withMessage('Date requise')
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { date_livraison, remarques } = req.body

  // Get purchase order details
  db.get('SELECT * FROM bons_commande WHERE id = ?', [req.params.commande_id], (err, commande) => {
    if (err || !commande) {
      return res.status(404).json({ message: 'Bon de commande non trouvé' })
    }

    // Generate delivery note number
    const numero = `BLA${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`

    db.run(
      `INSERT INTO bons_livraison (numero, type, reference_id, date_livraison, montant_ht, montant_tva, montant_ttc, remarques)
       VALUES (?, 'ACHAT', ?, ?, ?, ?, ?, ?)`,
      [numero, req.params.commande_id, date_livraison, commande.montant_ht, commande.montant_tva, commande.montant_ttc, remarques],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Erreur lors de la création du bon de livraison' })
        }
        
        const blId = this.lastID

        // Get purchase order lines
        db.all('SELECT * FROM ligne_bons_commande WHERE bon_commande_id = ?', [req.params.commande_id], (err, lines) => {
          if (err) {
            return res.status(500).json({ message: 'Erreur lors de la récupération des lignes' })
          }

          const linePromises = lines.map(line => {
            return new Promise((resolve, reject) => {
              db.run(
                `INSERT INTO ligne_bons_livraison (bon_livraison_id, produit_id, quantite, prix_unitaire, total_ht, total_tva, total_ttc)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [blId, line.produit_id, line.quantite, line.prix_unitaire, line.total_ht, line.total_tva, line.total_ttc],
                (err) => {
                  if (err) reject(err)
                  else resolve()
                }
              )
            })
          })

          Promise.all(linePromises)
            .then(() => {
              // Update stock for each product
              lines.forEach(line => {
                db.run('UPDATE stock SET quantite = quantite + ? WHERE produit_id = ?', [line.quantite, line.produit_id])
                db.run('UPDATE produits SET stock_actuel = stock_actuel + ? WHERE id = ?', [line.quantite, line.produit_id])
                
                // Record stock movement
                db.run(
                  `INSERT INTO mouvements_stock (produit_id, type, quantite, reference_type, reference_id, remarques)
                   VALUES (?, 'ENTREE', ?, 'ACHAT', ?, ?)`,
                  [line.produit_id, line.quantite, req.params.commande_id, `Bon livraison ${numero}`]
                )
              })
              
              // Update purchase order status
              db.run('UPDATE bons_commande SET statut = ? WHERE id = ?', ['RECU', req.params.commande_id])
              
              db.get('SELECT * FROM bons_livraison WHERE id = ?', [blId], (err, row) => {
                if (err) {
                  return res.status(500).json({ message: 'Erreur serveur' })
                }
                res.status(201).json(row)
              })
            })
            .catch(err => {
              res.status(500).json({ message: 'Erreur lors de la création des lignes' })
            })
        })
      }
    )
  })
})

// Update delivery note status
router.patch('/:id/statut', authMiddleware, [
  body('statut').isIn(['LIVRE', 'ANNULE', 'PARTIEL']).withMessage('Statut invalide')
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { statut } = req.body

  db.run('UPDATE bons_livraison SET statut = ?, date_modification = CURRENT_TIMESTAMP WHERE id = ?', [statut, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la mise à jour du statut' })
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Bon de livraison non trouvé' })
    }
    
    res.json({ message: 'Statut mis à jour avec succès' })
  })
})

// Delete delivery note
router.delete('/:id', authMiddleware, (req, res) => {
  db.get('SELECT * FROM bons_livraison WHERE id = ?', [req.params.id], (err, bl) => {
    if (err || !bl) {
      return res.status(404).json({ message: 'Bon de livraison non trouvé' })
    }

    // Get lines to reverse stock
    db.all('SELECT * FROM ligne_bons_livraison WHERE bon_livraison_id = ?', [req.params.id], (err, lines) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur serveur' })
      }

      // Reverse stock movements
      lines.forEach(line => {
        const stockChange = bl.type === 'VENTE' ? line.quantite : -line.quantite
        db.run('UPDATE stock SET quantite = quantite + ? WHERE produit_id = ?', [stockChange, line.produit_id])
        db.run('UPDATE produits SET stock_actuel = stock_actuel + ? WHERE id = ?', [stockChange, line.produit_id])
      })

      // Delete delivery note
      db.run('DELETE FROM bons_livraison WHERE id = ?', [req.params.id], function(err) {
        if (err) {
          return res.status(500).json({ message: 'Erreur lors de la suppression' })
        }
        
        res.json({ message: 'Bon de livraison supprimé avec succès' })
      })
    })
  })
})

module.exports = router