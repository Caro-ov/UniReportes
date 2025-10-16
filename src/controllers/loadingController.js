/**
 * Controlador para manejar la pantalla de carga
 */

/**
 * Simular tiempo de carga (API)
 */
export async function simulateLoading(req, res) {
    try {
        const duration = parseInt(req.query.duration) || 2000; // 2 segundos por defecto
        const maxDuration = 10000; // Máximo 10 segundos
        
        const loadingTime = Math.min(duration, maxDuration);
        
        // Simular operaciones de carga
        await new Promise(resolve => setTimeout(resolve, loadingTime));
        
        res.json({
            success: true,
            message: 'Carga completada',
            duration: loadingTime
        });
    } catch (error) {
        console.error('Error en simulación de carga:', error);
        res.status(500).json({
            success: false,
            message: 'Error durante la carga'
        });
    }
}

/**
 * Obtener estado de carga del sistema (API)
 */
export async function getSystemStatus(req, res) {
    try {
        // Verificar estado de componentes del sistema
        const status = {
            database: 'ok',
            server: 'ok',
            timestamp: new Date().toISOString()
        };

        // Verificar conexión a base de datos
        try {
            const pool = (await import('../config/db.js')).default;
            await pool.execute('SELECT 1');
            status.database = 'ok';
        } catch (dbError) {
            status.database = 'error';
            console.error('Error de base de datos:', dbError);
        }

        const allSystemsOk = Object.values(status).every(s => s === 'ok' || typeof s === 'string');

        res.json({
            success: allSystemsOk,
            data: status,
            message: allSystemsOk ? 'Sistema funcionando correctamente' : 'Hay problemas en el sistema'
        });
    } catch (error) {
        console.error('Error al verificar estado del sistema:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar estado del sistema',
            data: {
                database: 'error',
                server: 'error',
                timestamp: new Date().toISOString()
            }
        });
    }
}

/**
 * Obtener progreso de inicialización (API)
 */
export async function getInitializationProgress(req, res) {
    try {
        const steps = [
            { name: 'Estableciendo conexión segura', completed: true, duration: 500 },
            { name: 'Verificando credenciales', completed: true, duration: 800 },
            { name: 'Cargando datos del usuario', completed: true, duration: 600 },
            { name: 'Configurando sesión', completed: true, duration: 400 },
            { name: 'Preparando interfaz', completed: true, duration: 700 },
            { name: 'Finalizando', completed: true, duration: 200 }
        ];

        const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
        const progress = 100; // Siempre completado cuando llega aquí

        res.json({
            success: true,
            data: {
                steps,
                progress,
                totalDuration,
                currentStep: steps.length,
                completed: true
            }
        });
    } catch (error) {
        console.error('Error al obtener progreso:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener progreso de inicialización'
        });
    }
}

export default {
    simulateLoading,
    getSystemStatus,
    getInitializationProgress
};
