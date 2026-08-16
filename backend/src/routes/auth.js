const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const db = require('../config/database')

// Login
router.post('/login', [
  body('username').notEmpty().withMessage('Nom d\'utilisateur requis'),
  body('password').notEmpty().withMessage('Mot de passe requis')
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { username, password } = req.body

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur serveur' })
    }

    if (!user) {
      return res.status(401).json({ message: 'Identifiants incorrects' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Identifiants incorrects' })
    }

    if (!user.actif) {
      return res.status(403).json({ message: 'Compte désactivé' })
    }

    // Update last connection
    db.run('UPDATE users SET derniere_connexion = CURRENT_TIMESTAMP WHERE id = ?', [user.id])

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nom_complet: user.nom_complet,
        role: user.role
      }
    })
  })
})

// Get current user
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant' })
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    db.get('SELECT id, username, email, nom_complet, role FROM users WHERE id = ?', [decoded.userId], (err, user) => {
      if (err || !user) {
        return res.status(401).json({ message: 'Utilisateur non trouvé' })
      }
      
      res.json(user)
    })
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide' })
  }
})

// Logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Déconnexion réussie' })
})

module.exports = router