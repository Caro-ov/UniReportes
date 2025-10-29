// Script para probar la funcionalidad de eliminación del usuario Test Admin
import pool from './src/config/db.js';

async function testDeleteUser() {
    try {
        console.log('🧪 Probando eliminación del usuario Test Admin (ID: 5)...');
        
        // Verificar que el usuario existe antes de eliminarlo
        const [userCheck] = await pool.execute('SELECT * FROM usuarios WHERE id_usuario = 5');
        
        if (userCheck.length === 0) {
            console.log('❌ El usuario con ID 5 no existe');
            return;
        }
        
        console.log('✅ Usuario encontrado:', userCheck[0].nombre);
        
        // Simular eliminación (opcional - descomenta para eliminar realmente)
        /* 
        const [result] = await pool.execute('DELETE FROM usuarios WHERE id_usuario = 5');
        
        if (result.affectedRows > 0) {
            console.log('✅ Usuario eliminado exitosamente');
            
            // Verificar eliminación
            const [verifyCheck] = await pool.execute('SELECT * FROM usuarios WHERE id_usuario = 5');
            console.log('Usuarios restantes después de eliminación:', verifyCheck.length);
        } else {
            console.log('❌ No se pudo eliminar el usuario');
        }
        */
        
        console.log('🔍 Para eliminar realmente, descomenta las líneas correspondientes en test-delete.js');
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error durante la prueba:', error);
        process.exit(1);
    }
}

testDeleteUser();