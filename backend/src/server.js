require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

// Import routes
const authRoutes = require('./routes/auth')
const clientRoutes = require('./routes/clients')
const produitRoutes = require('./routes/produits')
const venteRoutes = require('./routes/ventes')
const factureRoutes = require('./routes/factures')
const stockRoutes = require('./routes/stock')
const fournisseurRoutes = require('./routes/fournisseurs')
const devisRoutes = require('./routes/devis')
const bonLivraisonRoutes = require('./routes/bonslivraison')
const bonCommandeRoutes = require('./routes/bonscommande')
const rapportRoutes = require('./routes/rapports')
const parametreRoutes = require('./routes/parametres')

// Initialize database
const db = require('./config/database')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Gest Irrigation API is running' })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/clients', clientRoutes)
app.use('/api/produits', produits)
app.use('/api/ventes', venteRoutes)
app.use('/api/factures', factureRoutes)
app.use('/api/stock', stockRoutes)
app.use('/api/fournisseurs', fournisseurRoutes)
app.use('/api/devis', devisRoutes)
app.use('/api/bons-livraison', bonLivraisonRoutes)
app.use('/api/bons-commande', bonCommandeRoutes)
app.use('/api/rapports', rapportRoutes)
app.use('/api/parametres', parametreRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    message: err.message || 'Erreur serveur interne',
    error: process.env.NODE_ENV === 'development' ? err : {}
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV}`)
  console.log(`🗄️  Database: ${process.env.DB_PATH}`)
})