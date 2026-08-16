# Quick Start Guide

Get Gest Irrigation Web up and running in 5 minutes!

## 🚀 Quick Setup

### 1. Install Node.js
Download and install Node.js from https://nodejs.org/ (version 18.x or higher recommended)

### 2. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### 3. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Default Login**: 
  - Username: `admin`
  - Password: `admin123`

## 🎯 First Steps After Login

1. **Change Default Password**
   - Go to Paramètres → Utilisateurs
   - Change the admin password immediately

2. **Configure Company Information**
   - Go to Paramètres → Général
   - Enter your company details

3. **Set Up TVA Rates**
   - Go to Paramètres → TVA
   - Configure your tax rates

4. **Add Your First Products**
   - Go to Produits → Nouveau Produit
   - Add your product catalog

5. **Add Your First Clients**
   - Go to Clients → Nouveau Client
   - Add customer information

6. **Create Your First Sale**
   - Go to Ventes → Nouvelle Vente
   - Select client and products

## 📱 Mobile Access

The application is fully responsive! Access it from any device:
- Desktop: Full keyboard and mouse support
- Tablet: Touch-optimized interface
- Mobile: Mobile-first design with swipe navigation

## 🔧 Common Tasks

### Add New User
1. Go to Paramètres → Utilisateurs
2. Click "Nouvel Utilisateur"
3. Fill in user details and role

### Create Backup
1. Go to Paramètres → Sauvegarde
2. Click "Créer une sauvegarde"
3. Backup file is saved in `backend/backups/`

### Check Low Stock
1. Go to Stock page
2. Items with red tags are below minimum
3. Click +/- buttons to adjust stock

### Generate Reports
1. Go to Rapports
2. Select report type (Sales, Stock, Clients, etc.)
3. Reports are generated instantly

## 🐛 Troubleshooting

**Port already in use?**
- Change PORT in backend/.env file
- Change port in frontend/vite.config.js

**Database errors?**
- Delete backend/database/gest_irigation.db
- Restart backend server (will recreate database)

**Can't login?**
- Verify backend is running on port 3000
- Check browser console for errors
- Try clearing browser cache

## 📚 Next Steps

- Read the full README.md for detailed documentation
- Check DATABASE_SCHEMA.md for database structure
- Review SETUP_GUIDE.md for advanced configuration

## 💡 Tips

- Use keyboard shortcuts: Ctrl/Cmd + K for quick search
- Export reports to Excel for further analysis
- Set up automatic backups for production use
- Customize the dashboard with your preferred metrics

## 🆘 Need Help?

- Check the documentation files in the project root
- Review the API endpoints in backend/src/routes/
- Examine the Vue components in frontend/src/views/