const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const { authMiddleware } = require('../middleware/auth')
const db = require('../config/database')

// Get all invoices
router.get('/', authMiddleware, (req, res) => {
  db.all(`SELECT f.*, c.nom as client_nom 
          FROM factures f
          JOIN clients c ON f.client_id = c.id
          ORDER BY f.date_facture DESC`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des factures' })
    }
    res.json(rows)
  })
})

// Get invoice by ID with lines
router.get('/:id', authMiddleware, (req, res) => {
  db.get(`SELECT f.*, c.nom as client_nom 
          FROM factures f
          JOIN clients c ON f.client_id = c.id
          WHERE f.id = ?`, [req.params.id], (err, invoice) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur serveur' })
    }
    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' })
    }
    
    // Get invoice lines
    db.all(`SELECT lf.*, p.designation as produit_nom 
            FROM ligne_factures lf
            JOIN produits p ON lf.produit_id = p.id
            WHERE lf.facture_id = ?`, [req.params.id], (err, lines) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur serveur' })
      }
      
      res.json({ ...invoice, lignes: lines })
    })
  })
})

// Create invoice from sale
router.post('/', authMiddleware, [
  body('vente_id').notEmpty().withMessage('Vente requise'),
  body('client_id').notEmpty().withMessage('Client requis'),
  body('date_facture').notEmpty().withMessage('Date requise')
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { vente_id, client_id, date_facture, date_echeance, remarques } = req.body

  // Get sale details
  db.get('SELECT * FROM ventes WHERE id = ?', [vente_id], (err, sale) => {
    if (err || !sale) {
      return res.status(404).json({ message: 'Vente non trouvée' })
    }

    // Generate invoice number
    const numero = `F${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`

    db.run(
      `INSERT INTO factures (numero, vente_id, client_id, date_facture, date_echeance, montant_ht, montant_tva, montant_ttc, montant_reste, remarques)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [numero, vente_id, client_id, date_facture, date_echeance, sale.montant_ht, sale.montant_tva, sale.montant_ttc, sale.montant_ttc, remarques],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Erreur lors de la création de la facture' })
        }
        
        const factureId = this.lastID

        // Copy sale lines to invoice lines
        db.all('SELECT * FROM ligne_ventes WHERE vente_id = ?', [vente_id], (err, lines) => {
          if (err) {
            return res.status(500).json({ message: 'Erreur lors de la récupération des lignes' })
          }

          const linePromises = lines.map(line => {
            return new Promise((resolve, reject) => {
              db.run(
                `INSERT INTO ligne_factures (facture_id, produit_id, quantite, prix_unitaire, remise, total_ht, total_tva, total_ttc)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [factureId, line.produit_id, line.quantite, line.prix_unitaire, line.remise, line.total_ht, line.total_tva, line.total_ttc],
                (err) => {
                  if (err) reject(err)
                  else resolve()
                }
              )
            })
          })

          Promise.all(linePromises)
            .then(() => {
              // Update sale status
              db.run('UPDATE ventes SET statut = ? WHERE id = ?', ['FACTURE', vente_id])
              
              db.get('SELECT * FROM factures WHERE id = ?', [factureId], (err, row) => {
                if (err) {
                  return res.status(500).json({ message: 'Erreur serveur' })
                }
                res.status(201).json(row)
              })
            })
            .catch(err => {
              res.status(500).json({ message: 'Erreur lors de la création des lignes de facture' })
            })
        })
      }
    )
  })
})

// Add payment to invoice
router.post('/:id/paiement', authMiddleware, [
  body('montant').isFloat({ min: 0 }).withMessage('Montant valide requis'),
  body('mode_paiement').notEmpty().withMessage('Mode de paiement requis')
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { montant, mode_paiement, reference_paiement, remarques } = req.body

  // Get invoice details
  db.get('SELECT * FROM factures WHERE id = ?', [req.params.id], (err, invoice) => {
    if (err || !invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' })
    }

    // Generate payment number
    const numero = `P${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`

    db.run(
      `INSERT INTO reglements (numero, facture_id, client_id, date_reglement, montant, mode_paiement, reference_paiement, remarques)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?)`,
      [numero, req.params.id, invoice.client_id, montant, mode_paiement, reference_paiement, remarques],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Erreur lors de l\'ajout du paiement' })
        }

        // Update invoice
        const nouveauMontantPaye = invoice.montant_paye + montant
        const nouveauMontantReste = invoice.montant_ttc - nouveauMontantPaye
        const nouveauStatut = nouveauMontantReste <= 0 ? 'PAYE' : (nouveauMontantPaye > 0 ? 'PARTIEL' : 'NON_PAYE')

        db.run(
          `UPDATE factures SET montant_paye = ?, montant_reste = ?, statut = ? WHERE id = ?`,
          [nouveauMontantPaye, Math.max(0, nouveauMontantReste), nouveauStatut, req.params.id],
          (err) => {
            if (err) {
              return res.status(500).json({ message: 'Erreur lors de la mise à jour de la facture' })
            }
            
            res.json({ message: 'Paiement enregistré avec succès' })
          }
        )
      }
    )
  })
})

module.exports = router