const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../middleware/auth')
const db = require('../config/database')

// Sales report
router.get('/ventes', authMiddleware, (req, res) => {
  const { date_debut, date_fin } = req.query
  
  let query = `SELECT v.*, c.nom as client_nom 
               FROM ventes v
               JOIN clients c ON v.client_id = c.id`
  let params = []
  
  if (date_debut && date_fin) {
    query += ' WHERE v.date_vente BETWEEN ? AND ?'
    params = [date_debut, date_fin]
  }
  
  query += ' ORDER BY v.date_vente DESC'
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la génération du rapport' })
    }
    
    // Calculate totals
    const totalHT = rows.reduce((sum, row) => sum + (row.montant_ht || 0), 0)
    const totalTVA = rows.reduce((sum, row) => sum + (row.montant_tva || 0), 0)
    const totalTTC = rows.reduce((sum, row) => sum + (row.montant_ttc || 0), 0)
    
    res.json({
      ventes: rows,
      totaux: { totalHT, totalTVA, totalTTC },
      nombre_ventes: rows.length
    })
  })
})

// Stock report
router.get('/stock', authMiddleware, (req, res) => {
  db.all(`SELECT s.*, p.code, p.designation, p.famille_id, p.categorie_id, f.nom as famille_nom, c.nom as categorie_nom
          FROM stock s
          JOIN produits p ON s.produit_id = p.id
          LEFT JOIN familles f ON p.famille_id = f.id
          LEFT JOIN categories c ON p.categorie_id = c.id
          WHERE p.actif = 1
          ORDER BY p.designation`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la génération du rapport' })
    }
    
    const totalQuantite = rows.reduce((sum, row) => sum + (row.quantite || 0), 0)
    const totalValeur = rows.reduce((sum, row) => sum + ((row.quantite || 0) * (row.prix_achat || 0)), 0)
    
    // Low stock items
    const lowStock = rows.filter(row => row.quantite <= (row.stock_min || 0))
    
    res.json({
      stock: rows,
      totaux: { totalQuantite, totalValeur },
      alertes: lowStock.length,
      articles_en_rupture: lowStock
    })
  })
})

// Clients report
router.get('/clients', authMiddleware, (req, res) => {
  db.all(`SELECT c.*, 
          COUNT(DISTINCT v.id) as nombre_ventes,
          COALESCE(SUM(v.montant_ttc), 0) as total_achats
          FROM clients c
          LEFT JOIN ventes v ON c.id = v.client_id
          WHERE c.actif = 1
          GROUP BY c.id
          ORDER BY total_achats DESC`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la génération du rapport' })
    }
    
    const totalClients = rows.length
    const totalAchats = rows.reduce((sum, row) => sum + (row.total_achats || 0), 0)
    
    res.json({
      clients: rows,
      totaux: { totalClients, totalAchats }
    })
  })
})

// Invoices report
router.get('/factures', authMiddleware, (req, res) => {
  const { date_debut, date_fin, statut } = req.query
  
  let query = `SELECT f.*, c.nom as client_nom 
               FROM factures f
               JOIN clients c ON f.client_id = c.id`
  let params = []
  let conditions = []
  
  if (date_debut && date_fin) {
    conditions.push('f.date_facture BETWEEN ? AND ?')
    params.push(date_debut, date_fin)
  }
  
  if (statut) {
    conditions.push('f.statut = ?')
    params.push(statut)
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ')
  }
  
  query += ' ORDER BY f.date_facture DESC'
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la génération du rapport' })
    }
    
    const totalEmis = rows.reduce((sum, row) => sum + (row.montant_ttc || 0), 0)
    const totalPaye = rows.reduce((sum, row) => sum + (row.montant_paye || 0), 0)
    const totalReste = rows.reduce((sum, row) => sum + (row.montant_reste || 0), 0)
    
    const facturesNonPayees = rows.filter(row => row.statut !== 'PAYE')
    
    res.json({
      factures: rows,
      totaux: { totalEmis, totalPaye, totalReste },
      factures_en_attente: facturesNonPayees.length
    })
  })
})

// Suppliers report
router.get('/fournisseurs', authMiddleware, (req, res) => {
  db.all('SELECT * FROM fournisseurs WHERE actif = 1 ORDER BY nom', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la génération du rapport' })
    }
    
    res.json({
      fournisseurs: rows,
      total: rows.length
    })
  })
})

// Financial report
router.get('/financier', authMiddleware, (req, res) => {
  const { date_debut, date_fin } = req.query
  
  // Get sales
  let ventesQuery = 'SELECT COALESCE(SUM(montant_ttc), 0) as total_ventes FROM ventes'
  let ventesParams = []
  
  if (date_debut && date_fin) {
    ventesQuery += ' WHERE date_vente BETWEEN ? AND ?'
    ventesParams = [date_debut, date_fin]
  }
  
  // Get payments
  let reglementsQuery = 'SELECT COALESCE(SUM(montant), 0) as total_reglements FROM reglements'
  let reglementsParams = []
  
  if (date_debut && date_fin) {
    reglementsQuery += ' WHERE date_reglement BETWEEN ? AND ?'
    reglementsParams = [date_debut, date_fin]
  }
  
  // Get unpaid invoices
  db.all('SELECT COALESCE(SUM(montant_reste), 0) as total_impayes FROM factures WHERE statut != "PAYE"', [], (err, unpaidRows) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la génération du rapport' })
    }
    
    const totalImpayes = unpaidRows[0]?.total_impayes || 0
    
    db.get(ventesQuery, ventesParams, (err, ventesRow) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la génération du rapport' })
      }
      
      db.get(reglementsQuery, reglementsParams, (err, reglementsRow) => {
        if (err) {
          return res.status(500).json({ message: 'Erreur lors de la génération du rapport' })
        }
        
        res.json({
          ventes: ventesRow?.total_ventes || 0,
          reglements: reglementsRow?.total_reglements || 0,
          impayes: totalImpayes,
          cash_flow: (reglementsRow?.total_reglements || 0) - (ventesRow?.total_ventes || 0)
        })
      })
    })
  })
})

module.exports = router