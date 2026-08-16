const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const { authMiddleware } = require('../middleware/auth')
const db = require('../config/database')

// Get all quotations
router.get('/', authMiddleware, (req, res) => {
  db.all(`SELECT d.*, c.nom as client_nom 
          FROM devis d
          JOIN clients c ON d.client_id = c.id
          ORDER BY d.date_devis DESC`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des devis' })
    }
    res.json(rows)
  })
})

// Get quotation by ID with lines
router.get('/:id', authMiddleware, (req, res) => {
  db.get(`SELECT d.*, c.nom as client_nom 
          FROM devis d
          JOIN clients c ON d.client_id = c.id
          WHERE d.id = ?`, [req.params.id], (err, devis) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur serveur' })
    }
    if (!devis) {
      return res.status(404).json({ message: 'Devis non trouvé' })
    }
    
    // Get quotation lines
    db.all(`SELECT ld.*, p.designation as produit_nom 
            FROM ligne_devis ld
            JOIN produits p ON ld.produit_id = p.id
            WHERE ld.devis_id = ?`, [req.params.id], (err, lines) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur serveur' })
      }
      
      res.json({ ...devis, lignes: lines })
    })
  })
})

// Create quotation
router.post('/', authMiddleware, [
  body('client_id').notEmpty().withMessage('Client requis'),
  body('date_devis').notEmpty().withMessage('Date requise'),
  body('lignes').isArray().withMessage('Lignes requises')
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { client_id, date_devis, date_validite, remise, remarques, lignes } = req.body

  // Generate quotation number
  const numero = `D${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`

  db.run(
    `INSERT INTO devis (numero, client_id, date_devis, date_validite, remise, remarques)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [numero, client_id, date_devis, date_validite, remise || 0, remarques],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la création du devis' })
      }
      
      const devisId = this.lastID
      let totalHT = 0
      let totalTVA = 0

      // Insert quotation lines
      const linePromises = lignes.map(line => {
        return new Promise((resolve, reject) => {
          const lineHT = line.quantite * line.prix_unitaire
          const lineTVA = lineHT * 0.20 // TODO: Get TVA from product
          const lineTTC = lineHT + lineTVA
          
          totalHT += lineHT
          totalTVA += lineTVA

          db.run(
            `INSERT INTO ligne_devis (devis_id, produit_id, quantite, prix_unitaire, remise, total_ht, total_tva, total_ttc)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [devisId, line.produit_id, line.quantite, line.prix_unitaire, line.remise || 0, lineHT, lineTVA, lineTTC],
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
            `UPDATE devis SET montant_ht = ?, montant_tva = ?, montant_ttc = ? WHERE id = ?`,
            [totalHT, totalTVA, totalTTC, devisId],
            (err) => {
              if (err) {
                return res.status(500).json({ message: 'Erreur lors de la mise à jour du devis' })
              }
              
              db.get('SELECT * FROM devis WHERE id = ?', [devisId], (err, row) => {
                if (err) {
                  return res.status(500).json({ message: 'Erreur serveur' })
                }
                res.status(201).json(row)
              })
            }
          )
        })
        .catch(err => {
          res.status(500).json({ message: 'Erreur lors de la création des lignes de devis' })
        })
    }
  )
})

// Convert quotation to sale
router.post('/:id/convertir', authMiddleware, (req, res) => {
  db.get('SELECT * FROM devis WHERE id = ?', [req.params.id], (err, devis) => {
    if (err || !devis) {
      return res.status(404).json({ message: 'Devis non trouvé' })
    }

    if (devis.statut !== 'EN_ATTENTE') {
      return res.status(400).json({ message: 'Seuls les devis en attente peuvent être convertis' })
    }

    // Get quotation lines
    db.all('SELECT * FROM ligne_devis WHERE devis_id = ?', [req.params.id], (err, lignes) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la récupération des lignes' })
      }

      // Create sale
      const venteData = {
        client_id: devis.client_id,
        date_vente: new Date().toISOString(),
        remise: devis.remise,
        remarques: `Converti depuis devis ${devis.numero}`,
        lignes: lignes.map(l => ({
          produit_id: l.produit_id,
          quantite: l.quantite,
          prix_unitaire: l.prix_unitaire,
          remise: l.remise
        }))
      }

      // Import the ventes router to reuse the create logic
      // For simplicity, we'll implement it inline here
      const numero = `V${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`

      db.run(
        `INSERT INTO ventes (numero, client_id, date_vente, remise, remarques)
         VALUES (?, ?, ?, ?, ?)`,
        [numero, venteData.client_id, venteData.date_vente, venteData.remise, venteData.remarques],
        function(err) {
          if (err) {
            return res.status(500).json({ message: 'Erreur lors de la création de la vente' })
          }
          
          const venteId = this.lastID
          let totalHT = 0
          let totalTVA = 0

          const linePromises = venteData.lignes.map(line => {
            return new Promise((resolve, reject) => {
              const lineHT = line.quantite * line.prix_unitaire
              const lineTVA = lineHT * 0.20
              const lineTTC = lineHT + lineTVA
              
              totalHT += lineHT
              totalTVA += lineTVA

              db.run(
                `INSERT INTO ligne_ventes (vente_id, produit_id, quantite, prix_unitaire, remise, total_ht, total_tva, total_ttc)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [venteId, line.produit_id, line.quantite, line.prix_unitaire, line.remise || 0, lineHT, lineTVA, lineTTC],
                (err) => {
                  if (err) reject(err)
                  else resolve()
                }
              )
            })
          })

          Promise.all(linePromises)
            .then(() => {
              const totalTTC = totalHT + totalTVA - (venteData.remise || 0)
              
              db.run(
                `UPDATE ventes SET montant_ht = ?, montant_tva = ?, montant_ttc = ? WHERE id = ?`,
                [totalHT, totalTVA, totalTTC, venteId],
                (err) => {
                  if (err) {
                    return res.status(500).json({ message: 'Erreur lors de la mise à jour de la vente' })
                  }
                  
                  // Update quotation status
                  db.run('UPDATE devis SET statut = ? WHERE id = ?', ['ACCEPTE', req.params.id])
                  
                  res.json({ message: 'Devis converti en vente avec succès', vente_id: venteId })
                }
              )
            })
            .catch(err => {
              res.status(500).json({ message: 'Erreur lors de la conversion' })
            })
        }
      )
    })
  })
})

// Update quotation status
router.patch('/:id/statut', authMiddleware, [
  body('statut').isIn(['EN_ATTENTE', 'ACCEPTE', 'REFUSE', 'EXPIRE']).withMessage('Statut invalide')
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { statut } = req.body

  db.run('UPDATE devis SET statut = ?, date_modification = CURRENT_TIMESTAMP WHERE id = ?', [statut, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la mise à jour du statut' })
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Devis non trouvé' })
    }
    
    res.json({ message: 'Statut mis à jour avec succès' })
  })
})

module.exports = router