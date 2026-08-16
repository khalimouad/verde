const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const { authMiddleware } = require('../middleware/auth')
const db = require('../config/database')

// Get all suppliers
router.get('/', authMiddleware, (req, res) => {
  db.all('SELECT * FROM fournisseurs WHERE actif = 1 ORDER BY nom', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des fournisseurs' })
    }
    res.json(rows)
  })
})

// Get supplier by ID
router.get('/:id', authMiddleware, (req, res) => {
  db.get('SELECT * FROM fournisseurs WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur serveur' })
    }
    if (!row) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' })
    }
    res.json(row)
  })
})

// Create supplier
router.post('/', authMiddleware, [
  body('code').notEmpty().withMessage('Code requis'),
  body('nom').notEmpty().withMessage('Nom requis')
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { code, nom, adresse, ville, code_postal, pays, telephone, email, fax, contact, ice, delai_livraison, remarques } = req.body

  db.run(
    `INSERT INTO fournisseurs (code, nom, adresse, ville, code_postal, pays, telephone, email, fax, contact, ice, delai_livraison, remarques)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [code, nom, adresse, ville, code_postal, pays, telephone, email, fax, contact, ice, delai_livraison || 0, remarques],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ message: 'Code fournisseur déjà utilisé' })
        }
        return res.status(500).json({ message: 'Erreur lors de la création du fournisseur' })
      }
      
      db.get('SELECT * FROM fournisseurs WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          return res.status(500).json({ message: 'Erreur serveur' })
        }
        res.status(201).json(row)
      })
    }
  )
})

// Update supplier
router.put('/:id', authMiddleware, [
  body('code').notEmpty().withMessage('Code requis'),
  body('nom').notEmpty().withMessage('Nom requis')
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { code, nom, adresse, ville, code_postal, pays, telephone, email, fax, contact, ice, delai_livraison, remarques } = req.body

  db.run(
    `UPDATE fournisseurs 
     SET code = ?, nom = ?, adresse = ?, ville = ?, code_postal = ?, pays = ?, 
         telephone = ?, email = ?, fax = ?, contact = ?, ice = ?, delai_livraison = ?, remarques = ?, 
         date_modification = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [code, nom, adresse, ville, code_postal, pays, telephone, email, fax, contact, ice, delai_livraison || 0, remarques, req.params.id],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ message: 'Code fournisseur déjà utilisé' })
        }
        return res.status(500).json({ message: 'Erreur lors de la mise à jour du fournisseur' })
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Fournisseur non trouvé' })
      }
      
      db.get('SELECT * FROM fournisseurs WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
          return res.status(500).json({ message: 'Erreur serveur' })
        }
        res.json(row)
      })
    }
  )
})

// Delete supplier (soft delete)
router.delete('/:id', authMiddleware, (req, res) => {
  db.run('UPDATE fournisseurs SET actif = 0 WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la suppression du fournisseur' })
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' })
    }
    
    res.json({ message: 'Fournisseur supprimé avec succès' })
  })
})

module.exports = router