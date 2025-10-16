import express from 'express';
import session from 'express-session';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { setupEnv } from './src/utils/envLoader.js';
import authRoutes from './src/routes/authRoutes.js';
import pageRoutes from './src/routes/pageRoutes.js';
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

// Rutas
app.use('/auth', authRoutes);
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
    console.log('🚀 Usuario demo: admin@uni.local / Admin123! / Código: 202412345');
  } catch (err) {
    console.error('❌ Error conectando a MySQL:', err.message);
    console.log('💡 Verifica que MySQL esté corriendo y las credenciales en .env sean correctas');
  }
});
