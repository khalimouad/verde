const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const { authMiddleware } = require('../middleware/auth')
const db = require('../config/database')

// Get all sales
router.get('/', authMiddleware, (req, res) => {
  db.all(`SELECT v.*, c.nom as client_nom 
          FROM ventes v
          JOIN clients c ON v.client_id = c.id
          ORDER BY v.date_vente DESC`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des ventes' })
    }
    res.json(rows)
  })
})

// Get sale by ID with lines
router.get('/:id', authMiddleware, (req, res) => {
  db.get(`SELECT v.*, c.nom as client_nom 
          FROM ventes v
          JOIN clients c ON v.client_id = c.id
          WHERE v.id = ?`, [req.params.id], (err, sale) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur serveur' })
    }
    if (!sale) {
      return res.status(404).json({ message: 'Vente non trouvée' })
    }
    
    // Get sale lines
    db.all(`SELECT lv.*, p.designation as produit_nom 
            FROM ligne_ventes lv
            JOIN produits p ON lv.produit_id = p.id
            WHERE lv.vente_id = ?`, [req.params.id], (err, lines) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur serveur' })
      }
      
      res.json({ ...sale, lignes: lines })
    })
  })
})

// Create sale
router.post('/', authMiddleware, [
  body('client_id').notEmpty().withMessage('Client requis'),
  body('date_vente').notEmpty().withMessage('Date requise'),
  body('lignes').isArray().withMessage('Lignes requises')
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { client_id, date_vente, remise, remarques, lignes } = req.body

  // Generate sale number
  const numero = `V${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`

  db.run(
    `INSERT INTO ventes (numero, client_id, date_vente, remise, remarques)
     VALUES (?, ?, ?, ?, ?)`,
    [numero, client_id, date_vente, remise || 0, remarques],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la création de la vente' })
      }
      
      const venteId = this.lastID
      let totalHT = 0
      let totalTVA = 0

      // Insert sale lines
      const linePromises = lignes.map(line => {
        return new Promise((resolve, reject) => {
          const lineHT = line.quantite * line.prix_unitaire
          const lineTVA = lineHT * 0.20 // TODO: Get TVA from product
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
          const totalTTC = totalHT + totalTVA - (remise || 0)
          
          db.run(
            `UPDATE ventes SET montant_ht = ?, montant_tva = ?, montant_ttc = ? WHERE id = ?`,
            [totalHT, totalTVA, totalTTC, venteId],
            (err) => {
              if (err) {
                return res.status(500).json({ message: 'Erreur lors de la mise à jour de la vente' })
              }
              
              db.get('SELECT * FROM ventes WHERE id = ?', [venteId], (err, row) => {
                if (err) {
                  return res.status(500).json({ message: 'Erreur serveur' })
                }
                res.status(201).json(row)
              })
            }
          )
        })
        .catch(err => {
          res.status(500).json({ message: 'Erreur lors de la création des lignes de vente' })
        })
    }
  )
})

// Update sale status
router.patch('/:id/statut', authMiddleware, [
  body('statut').notEmpty().withMessage('Statut requis')
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { statut } = req.body

  db.run('UPDATE ventes SET statut = ?, date_modification = CURRENT_TIMESTAMP WHERE id = ?', [statut, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la mise à jour du statut' })
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Vente non trouvée' })
    }
    
    res.json({ message: 'Statut mis à jour avec succès' })
  })
})

module.exports = router