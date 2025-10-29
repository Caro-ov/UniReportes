import express from 'express';
import session from 'express-session';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { setupEnv } from './src/utils/envLoader.js';
import authRoutes from './src/routes/authRoutes.js';
import pageRoutes from './src/routes/pageRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import loadingRoutes from './src/routes/loadingRoutes.js'; // Solo para transición login -> dashboard
import pool from './src/config/db.js';

// Configurar variables de entorno (soporta archivos cifrados)
setupEnv();
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares básicos
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware de seguridad global
app.use((req, res, next) => {
  // Headers de seguridad para prevenir caché en páginas sensibles
  if (req.path.includes('dashboard') || req.path.includes('perfil') || 
      req.path.includes('crear-') || req.path.includes('mis-') ||
      req.path.includes('admin-') || req.path.includes('explorar-')) {
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff'
    });
  }
  next();
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'cambia-esto',
    resave: false,
    saveUninitialized: false,
  })
);

// Servir estáticos desde la carpeta public
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/img', express.static(path.join(__dirname, 'public', 'img')));
app.use('/components', express.static(path.join(__dirname, 'public', 'components')));

// Rutas de autenticación
app.use('/auth', authRoutes);

// Rutas API
app.use('/api/reports', reportRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/loading', loadingRoutes); // Solo para transición login -> dashboard

// Rutas de páginas (deben ir al final)
app.use('/', pageRoutes);

// Fallback 404 con archivo estático si existe
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(PORT, async () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
  console.log('🔗 Probando conexión MySQL...');
  
  // Probar conexión a MySQL al levantar
  try {
    const [rows] = await pool.execute('SELECT 1 AS ok');
    console.log('✅ MySQL conectado correctamente');
    console.log('🚀 Usuario demo: admin@uni.local / admin123 / Código: 2024000001');
  } catch (err) {
    console.error('❌ Error conectando a MySQL:', err.message);
    console.log('💡 Verifica que MySQL esté corriendo y las credenciales en .env sean correctas');
  }
});
