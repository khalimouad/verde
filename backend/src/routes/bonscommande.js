const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const { authMiddleware } = require('../middleware/auth')
const db = require('../config/database')

// Get all purchase orders
router.get('/', authMiddleware, (req, res) => {
  db.all(`SELECT bc.*, f.nom as fournisseur_nom 
          FROM bons_commande bc
          JOIN fournisseurs f ON bc.fournisseur_id = f.id
          ORDER BY bc.date_commande DESC`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des bons de commande' })
    }
    res.json(rows)
  })
})

// Get purchase order by ID with lines
router.get('/:id', authMiddleware, (req, res) => {
  db.get(`SELECT bc.*, f.nom as fournisseur_nom 
          FROM bons_commande bc
          JOIN fournisseurs f ON bc.fournisseur_id = f.id
          WHERE bc.id = ?`, [req.params.id], (err, commande) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur serveur' })
    }
    if (!commande) {
      return res.status(404).json({ message: 'Bon de commande non trouvé' })
    }
    
    // Get purchase order lines
    db.all(`SELECT lbc.*, p.designation as produit_nom 
            FROM ligne_bons_commande lbc
            JOIN produits p ON lbc.produit_id = p.id
            WHERE lbc.bon_commande_id = ?`, [req.params.id], (err, lines) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur serveur' })
      }
      
      res.json({ ...commande, lignes: lines })
    })
  })
})

// Create purchase order
router.post('/', authMiddleware, [
  body('fournisseur_id').notEmpty().withMessage('Fournisseur requis'),
  body('date_commande').notEmpty().withMessage('Date requise'),
  body('lignes').isArray().withMessage('Lignes requises')
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { fournisseur_id, date_commande, date_livraison_prevue, remise, remarques, lignes } = req.body

  // Generate purchase order number
  const numero = `BC${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`

  db.run(
    `INSERT INTO bons_commande (numero, fournisseur_id, date_commande, date_livraison_prevue, remise, remarques)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [numero, fournisseur_id, date_commande, date_livraison_prevue, remise || 0, remarques],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la création du bon de commande' })
      }
      
      const commandeId = this.lastID
      let totalHT = 0
      let totalTVA = 0

      // Insert purchase order lines
      const linePromises = lignes.map(line => {
        return new Promise((resolve, reject) => {
          const lineHT = line.quantite * line.prix_unitaire
          const lineTVA = lineHT * 0.20 // TODO: Get TVA from product
          const lineTTC = lineHT + lineTVA
          
          totalHT += lineHT
          totalTVA += lineTVA

          db.run(
            `INSERT INTO ligne_bons_commande (bon_commande_id, produit_id, quantite, prix_unitaire, remise, total_ht, total_tva, total_ttc)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [commandeId, line.produit_id, line.quantite, line.prix_unitaire, line.remise || 0, lineHT, lineTVA, lineTTC],
            (err) => {
              if (err) reject(err)
              else resolve()
            }
          )
        })
      })

      Promise.all(linePromises)
        .then(() => {
          const totalTTC = totalHT + totalTVA - (remise || 0)
          
          db.run(
            `UPDATE bons_commande SET montant_ht = ?, montant_tva = ?, montant_ttc = ? WHERE id = ?`,
            [totalHT, totalTVA, totalTTC, commandeId],
            (err) => {
              if (err) {
                return res.status(500).json({ message: 'Erreur lors de la mise à jour du bon de commande' })
              }
              
              db.get('SELECT * FROM bons_commande WHERE id = ?', [commandeId], (err, row) => {
                if (err) {
                  return res.status(500).json({ message: 'Erreur serveur' })
                }
                res.status(201).json(row)
              })
            }
          )
        })
        .catch(err => {
          res.status(500).json({ message: 'Erreur lors de la création des lignes de commande' })
        })
    }
  )
})

// Update purchase order status
router.patch('/:id/statut', authMiddleware, [
  body('statut').isIn(['EN_COURS', 'RECU', 'ANNULE']).withMessage('Statut invalide')
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { statut } = req.body

  db.run('UPDATE bons_commande SET statut = ?, date_modification = CURRENT_TIMESTAMP WHERE id = ?', [statut, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la mise à jour du statut' })
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Bon de commande non trouvé' })
    }
    
    res.json({ message: 'Statut mis à jour avec succès' })
  })
})

// Delete purchase order
router.delete('/:id', authMiddleware, (req, res) => {
  db.run('DELETE FROM bons_commande WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la suppression du bon de commande' })
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Bon de commande non trouvé' })
    }
    
    res.json({ message: 'Bon de commande supprimé avec succès' })
  })
})

module.exports = router