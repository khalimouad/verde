const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const { authMiddleware, adminMiddleware } = require('../middleware/auth')
const db = require('../config/database')

// Get all parameters
router.get('/', authMiddleware, (req, res) => {
  db.all('SELECT * FROM parametres ORDER BY code', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des paramètres' })
    }
    res.json(rows)
  })
})

// Get parameter by code
router.get('/:code', authMiddleware, (req, res) => {
  db.get('SELECT * FROM parametres WHERE code = ?', [req.params.code], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur serveur' })
    }
    if (!row) {
      return res.status(404).json({ message: 'Paramètre non trouvé' })
    }
    res.json(row)
  })
})

// Update parameter
router.put('/:code', authMiddleware, adminMiddleware, [
  body('valeur').notEmpty().withMessage('Valeur requise')
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { valeur, description, type } = req.body

  db.run(
    'UPDATE parametres SET valeur = ?, description = ?, type = ? WHERE code = ?',
    [valeur, description, type, req.params.code],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la mise à jour du paramètre' })
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Paramètre non trouvé' })
      }
      
      res.json({ message: 'Paramètre mis à jour avec succès' })
    }
  )
})

// Get company information
router.get('/societe/info', authMiddleware, (req, res) => {
  db.get('SELECT * FROM societe LIMIT 1', [], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur serveur' })
    }
    res.json(row || {})
  })
})

// Update company information
router.put('/societe/info', authMiddleware, adminMiddleware, (req, res) => {
  const { nom, adresse, ville, code_postal, pays, telephone, email, fax, siret, tva_intracommunautaire, capital_social, logo_url, remarques } = req.body

  // Check if company info exists
  db.get('SELECT id FROM societe LIMIT 1', [], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur serveur' })
    }

    if (row) {
      // Update existing
      db.run(
        `UPDATE societe 
         SET nom = ?, adresse = ?, ville = ?, code_postal = ?, pays = ?, 
             telephone = ?, email = ?, fax = ?, siret = ?, tva_intracommunautaire = ?, 
             capital_social = ?, logo_url = ?, remarques = ?
         WHERE id = ?`,
        [nom, adresse, ville, code_postal, pays, telephone, email, fax, siret, tva_intracommunautaire, capital_social, logo_url, remarques, row.id],
        (err) => {
          if (err) {
            return res.status(500).json({ message: 'Erreur lors de la mise à jour' })
          }
          res.json({ message: 'Informations société mises à jour' })
        }
      )
    } else {
      // Insert new
      db.run(
        `INSERT INTO societe (nom, adresse, ville, code_postal, pays, telephone, email, fax, siret, tva_intracommunautaire, capital_social, logo_url, remarques)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [nom, adresse, ville, code_postal, pays, telephone, email, fax, siret, tva_intracommunautaire, capital_social, logo_url, remarques],
        (err) => {
          if (err) {
            return res.status(500).json({ message: 'Erreur lors de la création' })
          }
          res.json({ message: 'Informations société créées' })
        }
      )
    }
  })
})

// Get all TVA rates
router.get('/tva/all', authMiddleware, (req, res) => {
  db.all('SELECT * FROM tva WHERE actif = 1 ORDER BY taux', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des taux TVA' })
    }
    res.json(rows)
  })
})

// Create TVA rate
router.post('/tva', authMiddleware, adminMiddleware, [
  body('code').notEmpty().withMessage('Code requis'),
  body('taux').isFloat({ min: 0, max: 100 }).withMessage('Taux valide requis')
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { code, taux, description } = req.body

  db.run(
    'INSERT INTO tva (code, taux, description) VALUES (?, ?, ?)',
    [code, taux, description],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ message: 'Code TVA déjà utilisé' })
        }
        return res.status(500).json({ message: 'Erreur lors de la création du taux TVA' })
      }
      
      db.get('SELECT * FROM tva WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          return res.status(500).json({ message: 'Erreur serveur' })
        }
        res.status(201).json(row)
      })
    }
  )
})

// Update TVA rate
router.put('/tva/:id', authMiddleware, adminMiddleware, [
  body('taux').isFloat({ min: 0, max: 100 }).withMessage('Taux valide requis')
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { taux, description, actif } = req.body

  db.run(
    'UPDATE tva SET taux = ?, description = ?, actif = ? WHERE id = ?',
    [taux, description, actif !== undefined ? actif : 1, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la mise à jour du taux TVA' })
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Taux TVA non trouvé' })
      }
      
      res.json({ message: 'Taux TVA mis à jour avec succès' })
    }
  )
})

// Delete TVA rate
router.delete('/tva/:id', authMiddleware, adminMiddleware, (req, res) => {
  db.run('UPDATE tva SET actif = 0 WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la suppression du taux TVA' })
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Taux TVA non trouvé' })
    }
    
    res.json({ message: 'Taux TVA supprimé avec succès' })
  })
})

// Get all users
router.get('/users/all', authMiddleware, adminMiddleware, (req, res) => {
  db.all('SELECT id, username, email, nom_complet, role, actif, date_creation, derniere_connexion FROM users ORDER BY username', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' })
    }
    res.json(rows)
  })
})

// Create user
router.post('/users', authMiddleware, adminMiddleware, [
  body('username').notEmpty().withMessage('Nom d\'utilisateur requis'),
  body('email').isEmail().withMessage('Email valide requis'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe minimum 6 caractères')
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const bcrypt = require('bcryptjs')
  const { username, email, password, nom_complet, role } = req.body

  const passwordHash = bcrypt.hashSync(password, 10)

  db.run(
    'INSERT INTO users (username, email, password_hash, nom_complet, role) VALUES (?, ?, ?, ?, ?)',
    [username, email, passwordHash, nom_complet, role || 'USER'],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ message: 'Nom d\'utilisateur ou email déjà utilisé' })
        }
        return res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur' })
      }
      
      db.get('SELECT id, username, email, nom_complet, role FROM users WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          return res.status(500).json({ message: 'Erreur serveur' })
        }
        res.status(201).json(row)
      })
    }
  )
})

// Update user
router.put('/users/:id', authMiddleware, adminMiddleware, (req, res) => {
  const { email, nom_complet, role, actif } = req.body

  db.run(
    'UPDATE users SET email = ?, nom_complet = ?, role = ?, actif = ? WHERE id = ?',
    [email, nom_complet, role, actif !== undefined ? actif : 1, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur' })
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' })
      }
      
      res.json({ message: 'Utilisateur mis à jour avec succès' })
    }
  )
})

// Delete user
router.delete('/users/:id', authMiddleware, adminMiddleware, (req, res) => {
  db.run('UPDATE users SET actif = 0 WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' })
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' })
    }
    
    res.json({ message: 'Utilisateur supprimé avec succès' })
  })
})

// Database backup
router.post('/backup', authMiddleware, adminMiddleware, (req, res) => {
  const fs = require('fs')
  const path = require('path')
  
  const dbPath = path.join(__dirname, '../../database/gest_irigation.db')
  const backupDir = path.join(__dirname, '../../backups')
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }
  
  const backupFile = path.join(backupDir, `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.db`)
  
  try {
    fs.copyFileSync(dbPath, backupFile)
    res.json({ message: 'Sauvegarde créée avec succès', fichier: backupFile })
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de la sauvegarde' })
  }
})

module.exports = router