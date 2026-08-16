const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const { authMiddleware } = require('../middleware/auth')
const db = require('../config/database')

// Get all clients
router.get('/', authMiddleware, (req, res) => {
  db.all('SELECT * FROM clients WHERE actif = 1 ORDER BY nom', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des clients' })
    }
    res.json(rows)
  })
})

// Get client by ID
router.get('/:id', authMiddleware, (req, res) => {
  db.get('SELECT * FROM clients WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur serveur' })
    }
    if (!row) {
      return res.status(404).json({ message: 'Client non trouvé' })
    }
    res.json(row)
  })
})

// Create client
router.post('/', authMiddleware, [
  body('code').notEmpty().withMessage('Code requis'),
  body('nom').notEmpty().withMessage('Nom requis')
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { code, nom, adresse, ville, code_postal, pays, telephone, email, fax, contact, ice, credit_limite, remarques } = req.body

  db.run(
    `INSERT INTO clients (code, nom, adresse, ville, code_postal, pays, telephone, email, fax, contact, ice, credit_limite, remarques)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [code, nom, adresse, ville, code_postal, pays, telephone, email, fax, contact, ice, credit_limite || 0, remarques],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ message: 'Code client déjà utilisé' })
        }
        return res.status(500).json({ message: 'Erreur lors de la création du client' })
      }
      
      db.get('SELECT * FROM clients WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          return res.status(500).json({ message: 'Erreur serveur' })
        }
        res.status(201).json(row)
      })
    }
  )
})

// Update client
router.put('/:id', authMiddleware, [
  body('code').notEmpty().withMessage('Code requis'),
  body('nom').notEmpty().withMessage('Nom requis')
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { code, nom, adresse, ville, code_postal, pays, telephone, email, fax, contact, ice, credit_limite, remarques } = req.body

  db.run(
    `UPDATE clients 
     SET code = ?, nom = ?, adresse = ?, ville = ?, code_postal = ?, pays = ?, 
         telephone = ?, email = ?, fax = ?, contact = ?, ice = ?, credit_limite = ?, remarques = ?, 
         date_modification = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [code, nom, adresse, ville, code_postal, pays, telephone, email, fax, contact, ice, credit_limite || 0, remarques, req.params.id],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ message: 'Code client déjà utilisé' })
        }
        return res.status(500).json({ message: 'Erreur lors de la mise à jour du client' })
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Client non trouvé' })
      }
      
      db.get('SELECT * FROM clients WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
          return res.status(500).json({ message: 'Erreur serveur' })
        }
        res.json(row)
      })
    }
  )
})

// Delete client (soft delete)
router.delete('/:id', authMiddleware, (req, res) => {
  db.run('UPDATE clients SET actif = 0 WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la suppression du client' })
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Client non trouvé' })
    }
    
    res.json({ message: 'Client supprimé avec succès' })
  })
})

module.exports = router