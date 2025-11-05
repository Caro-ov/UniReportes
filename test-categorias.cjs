// Script para verificar categorías en la base de datos
const mysql = require('mysql2/promise');
require('./src/utils/envLoader.js');

async function verificarCategorias() {
    console.log('🔍 Verificando categorías en la base de datos...');
    
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        console.log('🔗 Conectando a MySQL...');
        const [rows] = await pool.execute('SELECT * FROM categorias LIMIT 10');
        console.log('📊 Categorías encontradas:', rows.length);
        
        if (rows.length > 0) {
            console.log('📝 Primeras categorías:');
            rows.forEach((cat, index) => {
                console.log(`  ${index + 1}. ID: ${cat.id_categoria}, Nombre: ${cat.nombre}`);
            });
        } else {
            console.log('⚠️  No se encontraron categorías en la base de datos');
        }

        await pool.end();
        console.log('✅ Verificación completada');
    } catch (error) {
        console.error('❌ Error al verificar categorías:', error.message);
    }
}

verificarCategorias();