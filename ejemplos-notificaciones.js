// Ejemplo de uso del notificationService
// Este servicio crea notificaciones en BD Y envía emails automáticamente

import notificationService from './src/services/notificationService.js';

// ========================================
// EJEMPLO 1: Notificar nuevo comentario
// ========================================
async function ejemploComentario() {
    const resultado = await notificationService.crearYNotificar({
        id_usuario_destino: 2,  // ID del usuario que recibirá la notificación
        id_reporte: 5,           // ID del reporte
        tipo: 'comentario',
        titulo: 'Nuevo comentario en tu reporte',
        mensaje: 'El administrador comentó: "Estamos trabajando en esto"',
        prioridad: 1,
        color: 'azul'
    });
    
    console.log('Notificación creada:', resultado);
}

// ========================================
// EJEMPLO 2: Notificar cambio de estado
// ========================================
async function ejemploCambioEstado() {
    await notificationService.crearYNotificar({
        id_usuario_destino: 3,
        id_reporte: 7,
        tipo: 'cambio_estado',
        titulo: 'Tu reporte fue actualizado',
        mensaje: 'El estado cambió a "En Progreso"',
        prioridad: 2,
        color: 'verde'
    });
}

// ========================================
// EJEMPLO 3: Notificar TODOS los admins
// ========================================
async function ejemploNotificarAdmins() {
    const resultados = await notificationService.notificarAdmins({
        id_reporte: 8,
        tipo: 'nuevo_reporte',
        titulo: 'Nuevo reporte de emergencia',
        mensaje: 'Se reportó una fuga de agua en el edificio principal',
        prioridad: 3,
        color: 'rojo'
    });
    
    console.log(`✅ Notificados ${resultados.length} administradores`);
}

// ========================================
// EJEMPLO 4: En reportController.js
// ========================================
/*
import notificationService from '../services/notificationService.js';

export const crearReporte = async (req, res) => {
    try {
        const { titulo, descripcion, categoria, ubicacion } = req.body;
        const userId = req.session.user.id_usuario;
        
        // 1. Crear reporte en BD
        const [result] = await pool.execute(
            'INSERT INTO reportes (titulo, descripcion, id_categoria, id_usuario) VALUES (?, ?, ?, ?)',
            [titulo, descripcion, categoria, userId]
        );
        
        const id_reporte = result.insertId;
        
        // 2. Notificar a todos los administradores (BD + Email)
        await notificationService.notificarAdmins({
            id_reporte,
            tipo: 'nuevo_reporte',
            titulo: `Nuevo reporte: ${titulo}`,
            mensaje: `${req.session.user.nombre} creó un nuevo reporte en ${ubicacion}`,
            prioridad: 2,
            color: 'azul'
        });
        
        res.json({ success: true, id_reporte });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al crear reporte' });
    }
};
*/

// ========================================
// EJEMPLO 5: En commentController.js
// ========================================
/*
import notificationService from '../services/notificationService.js';

export const crearComentario = async (req, res) => {
    try {
        const { id_reporte, contenido } = req.body;
        const userId = req.session.user.id_usuario;
        
        // 1. Crear comentario en BD
        await pool.execute(
            'INSERT INTO comentarios (id_reporte, id_usuario, contenido) VALUES (?, ?, ?)',
            [id_reporte, userId, contenido]
        );
        
        // 2. Obtener el dueño del reporte
        const [reportes] = await pool.execute(
            'SELECT id_usuario FROM reportes WHERE id_reporte = ?',
            [id_reporte]
        );
        
        const dueno_reporte = reportes[0].id_usuario;
        
        // 3. Si el que comenta NO es el dueño, notificar al dueño
        if (dueno_reporte !== userId) {
            await notificationService.crearYNotificar({
                id_usuario_destino: dueno_reporte,
                id_reporte,
                tipo: 'comentario',
                titulo: 'Nuevo comentario en tu reporte',
                mensaje: contenido,
                prioridad: 1,
                color: 'azul'
            });
        }
        
        res.json({ success: true });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al crear comentario' });
    }
};
*/

// ========================================
// EJEMPLO 6: Actualizar estado de reporte
// ========================================
/*
export const actualizarEstado = async (req, res) => {
    try {
        const { id_reporte, nuevo_estado } = req.body;
        
        // 1. Actualizar estado en BD
        await pool.execute(
            'UPDATE reportes SET id_estado = ? WHERE id_reporte = ?',
            [nuevo_estado, id_reporte]
        );
        
        // 2. Obtener datos del reporte y estado
        const [reportes] = await pool.execute(
            `SELECT r.id_usuario, r.titulo, e.nombre as estado_nombre 
             FROM reportes r 
             JOIN estados e ON e.id_estado = ? 
             WHERE r.id_reporte = ?`,
            [nuevo_estado, id_reporte]
        );
        
        const reporte = reportes[0];
        
        // 3. Notificar al dueño del reporte
        await notificationService.crearYNotificar({
            id_usuario_destino: reporte.id_usuario,
            id_reporte,
            tipo: 'cambio_estado',
            titulo: 'Estado de tu reporte actualizado',
            mensaje: `El estado cambió a "${reporte.estado_nombre}"`,
            prioridad: 2,
            color: 'verde'
        });
        
        res.json({ success: true });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al actualizar estado' });
    }
};
*/

// Descomentar para probar:
// ejemploComentario();
// ejemploCambioEstado();
// ejemploNotificarAdmins();

export {
    ejemploComentario,
    ejemploCambioEstado,
    ejemploNotificarAdmins
};
