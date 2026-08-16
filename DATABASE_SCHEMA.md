# Database Schema Design
# Based on existing WebDev HyperFileSQL structure

## Core Business Tables

### Clients
```sql
CREATE TABLE clients (
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
    credit_limite DECIMAL(15,2) DEFAULT 0,
    solde DECIMAL(15,2) DEFAULT 0,
    remarques TEXT,
    actif BOOLEAN DEFAULT true,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Products
```sql
CREATE TABLE produits (
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
    actif BOOLEAN DEFAULT true,
    image_url VARCHAR(255),
    remarques TEXT,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (famille_id) REFERENCES familles(id),
    FOREIGN KEY (categorie_id) REFERENCES categories(id),
    FOREIGN KEY (marque_id) REFERENCES marques(id),
    FOREIGN KEY (tva_id) REFERENCES tva(id)
);
```

### Families (Product Categories)
```sql
CREATE TABLE familles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    actif BOOLEAN DEFAULT true
);
```

### Categories
```sql
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    famille_id INTEGER,
    description TEXT,
    actif BOOLEAN DEFAULT true,
    FOREIGN KEY (famille_id) REFERENCES familles(id)
);
```

### Brands
```sql
CREATE TABLE marques (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    actif BOOLEAN DEFAULT true
);
```

### Sales (Ventes)
```sql
CREATE TABLE ventes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero VARCHAR(50) UNIQUE NOT NULL,
    client_id INTEGER NOT NULL,
    date_vente DATETIME NOT NULL,
    montant_ht DECIMAL(15,2) DEFAULT 0,
    montant_tva DECIMAL(15,2) DEFAULT 0,
    montant_ttc DECIMAL(15,2) DEFAULT 0,
    remise DECIMAL(15,2) DEFAULT 0,
    statut VARCHAR(20) DEFAULT 'EN_COURS', -- EN_COURS, FACTURE, ANNULE
    remarques TEXT,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
);
```

### Sale Lines (Ligne Vente)
```sql
CREATE TABLE ligne_ventes (
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
```

### Invoices (Factures)
```sql
CREATE TABLE factures (
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
    statut VARCHAR(20) DEFAULT 'NON_PAYE', -- NON_PAYE, PARTIEL, PAYE
    remarques TEXT,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vente_id) REFERENCES ventes(id),
    FOREIGN KEY (client_id) REFERENCES clients(id)
);
```

### Invoice Lines (Ligne Facture)
```sql
CREATE TABLE ligne_factures (
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
```

### Suppliers (Fournisseurs)
```sql
CREATE TABLE fournisseurs (
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
    delai_livraison INTEGER DEFAULT 0,
    remarques TEXT,
    actif BOOLEAN DEFAULT true,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Purchase Orders (Bon Commande)
```sql
CREATE TABLE bons_commande (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero VARCHAR(50) UNIQUE NOT NULL,
    fournisseur_id INTEGER NOT NULL,
    date_commande DATETIME NOT NULL,
    date_livraison_prevue DATETIME,
    montant_ht DECIMAL(15,2) DEFAULT 0,
    montant_tva DECIMAL(15,2) DEFAULT 0,
    montant_ttc DECIMAL(15,2) DEFAULT 0,
    statut VARCHAR(20) DEFAULT 'EN_COURS', -- EN_COURS, RECU, ANNULE
    remarques TEXT,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id)
);
```

### Purchase Order Lines (Ligne Bon Commande)
```sql
CREATE TABLE ligne_bons_commande (
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
```

### Delivery Notes (Bon Livraison)
```sql
CREATE TABLE bons_livraison (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL, -- VENTE, ACHAT
    reference_id INTEGER NOT NULL, -- vente_id or bon_commande_id
    date_livraison DATETIME NOT NULL,
    montant_ht DECIMAL(15,2) DEFAULT 0,
    montant_tva DECIMAL(15,2) DEFAULT 0,
    montant_ttc DECIMAL(15,2) DEFAULT 0,
    statut VARCHAR(20) DEFAULT 'LIVRE',
    remarques TEXT,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Delivery Note Lines (Ligne Bon Livraison)
```sql
CREATE TABLE ligne_bons_livraison (
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
```

### Stock
```sql
CREATE TABLE stock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produit_id INTEGER NOT NULL UNIQUE,
    quantite INTEGER DEFAULT 0,
    valeur_totale DECIMAL(15,2) DEFAULT 0,
    derniere_maj DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produit_id) REFERENCES produits(id)
);
```

### Stock Movements (Mouvements Stock)
```sql
CREATE TABLE mouvements_stock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produit_id INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL, -- ENTREE, SORTIE
    quantite INTEGER NOT NULL,
    reference_type VARCHAR(50), -- VENTE, ACHAT, INVENTAIRE, AJUSTEMENT
    reference_id INTEGER,
    date_mouvement DATETIME DEFAULT CURRENT_TIMESTAMP,
    remarques TEXT,
    FOREIGN KEY (produit_id) REFERENCES produits(id)
);
```

### Payments (Reglements)
```sql
CREATE TABLE reglements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero VARCHAR(50) UNIQUE NOT NULL,
    facture_id INTEGER,
    client_id INTEGER NOT NULL,
    date_reglement DATETIME NOT NULL,
    montant DECIMAL(15,2) NOT NULL,
    mode_paiement VARCHAR(50), -- ESPECES, CHEQUE, VIREMENT, CARTE
    reference_paiement VARCHAR(100),
    remarques TEXT,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facture_id) REFERENCES factures(id),
    FOREIGN KEY (client_id) REFERENCES clients(id)
);
```

### VAT Rates (TVA)
```sql
CREATE TABLE tva (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    taux DECIMAL(5,2) NOT NULL,
    description VARCHAR(100),
    actif BOOLEAN DEFAULT true
);
```

### Quotations (Devis)
```sql
CREATE TABLE devis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero VARCHAR(50) UNIQUE NOT NULL,
    client_id INTEGER NOT NULL,
    date_devis DATETIME NOT NULL,
    date_validite DATETIME,
    montant_ht DECIMAL(15,2) DEFAULT 0,
    montant_tva DECIMAL(15,2) DEFAULT 0,
    montant_ttc DECIMAL(15,2) DEFAULT 0,
    statut VARCHAR(20) DEFAULT 'EN_ATTENTE', -- EN_ATTENTE, ACCEPTE, REFUSE, EXPIRE
    remarques TEXT,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
);
```

### Quotation Lines (Ligne Devis)
```sql
CREATE TABLE ligne_devis (
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
```

### Inventory (Inventaire)
```sql
CREATE TABLE inventaires (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero VARCHAR(50) UNIQUE NOT NULL,
    date_inventaire DATETIME NOT NULL,
    statut VARCHAR(20) DEFAULT 'EN_COURS', -- EN_COURS, TERMINE
    remarques TEXT,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Inventory Lines (Ligne Inventaire)
```sql
CREATE TABLE ligne_inventaires (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inventaire_id INTEGER NOT NULL,
    produit_id INTEGER NOT NULL,
    quantite_theorique INTEGER NOT NULL,
    quantite_reelle INTEGER NOT NULL,
    difference INTEGER NOT NULL,
    valeur_difference DECIMAL(15,2) DEFAULT 0,
    FOREIGN KEY (inventaire_id) REFERENCES inventaires(id) ON DELETE CASCADE,
    FOREIGN KEY (produit_id) REFERENCES produits(id)
);
```

### System Parameters (Parametres)
```sql
CREATE TABLE parametres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    valeur TEXT,
    description TEXT,
    type VARCHAR(20) DEFAULT 'TEXTE' -- TEXTE, NOMBRE, DATE, BOOLEAN
);
```

### Company Information (Societe)
```sql
CREATE TABLE societe (
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
```

### Units of Measure (Unites)
```sql
CREATE TABLE unites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    abreviation VARCHAR(20),
    actif BOOLEAN DEFAULT true
);
```

### Product Attributes (Tailles, Couleurs, Mesures)
```sql
CREATE TABLE tailles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    actif BOOLEAN DEFAULT true
);

CREATE TABLE couleurs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    code_hex VARCHAR(7),
    actif BOOLEAN DEFAULT true
);

CREATE TABLE mesures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    actif BOOLEAN DEFAULT true
);
```

### Treatment/Processing (Traitement)
```sql
CREATE TABLE traitements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    cout DECIMAL(15,2) DEFAULT 0,
    actif BOOLEAN DEFAULT true
);
```

### Users (for authentication)
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nom_complet VARCHAR(200),
    role VARCHAR(20) DEFAULT 'USER', -- ADMIN, USER, VIEWER
    actif BOOLEAN DEFAULT true,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    derniere_connexion DATETIME
);
```

## Indexes for Performance
```sql
CREATE INDEX idx_ventes_client ON ventes(client_id);
CREATE INDEX idx_ventes_date ON ventes(date_vente);
CREATE INDEX idx_factures_client ON factures(client_id);
CREATE INDEX idx_factures_date ON factures(date_facture);
CREATE INDEX idx_ligne_ventes_vente ON ligne_ventes(vente_id);
CREATE INDEX idx_ligne_ventes_produit ON ligne_ventes(produit_id);
CREATE INDEX idx_stock_produit ON stock(produit_id);
CREATE INDEX idx_mouvements_stock_produit ON mouvements_stock(produit_id);
CREATE INDEX idx_mouvements_stock_date ON mouvements_stock(date_mouvement);
```