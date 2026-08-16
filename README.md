# Gest Irrigation Web - Enterprise Management System

A modern, web-based enterprise management system for irrigation businesses, built with Vue.js, Element Plus, Node.js/Express, and SQLite.

## 🚀 Features

### Core Business Functions
- **Client Management** - Complete CRM with contact details, ICE numbers, and credit management
- **Product Management** - Catalog with families, categories, brands, and stock tracking
- **Sales Management** - Full sales cycle from quotation to invoicing
- **Inventory Management** - Real-time stock tracking with low-stock alerts
- **Supplier Management** - Purchase orders with ICE numbers and delivery tracking
- **Delivery Notes (Bon Livraison)** - Customer deliveries and supplier receipts with stock integration
- **Purchase Orders (Bon Commande)** - Supplier order management and tracking
- **Financial Management** - Invoicing, payments, and financial reporting
- **Quotations** - Professional quote generation with conversion to sales
- **Reporting** - Comprehensive business reports and analytics

### Technical Features
- **Modern Web Interface** - Responsive design using Vue.js + Element Plus
- **Mobile Ready** - Touch-friendly interface with mobile navigation
- **Local Database** - SQLite for easy deployment and data portability
- **Authentication** - Secure JWT-based authentication with role management
- **REST API** - Clean, well-documented API architecture
- **Real-time Updates** - Live stock tracking and business metrics
- **ICE Number Support** - Moroccan business identifier for clients and suppliers

## 📋 Tech Stack

### Frontend
- **Vue.js 3** - Progressive JavaScript framework
- **Element Plus** - Enterprise UI component library
- **Vue Router** - Client-side routing
- **Pinia** - State management
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **SQLite3** - Embedded database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## 🛠️ Installation

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager

### Setup Steps

1. **Clone the project**
```bash
cd gest_irigation_web
```

2. **Install frontend dependencies**
```bash
cd frontend
npm install
```

3. **Install backend dependencies**
```bash
cd ../backend
npm install
```

4. **Configure environment**
The backend includes a `.env` file with default configuration:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-this-in-production
DB_PATH=./database/gest_irigation.db
```

5. **Start the backend server**
```bash
cd backend
npm run dev
```

The backend will automatically:
- Create the SQLite database
- Initialize all tables
- Create default admin user (username: `admin`, password: `admin123`)
- Set up default TVA rates

6. **Start the frontend development server**
```bash
cd frontend
npm run dev
```

7. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Default login: `admin` / `admin123`

## 📁 Project Structure

```
gest_irigation_web/
├── frontend/                 # Vue.js frontend application
│   ├── src/
│   │   ├── components/      # Reusable Vue components
│   │   │   └── Layout.vue  # Main layout with navigation
│   │   ├── views/           # Page components
│   │   │   ├── Login.vue
│   │   │   ├── Dashboard.vue
│   │   │   ├── Clients.vue
│   │   │   ├── Produits.vue
│   │   │   ├── Ventes.vue
│   │   │   ├── Factures.vue
│   │   │   ├── Stock.vue
│   │   │   ├── Fournisseurs.vue
│   │   │   ├── BonsCommande.vue
│   │   │   ├── BonsLivraison.vue
│   │   │   ├── Devis.vue
│   │   │   ├── Rapports.vue
│   │   │   └── Parametres.vue
│   │   ├── router/          # Vue Router configuration
│   │   ├── store/           # Pinia stores
│   │   │   └── auth.js      # Authentication state
│   │   ├── api/             # API client configuration
│   │   ├── App.vue          # Root component
│   │   └── main.js          # Application entry point
│   ├── public/              # Static assets
│   ├── package.json
│   └── vite.config.js       # Vite configuration
├── backend/                  # Node.js/Express backend
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   │   └── database.js  # SQLite database setup
│   │   ├── middleware/      # Express middleware
│   │   │   └── auth.js      # Authentication middleware
│   │   ├── routes/          # API route handlers
│   │   │   ├── auth.js      # Authentication endpoints
│   │   │   ├── clients.js   # Client CRUD operations
│   │   │   ├── produits.js  # Product management
│   │   │   ├── ventes.js    # Sales management
│   │   │   ├── factures.js  # Invoice management
│   │   │   ├── stock.js     # Inventory management
│   │   │   ├── fournisseurs.js  # Supplier management
│   │   │   ├── bonscommande.js  # Purchase order management
│   │   │   ├── bonslivraison.js  # Delivery note management
│   │   │   ├── devis.js     # Quotation management
│   │   │   ├── rapports.js  # Reporting endpoints
│   │   │   └── parametres.js    # System settings
│   │   └── server.js        # Express server setup
│   ├── database/            # SQLite database files
│   ├── package.json
│   └── .env                 # Environment variables
├── DATABASE_SCHEMA.md       # Database documentation
├── SETUP_GUIDE.md           # Detailed setup instructions
└── README.md               # This file
```

## 🔐 Authentication

The system uses JWT-based authentication with role-based access control:

### Default Users
- **Admin**: username `admin`, password `admin123`, role `ADMIN`
- Has access to all features including system settings

### User Roles
- **ADMIN**: Full system access including user management
- **USER**: Standard business operations access
- **VIEWER**: Read-only access to reports and data

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for mobile devices:

- Touch-friendly interface with larger tap targets
- Responsive navigation drawer for mobile
- Adaptive tables that work on small screens
- Mobile-optimized forms and inputs
- Performance optimized for mobile browsers

## 🗄️ Database

The system uses SQLite with the following main tables:

- **users** - System users and authentication
- **clients** - Customer information with ICE numbers
- **produits** - Product catalog
- **familles/categories/marques** - Product classification
- **ventes/ligne_ventes** - Sales and line items
- **factures/ligne_factures** - Invoicing
- **bons_livraison/ligne_bons_livraison** - Delivery notes (both sales and purchases)
- **bons_commande/ligne_bons_commande** - Purchase orders
- **stock/mouvements_stock** - Inventory management
- **fournisseurs** - Supplier information with ICE numbers
- **devis/ligne_devis** - Quotations
- **reglements** - Payment tracking
- **tva** - Tax rates
- **parametres** - System settings
- **societe** - Company information

See `DATABASE_SCHEMA.md` for complete schema documentation.

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Clients
- `GET /api/clients` - List all clients
- `GET /api/clients/:id` - Get client details
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Products
- `GET /api/produits` - List all products
- `GET /api/produits/:id` - Get product details
- `POST /api/produits` - Create new product
- `PUT /api/produits/:id` - Update product
- `DELETE /api/produits/:id` - Delete product

### Sales
- `GET /api/ventes` - List all sales
- `GET /api/ventes/:id` - Get sale details with lines
- `POST /api/ventes` - Create new sale
- `PATCH /api/ventes/:id/statut` - Update sale status

### Invoices
- `GET /api/factures` - List all invoices
- `GET /api/factures/:id` - Get invoice details
- `POST /api/factures` - Create invoice from sale
- `POST /api/factures/:id/paiement` - Add payment

### Delivery Notes (Bon Livraison)
- `GET /api/bons-livraison` - List all delivery notes
- `GET /api/bons-livraison/:id` - Get delivery note details
- `POST /api/bons-livraison/vente/:vente_id` - Create delivery note from sale
- `POST /api/bons-livraison/achat/:commande_id` - Create delivery note from purchase order
- `PATCH /api/bons-livraison/:id/statut` - Update delivery note status
- `DELETE /api/bons-livraison/:id` - Delete delivery note

### Purchase Orders (Bon Commande)
- `GET /api/bons-commande` - List all purchase orders
- `GET /api/bons-commande/:id` - Get purchase order details
- `POST /api/bons-commande` - Create new purchase order
- `PATCH /api/bons-commande/:id/statut` - Update purchase order status
- `DELETE /api/bons-commande/:id` - Delete purchase order

### Stock
- `GET /api/stock` - Get current inventory
- `POST /api/stock/ajustement` - Adjust stock levels
- `GET /api/stock/alertes/low` - Get low stock alerts

### Reports
- `GET /api/rapports/ventes` - Sales report
- `GET /api/rapports/stock` - Inventory report
- `GET /api/rapports/clients` - Customer analysis
- `GET /api/rapports/factures` - Invoice report
- `GET /api/rapports/financier` - Financial summary

## 🚢 Deployment

### Production Build

1. **Build frontend**
```bash
cd frontend
npm run build
```

2. **Configure production environment**
Update `.env` file:
```env
NODE_ENV=production
JWT_SECRET=your-secure-production-secret
```

3. **Start production server**
```bash
cd backend
npm start
```

### Serving Static Files

For production, you can serve the built frontend static files through Express:

1. Build the frontend: `npm run build`
2. Copy the `dist` folder to backend
3. Update `server.js` to serve static files

## 📊 Key Workflows

### Sales Process
1. Create quotation for client
2. Client accepts quotation
3. Convert quotation to sale
4. Generate delivery note (Bon Livraison) from sale
5. Create invoice from sale
6. Process payments
7. Update inventory automatically via delivery notes

### Purchase Process
1. Create purchase order (Bon Commande) for supplier
2. Supplier confirms order
3. Generate delivery note (Bon Livraison) upon receipt
4. Update inventory automatically
5. Process supplier invoices
6. Track supplier payments

### Inventory Management
1. Products are added to catalog
2. Stock levels are tracked in real-time
3. Low stock alerts trigger notifications
4. Purchase orders can be created for restocking
5. Delivery notes update stock automatically
6. Stock movements are logged for audit trail

### Financial Reporting
1. Real-time dashboard with key metrics
2. Sales reports by date range
3. Invoice aging and payment tracking
4. Customer purchase analysis
5. Financial summary and cash flow

## 🔒 Security Considerations

- Change default admin password immediately
- Use strong JWT secrets in production
- Enable HTTPS in production
- Implement rate limiting for API endpoints
- Regular database backups
- Input validation and sanitization

## 📝 Development

### Adding New Features

1. **Backend**: Add new route in appropriate `routes/` file
2. **Frontend**: Create new view component in `views/`
3. **Navigation**: Add route in `router/index.js`
4. **API**: Update API client if needed

### Database Changes

1. Update schema in `DATABASE_SCHEMA.md`
2. Modify database initialization in `config/database.js`
3. Update related API endpoints
4. Test migrations thoroughly

## 🐛 Troubleshooting

### Common Issues

**Database locked error**
- Ensure only one backend instance is running
- Check for open database connections

**CORS errors**
- Verify frontend proxy configuration in `vite.config.js`
- Check CORS middleware in backend

**Authentication failures**
- Verify JWT secret matches between frontend and backend
- Check token expiration time

## 📞 Support

For issues and questions:
- Check the SETUP_GUIDE.md for detailed instructions
- Review DATABASE_SCHEMA.md for database structure
- Examine API endpoint documentation in route files

## 📄 License

This project is provided as-is for enterprise management purposes.

## 🙏 Acknowledgments

Built with modern web technologies to replace legacy WebDev systems with a contemporary, mobile-first solution.