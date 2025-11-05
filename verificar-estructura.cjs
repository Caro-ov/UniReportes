// Script para verificar la estructura de la tabla reportes
const mysql = require('mysql2/promise');
require('./src/utils/envLoader.js');

async function verificarEstructura() {
    console.log('🔍 Verificando estructura de la tabla reportes...');
    
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
        const [columns] = await pool.execute('DESCRIBE reportes');
        console.log('📊 Estructura de la tabla reportes:');
        
        columns.forEach((column, index) => {
            console.log(`  ${index + 1}. Campo: ${column.Field}, Tipo: ${column.Type}, Null: ${column.Null}, Default: ${column.Default}`);
        });

        // Buscar columnas relacionadas con ubicación
        const ubicacionCols = columns.filter(col => 
            col.Field.toLowerCase().includes('ubicac') || 
            col.Field.toLowerCase().includes('edificio') || 
            col.Field.toLowerCase().includes('lugar') ||
            col.Field.toLowerCase().includes('salon')
        );
        
        console.log('\n📍 Columnas relacionadas con ubicación:');
        if (ubicacionCols.length > 0) {
            ubicacionCols.forEach(col => {
                console.log(`  - ${col.Field} (${col.Type})`);
            });
        } else {
            console.log('  ⚠️  No se encontraron columnas relacionadas con ubicación');
        }

        await pool.end();
        console.log('✅ Verificación completada');
    } catch (error) {
        console.error('❌ Error al verificar estructura:', error.message);
    }
}

verificarEstructura();