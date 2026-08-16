const jwt = require('jsonwebtoken')
const db = require('../config/database')

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant' })
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    db.get('SELECT id, username, email, role FROM users WHERE id = ?', [decoded.userId], (err, user) => {
      if (err || !user) {
        return res.status(401).json({ message: 'Utilisateur non trouvé' })
      }
      
      req.user = user
      next()
    })
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide' })
  }
}

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Accès non autorisé' })
  }
  next()
}

module.exports = { authMiddleware, adminMiddleware }