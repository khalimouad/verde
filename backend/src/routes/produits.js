const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const { authMiddleware } = require('../middleware/auth')
const db = require('../config/database')

// Get all products
router.get('/', authMiddleware, (req, res) => {
  db.all(`SELECT p.*, 
          f.nom as famille_nom, 
          c.nom as categorie_nom, 
          m.nom as marque_nom,
          t.taux as tva_taux
          FROM produits p
          LEFT JOIN familles f ON p.famille_id = f.id
          LEFT JOIN categories c ON p.categorie_id = c.id
          LEFT JOIN marques m ON p.marque_id = m.id
          LEFT JOIN tva t ON p.tva_id = t.id
          WHERE p.actif = 1 
          ORDER BY p.designation`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des produits' })
    }
    res.json(rows)
  })
})

// Get product by ID
router.get('/:id', authMiddleware, (req, res) => {
  db.get(`SELECT p.*, 
          f.nom as famille_nom, 
          c.nom as categorie_nom, 
          m.nom as marque_nom,
          t.taux as tva_taux
          FROM produits p
          LEFT JOIN familles f ON p.famille_id = f.id
          LEFT JOIN categories c ON p.categorie_id = c.id
          LEFT JOIN marques m ON p.marque_id = m.id
          LEFT JOIN tva t ON p.tva_id = t.id
          WHERE p.id = ?`, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur serveur' })
    }
    if (!row) {
      return res.status(404).json({ message: 'Produit non trouvé' })
    }
    res.json(row)
  })
})

// Create product
router.post('/', authMiddleware, [
  body('code').notEmpty().withMessage('Code requis'),
  body('designation').notEmpty().withMessage('Désignation requise'),
  body('prix_vente').isFloat({ min: 0 }).withMessage('Prix valide requis')
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { code, designation, description, famille_id, categorie_id, marque_id, prix_vente, prix_achat, unite_mesure, stock_actuel, stock_min, stock_max, tva_id, image_url, remarques } = req.body

  db.run(
    `INSERT INTO produits (code, designation, description, famille_id, categorie_id, marque_id, prix_vente, prix_achat, unite_mesure, stock_actuel, stock_min, stock_max, tva_id, image_url, remarques)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [code, designation, description, famille_id, categorie_id, marque_id, prix_vente, prix_achat, unite_mesure, stock_actuel || 0, stock_min || 0, stock_max || 0, tva_id, image_url, remarques],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ message: 'Code produit déjà utilisé' })
        }
        return res.status(500).json({ message: 'Erreur lors de la création du produit' })
      }
      
      // Create stock entry
      db.run('INSERT INTO stock (produit_id, quantite) VALUES (?, ?)', [this.lastID, stock_actuel || 0])
      
      db.get('SELECT * FROM produits WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          return res.status(500).json({ message: 'Erreur serveur' })
        }
        res.status(201).json(row)
      })
    }
  )
})

// Update product
router.put('/:id', authMiddleware, [
  body('code').notEmpty().withMessage('Code requis'),
  body('designation').notEmpty().withMessage('Désignation requise'),
  body('prix_vente').isFloat({ min: 0 }).withMessage('Prix valide requis')
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { code, designation, description, famille_id, categorie_id, marque_id, prix_vente, prix_achat, unite_mesure, stock_actuel, stock_min, stock_max, tva_id, image_url, remarques } = req.body

  db.run(
    `UPDATE produits 
     SET code = ?, designation = ?, description = ?, famille_id = ?, categorie_id = ?, marque_id = ?, 
         prix_vente = ?, prix_achat = ?, unite_mesure = ?, stock_actuel = ?, stock_min = ?, stock_max = ?, 
         tva_id = ?, image_url = ?, remarques = ?, date_modification = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [code, designation, description, famille_id, categorie_id, marque_id, prix_vente, prix_achat, unite_mesure, stock_actuel || 0, stock_min || 0, stock_max || 0, tva_id, image_url, remarques, req.params.id],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ message: 'Code produit déjà utilisé' })
        }
        return res.status(500).json({ message: 'Erreur lors de la mise à jour du produit' })
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Produit non trouvé' })
      }
      
      // Update stock
      db.run('UPDATE stock SET quantite = ? WHERE produit_id = ?', [stock_actuel || 0, req.params.id])
      
      db.get('SELECT * FROM produits WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
          return res.status(500).json({ message: 'Erreur serveur' })
        }
        res.json(row)
      })
    }
  )
})

// Delete product (soft delete)
router.delete('/:id', authMiddleware, (req, res) => {
  db.run('UPDATE produits SET actif = 0 WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la suppression du produit' })
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Produit non trouvé' })
    }
    
    res.json({ message: 'Produit supprimé avec succès' })
  })
})

module.exports = router