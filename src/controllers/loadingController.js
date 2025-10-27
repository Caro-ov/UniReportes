/**
 * Controlador para manejar EXCLUSIVAMENTE la pantalla de carga del login
 * Este controlador NO debe interferir con otras partes del sistema
 */

/**
 * Simular tiempo de carga SOLO para pantalla de carga (API)
 */
export async function simulateLoading(req, res) {
    try {
        // Verificar que la petición viene del contexto correcto
        const referer = req.get('Referer') || '';
        if (!referer.includes('pantalla-carga.html') && !referer.includes('login.html')) {
            return res.status(403).json({
                success: false,
                message: 'Endpoint solo disponible para pantalla de carga'
            });
        }

        const duration = parseInt(req.query.duration) || 2000; // 2 segundos por defecto
        const maxDuration = 5000; // Máximo 5 segundos para no interferir
        
        const loadingTime = Math.min(duration, maxDuration);
        
        // Simular operaciones de carga mínimas
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
 * Obtener estado de carga SOLO para pantalla de carga (API)
 */
export async function getSystemStatus(req, res) {
    try {
        // Verificar que la petición viene del contexto correcto
        const referer = req.get('Referer') || '';
        if (!referer.includes('pantalla-carga.html') && !referer.includes('login.html')) {
            return res.status(403).json({
                success: false,
                message: 'Endpoint solo disponible para pantalla de carga'
            });
        }

        // Estado básico para pantalla de carga únicamente
        const status = {
            loading: 'ok',
            timestamp: new Date().toISOString()
        };

        res.json({
            success: true,
            data: status,
            message: 'Sistema de carga funcionando'
        });
    } catch (error) {
        console.error('Error al verificar estado de carga:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar estado de carga'
        });
    }
}

/**
 * Obtener progreso de inicialización SOLO para pantalla de carga (API)
 */
export async function getInitializationProgress(req, res) {
    try {
        // Verificar que la petición viene del contexto correcto
        const referer = req.get('Referer') || '';
        if (!referer.includes('pantalla-carga.html') && !referer.includes('login.html')) {
            return res.status(403).json({
                success: false,
                message: 'Endpoint solo disponible para pantalla de carga'
            });
        }

        // Pasos simplificados solo para pantalla de carga
        const steps = [
            { name: 'Estableciendo conexión', completed: true, duration: 500 },
            { name: 'Verificando credenciales', completed: true, duration: 800 },
            { name: 'Cargando sesión', completed: true, duration: 600 },
            { name: 'Preparando interfaz', completed: true, duration: 400 }
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
        console.error('Error al obtener progreso de carga:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener progreso de carga'
        });
    }
}

export default {
    simulateLoading,
    getSystemStatus,
    getInitializationProgress
};
