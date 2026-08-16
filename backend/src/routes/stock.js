const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const { authMiddleware } = require('../middleware/auth')
const db = require('../config/database')

// Get all stock with product details
router.get('/', authMiddleware, (req, res) => {
  db.all(`SELECT s.*, p.code, p.designation, p.stock_min, p.stock_max, p.prix_achat
          FROM stock s
          JOIN produits p ON s.produit_id = p.id
          WHERE p.actif = 1
          ORDER BY p.designation`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération du stock' })
    }
    
    // Calculate total value for each item
    const stockWithValue = rows.map(item => ({
      ...item,
      valeur_totale: item.quantite * (item.prix_achat || 0)
    }))
    
    res.json(stockWithValue)
  })
})

// Get stock movements for a product
router.get('/mouvements/:produit_id', authMiddleware, (req, res) => {
  db.all(`SELECT ms.*, p.designation as produit_nom
          FROM mouvements_stock ms
          JOIN produits p ON ms.produit_id = p.id
          WHERE ms.produit_id = ?
          ORDER BY ms.date_mouvement DESC`, [req.params.produit_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des mouvements' })
    }
    res.json(rows)
  })
})

// Adjust stock
router.post('/ajustement', authMiddleware, [
  body('produit_id').notEmpty().withMessage('Produit requis'),
  body('type').isIn(['ENTREE', 'SORTIE']).withMessage('Type invalide'),
  body('quantite').isInt({ min: 1 }).withMessage('Quantité valide requise')
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { produit_id, type, quantite, reference_type, reference_id, remarques } = req.body

  // Get current stock
  db.get('SELECT * FROM stock WHERE produit_id = ?', [produit_id], (err, stock) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur serveur' })
    }
    
    if (!stock) {
      return res.status(404).json({ message: 'Stock non trouvé pour ce produit' })
    }

    const newQuantity = type === 'ENTREE' ? stock.quantite + quantite : stock.quantite - quantite

    if (newQuantity < 0) {
      return res.status(400).json({ message: 'Stock insuffisant' })
    }

    // Update stock
    db.run('UPDATE stock SET quantite = ?, derniere_maj = CURRENT_TIMESTAMP WHERE produit_id = ?', 
           [newQuantity, produit_id], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la mise à jour du stock' })
      }

      // Record movement
      db.run(
        `INSERT INTO mouvements_stock (produit_id, type, quantite, reference_type, reference_id, remarques)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [produit_id, type, quantite, reference_type, reference_id, remarques],
        (err) => {
          if (err) {
            return res.status(500).json({ message: 'Erreur lors de l\'enregistrement du mouvement' })
          }
          
          // Update product stock
          db.run('UPDATE produits SET stock_actuel = ? WHERE id = ?', [newQuantity, produit_id])
          
          res.json({ message: 'Stock ajusté avec succès', nouvelle_quantite: newQuantity })
        }
      )
    })
  })
})

// Get low stock alerts
router.get('/alertes/low', authMiddleware, (req, res) => {
  db.all(`SELECT s.*, p.code, p.designation, p.stock_min
          FROM stock s
          JOIN produits p ON s.produit_id = p.id
          WHERE s.quantite <= p.stock_min AND p.actif = 1
          ORDER BY s.quantite ASC`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des alertes' })
    }
    res.json(rows)
  })
})

module.exports = router