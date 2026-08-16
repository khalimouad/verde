const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const fs = require('fs')

const dbPath = path.join(__dirname, '../../database/gest_irigation.db')

// Ensure database directory exists
const dbDir = path.dirname(dbPath)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message)
  } else {
    console.log('✅ Connected to SQLite database')
    initializeDatabase()
  }
})

// Initialize database tables
function initializeDatabase() {
  const schema = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      nom_complet VARCHAR(200),
      role VARCHAR(20) DEFAULT 'USER',
      actif BOOLEAN DEFAULT 1,
      date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
      derniere_connexion DATETIME
    );

    -- Clients table
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code VARCHAR(50) UNIQUE NOT NULL,
      nom VARCHAR(200) NOT NULL,
      adresse TEXT,
      ville VARCHAR(100),
      code_postal VARCHAR(20),
      pays VARCHAR(50),
      telephone VARCHAR(20),
      email VARCHAR(100),
      fax VARCHAR(20),
      contact VARCHAR(100),
      ice VARCHAR(50),
      credit_limite DECIMAL(15,2) DEFAULT 0,
      solde DECIMAL(15,2) DEFAULT 0,
      remarques TEXT,
      actif BOOLEAN DEFAULT 1,
      date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
      date_modification DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Products table
    CREATE TABLE IF NOT EXISTS produits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code VARCHAR(50) UNIQUE NOT NULL,
      designation VARCHAR(200) NOT NULL,
      description TEXT,
      famille_id INTEGER,
      categorie_id INTEGER,
      marque_id INTEGER,
      prix_vente DECIMAL(15,2) NOT NULL,
      prix_achat DECIMAL(15,2),
      unite_mesure VARCHAR(20),
      stock_actuel INTEGER DEFAULT 0,
      stock_min INTEGER DEFAULT 0,
      stock_max INTEGER DEFAULT 0,
      tva_id INTEGER,
      actif BOOLEAN DEFAULT 1,
      image_url VARCHAR(255),
      remarques TEXT,
      date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
      date_modification DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Families table
    CREATE TABLE IF NOT EXISTS familles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code VARCHAR(50) UNIQUE NOT NULL,
      nom VARCHAR(100) NOT NULL,
      description TEXT,
      actif BOOLEAN DEFAULT 1
    );

    -- Categories table
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code VARCHAR(50) UNIQUE NOT NULL,
      nom VARCHAR(100) NOT NULL,
      famille_id INTEGER,
      description TEXT,
      actif BOOLEAN DEFAULT 1
    );

    -- Brands table
    CREATE TABLE IF NOT EXISTS marques (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code VARCHAR(50) UNIQUE NOT NULL,
      nom VARCHAR(100) NOT NULL,
      description TEXT,
      actif BOOLEAN DEFAULT 1
    );

    -- Sales table
    CREATE TABLE IF NOT EXISTS ventes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero VARCHAR(50) UNIQUE NOT NULL,
      client_id INTEGER NOT NULL,
      date_vente DATETIME NOT NULL,
      montant_ht DECIMAL(15,2) DEFAULT 0,
      montant_tva DECIMAL(15,2) DEFAULT 0,
      montant_ttc DECIMAL(15,2) DEFAULT 0,
      remise DECIMAL(15,2) DEFAULT 0,
      statut VARCHAR(20) DEFAULT 'EN_COURS',
      remarques TEXT,
      date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
      date_modification DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id)
    );

    -- Sale lines table
    CREATE TABLE IF NOT EXISTS ligne_ventes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vente_id INTEGER NOT NULL,
      produit_id INTEGER NOT NULL,
      quantite INTEGER NOT NULL,
      prix_unitaire DECIMAL(15,2) NOT NULL,
      remise DECIMAL(15,2) DEFAULT 0,
      total_ht DECIMAL(15,2) NOT NULL,
      total_tva DECIMAL(15,2) DEFAULT 0,
      total_ttc DECIMAL(15,2) NOT NULL,
      remarques TEXT,
      FOREIGN KEY (vente_id) REFERENCES ventes(id) ON DELETE CASCADE,
      FOREIGN KEY (produit_id) REFERENCES produits(id)
    );

    -- Invoices table
    CREATE TABLE IF NOT EXISTS factures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero VARCHAR(50) UNIQUE NOT NULL,
      vente_id INTEGER,
      client_id INTEGER NOT NULL,
      date_facture DATETIME NOT NULL,
      date_echeance DATETIME,
      montant_ht DECIMAL(15,2) DEFAULT 0,
      montant_tva DECIMAL(15,2) DEFAULT 0,
      montant_ttc DECIMAL(15,2) DEFAULT 0,
      montant_paye DECIMAL(15,2) DEFAULT 0,
      montant_reste DECIMAL(15,2) DEFAULT 0,
      statut VARCHAR(20) DEFAULT 'NON_PAYE',
      remarques TEXT,
      date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
      date_modification DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vente_id) REFERENCES ventes(id),
      FOREIGN KEY (client_id) REFERENCES clients(id)
    );

    -- Delivery Notes (Bon Livraison) table
    CREATE TABLE IF NOT EXISTS bons_livraison (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero VARCHAR(50) UNIQUE NOT NULL,
      type VARCHAR(20) NOT NULL,
      reference_id INTEGER NOT NULL,
      date_livraison DATETIME NOT NULL,
      montant_ht DECIMAL(15,2) DEFAULT 0,
      montant_tva DECIMAL(15,2) DEFAULT 0,
      montant_ttc DECIMAL(15,2) DEFAULT 0,
      statut VARCHAR(20) DEFAULT 'LIVRE',
      remarques TEXT,
      date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
      date_modification DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Delivery Note Lines table
    CREATE TABLE IF NOT EXISTS ligne_bons_livraison (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bon_livraison_id INTEGER NOT NULL,
      produit_id INTEGER NOT NULL,
      quantite INTEGER NOT NULL,
      prix_unitaire DECIMAL(15,2) NOT NULL,
      total_ht DECIMAL(15,2) NOT NULL,
      total_tva DECIMAL(15,2) DEFAULT 0,
      total_ttc DECIMAL(15,2) NOT NULL,
      FOREIGN KEY (bon_livraison_id) REFERENCES bons_livraison(id) ON DELETE CASCADE,
      FOREIGN KEY (produit_id) REFERENCES produits(id)
    );

    -- Invoice lines table
    CREATE TABLE IF NOT EXISTS ligne_factures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facture_id INTEGER NOT NULL,
      produit_id INTEGER NOT NULL,
      quantite INTEGER NOT NULL,
      prix_unitaire DECIMAL(15,2) NOT NULL,
      remise DECIMAL(15,2) DEFAULT 0,
      total_ht DECIMAL(15,2) NOT NULL,
      total_tva DECIMAL(15,2) DEFAULT 0,
      total_ttc DECIMAL(15,2) NOT NULL,
      FOREIGN KEY (facture_id) REFERENCES factures(id) ON DELETE CASCADE,
      FOREIGN KEY (produit_id) REFERENCES produits(id)
    );

    -- Suppliers table
    CREATE TABLE IF NOT EXISTS fournisseurs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code VARCHAR(50) UNIQUE NOT NULL,
      nom VARCHAR(200) NOT NULL,
      adresse TEXT,
      ville VARCHAR(100),
      code_postal VARCHAR(20),
      pays VARCHAR(50),
      telephone VARCHAR(20),
      email VARCHAR(100),
      fax VARCHAR(20),
      contact VARCHAR(100),
      ice VARCHAR(50),
      delai_livraison INTEGER DEFAULT 0,
      remarques TEXT,
      actif BOOLEAN DEFAULT 1,
      date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
      date_modification DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Stock table
    CREATE TABLE IF NOT EXISTS stock (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      produit_id INTEGER NOT NULL UNIQUE,
      quantite INTEGER DEFAULT 0,
      valeur_totale DECIMAL(15,2) DEFAULT 0,
      derniere_maj DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (produit_id) REFERENCES produits(id)
    );

    -- Purchase Orders (Bon Commande) table
    CREATE TABLE IF NOT EXISTS bons_commande (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero VARCHAR(50) UNIQUE NOT NULL,
      fournisseur_id INTEGER NOT NULL,
      date_commande DATETIME NOT NULL,
      date_livraison_prevue DATETIME,
      montant_ht DECIMAL(15,2) DEFAULT 0,
      montant_tva DECIMAL(15,2) DEFAULT 0,
      montant_ttc DECIMAL(15,2) DEFAULT 0,
      statut VARCHAR(20) DEFAULT 'EN_COURS',
      remarques TEXT,
      date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
      date_modification DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id)
    );

    -- Purchase Order Lines table
    CREATE TABLE IF NOT EXISTS ligne_bons_commande (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bon_commande_id INTEGER NOT NULL,
      produit_id INTEGER NOT NULL,
      quantite INTEGER NOT NULL,
      prix_unitaire DECIMAL(15,2) NOT NULL,
      remise DECIMAL(15,2) DEFAULT 0,
      total_ht DECIMAL(15,2) NOT NULL,
      total_tva DECIMAL(15,2) DEFAULT 0,
      total_ttc DECIMAL(15,2) NOT NULL,
      FOREIGN KEY (bon_commande_id) REFERENCES bons_commande(id) ON DELETE CASCADE,
      FOREIGN KEY (produit_id) REFERENCES produits(id)
    );

    -- Stock movements table
    CREATE TABLE IF NOT EXISTS mouvements_stock (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      produit_id INTEGER NOT NULL,
      type VARCHAR(20) NOT NULL,
      quantite INTEGER NOT NULL,
      reference_type VARCHAR(50),
      reference_id INTEGER,
      date_mouvement DATETIME DEFAULT CURRENT_TIMESTAMP,
      remarques TEXT,
      FOREIGN KEY (produit_id) REFERENCES produits(id)
    );

    -- Payments table
    CREATE TABLE IF NOT EXISTS reglements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero VARCHAR(50) UNIQUE NOT NULL,
      facture_id INTEGER,
      client_id INTEGER NOT NULL,
      date_reglement DATETIME NOT NULL,
      montant DECIMAL(15,2) NOT NULL,
      mode_paiement VARCHAR(50),
      reference_paiement VARCHAR(100),
      remarques TEXT,
      date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (facture_id) REFERENCES factures(id),
      FOREIGN KEY (client_id) REFERENCES clients(id)
    );

    -- VAT table
    CREATE TABLE IF NOT EXISTS tva (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code VARCHAR(50) UNIQUE NOT NULL,
      taux DECIMAL(5,2) NOT NULL,
      description VARCHAR(100),
      actif BOOLEAN DEFAULT 1
    );

    -- Quotations table
    CREATE TABLE IF NOT EXISTS devis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero VARCHAR(50) UNIQUE NOT NULL,
      client_id INTEGER NOT NULL,
      date_devis DATETIME NOT NULL,
      date_validite DATETIME,
      montant_ht DECIMAL(15,2) DEFAULT 0,
      montant_tva DECIMAL(15,2) DEFAULT 0,
      montant_ttc DECIMAL(15,2) DEFAULT 0,
      statut VARCHAR(20) DEFAULT 'EN_ATTENTE',
      remarques TEXT,
      date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
      date_modification DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id)
    );

    -- Quotation lines table
    CREATE TABLE IF NOT EXISTS ligne_devis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      devis_id INTEGER NOT NULL,
      produit_id INTEGER NOT NULL,
      quantite INTEGER NOT NULL,
      prix_unitaire DECIMAL(15,2) NOT NULL,
      remise DECIMAL(15,2) DEFAULT 0,
      total_ht DECIMAL(15,2) NOT NULL,
      total_tva DECIMAL(15,2) DEFAULT 0,
      total_ttc DECIMAL(15,2) NOT NULL,
      FOREIGN KEY (devis_id) REFERENCES devis(id) ON DELETE CASCADE,
      FOREIGN KEY (produit_id) REFERENCES produits(id)
    );

    -- Parameters table
    CREATE TABLE IF NOT EXISTS parametres (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code VARCHAR(50) UNIQUE NOT NULL,
      valeur TEXT,
      description TEXT,
      type VARCHAR(20) DEFAULT 'TEXTE'
    );

    -- Company table
    CREATE TABLE IF NOT EXISTS societe (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom VARCHAR(200) NOT NULL,
      adresse TEXT,
      ville VARCHAR(100),
      code_postal VARCHAR(20),
      pays VARCHAR(50),
      telephone VARCHAR(20),
      email VARCHAR(100),
      fax VARCHAR(20),
      siret VARCHAR(50),
      tva_intracommunautaire VARCHAR(50),
      capital_social DECIMAL(15,2),
      logo_url VARCHAR(255),
      remarques TEXT
    );
  `

  db.exec(schema, (err) => {
    if (err) {
      console.error('Error creating tables:', err.message)
    } else {
      console.log('✅ Database tables initialized')
      createDefaultAdmin()
      createDefaultTVA()
    }
  })
}

// Create default admin user
function createDefaultAdmin() {
  const bcrypt = require('bcryptjs')
  const passwordHash = bcrypt.hashSync('admin123', 10)
  
  db.get('SELECT id FROM users WHERE username = ?', ['admin'], (err, row) => {
    if (err) {
      console.error('Error checking admin user:', err.message)
    } else if (!row) {
      db.run(
        'INSERT INTO users (username, email, password_hash, nom_complet, role) VALUES (?, ?, ?, ?, ?)',
        ['admin', 'admin@gest-irigation.com', passwordHash, 'Administrateur', 'ADMIN'],
        (err) => {
          if (err) {
            console.error('Error creating admin user:', err.message)
          } else {
            console.log('✅ Default admin user created (username: admin, password: admin123)')
          }
        }
      )
    }
  })
}

// Create default TVA rates
function createDefaultTVA() {
  const tvaRates = [
    { code: 'TVA20', taux: 20, description: 'TVA standard 20%' },
    { code: 'TVA10', taux: 10, description: 'TVA réduite 10%' },
    { code: 'TVA55', taux: 5.5, description: 'TVA super réduite 5.5%' }
  ]

  tvaRates.forEach(tva => {
    db.get('SELECT id FROM tva WHERE code = ?', [tva.code], (err, row) => {
      if (err) {
        console.error('Error checking TVA rate:', err.message)
      } else if (!row) {
        db.run(
          'INSERT INTO tva (code, taux, description) VALUES (?, ?, ?)',
          [tva.code, tva.taux, tva.description],
          (err) => {
            if (err) {
              console.error('Error creating TVA rate:', err.message)
            }
          }
        )
      }
    })
  })
}

module.exports = db