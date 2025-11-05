import mysql from 'mysql2/promise';

async function checkStats() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'Datos_Unireportes'
        });

        console.log('=== ESTADÍSTICAS PARA TARJETAS DEL DASHBOARD ===');

        // Consulta simplificada
        const [results] = await connection.execute(`
            SELECT 
                COUNT(*) as total_reportes,
                SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as reportes_pendientes,
                SUM(CASE WHEN estado = 'resuelto' THEN 1 ELSE 0 END) as resueltos_total
            FROM reportes
        `);

        console.log('Resultados de la consulta:', results[0]);

        // También probar consulta por mes
        const [monthResults] = await connection.execute(`
            SELECT COUNT(*) as resueltos_mes
            FROM reportes 
            WHERE estado = 'resuelto' 
            AND MONTH(fecha_actualizacion) = MONTH(CURDATE()) 
            AND YEAR(fecha_actualizacion) = YEAR(CURDATE())
        `);

        console.log('Resueltos este mes:', monthResults[0]);

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkStats();