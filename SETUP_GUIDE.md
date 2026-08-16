# Setup Guide for Gest Irrigation Web Application

## Prerequisites

### 1. Install Node.js
Download and install Node.js from https://nodejs.org/
- Recommended version: Node.js 18.x or 20.x LTS
- After installation, restart your terminal/command prompt

### 2. Verify Installation
Open a new terminal and run:
```bash
node --version
npm --version
```

## Project Structure

```
gest_irigation_web/
├── frontend/                 # Vue.js frontend application
│   ├── src/
│   │   ├── components/      # Vue components
│   │   ├── views/           # Page views
│   │   ├── router/          # Vue Router configuration
│   │   ├── store/           # Pinia state management
│   │   ├── api/             # API client
│   │   ├── utils/           # Utility functions
│   │   ├── App.vue          # Root component
│   │   └── main.js          # Entry point
│   ├── public/              # Static assets
│   ├── package.json
│   └── vite.config.js       # Vite configuration
├── backend/                  # Node.js/Express backend
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── models/          # Database models
│   │   ├── controllers/     # Route controllers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Utility functions
│   │   └── server.js        # Server entry point
│   ├── database/            # SQLite database files
│   ├── package.json
│   └── .env                 # Environment variables
└── DATABASE_SCHEMA.md       # Database schema documentation
```

## Installation Steps

### 1. Create Frontend Project
```bash
cd gest_irigation_web
npm create vue@latest frontend
```

When prompted, select:
- TypeScript: No
- JSX: No
- Vue Router: Yes
- Pinia: Yes
- Vitest: No
- Playwright: No
- ESLint: Yes
- Prettier: No

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
npm install element-plus @element-plus/icons-vue axios
```

### 3. Create Backend Project
```bash
cd ..
mkdir backend
cd backend
npm init -y
npm install express sqlite3 cors dotenv bcryptjs jsonwebtoken express-validator
npm install --save-dev nodemon
```

### 4. Initialize Database
The database will be automatically created when you start the backend server.

## Running the Application

### Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```

### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Environment Configuration

Create `.env` file in backend directory:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-this-in-production
DB_PATH=./database/gest_irigation.db
```

## Development Features

- **Hot Module Replacement** for instant frontend updates
- **Auto-restart** backend server on file changes
- **SQLite database** stored locally in backend/database/
- **Element Plus** components for responsive UI
- **Vue Router** for navigation
- **Pinia** for state management
- **Axios** for API communication

## Mobile Responsiveness

The application uses Element Plus components with built-in responsive design:
- Element Plus components automatically adapt to screen sizes
- Mobile-first CSS approach
- Touch-friendly interface
- Responsive navigation drawer

## Next Steps

After installing Node.js and following the setup guide:
1. Run the installation commands above
2. Start both backend and frontend servers
3. Access the application at http://localhost:5173
4. Default admin credentials will be created on first run