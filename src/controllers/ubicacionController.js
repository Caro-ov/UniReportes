import UbicacionModel from '../models/ubicacionModel.js';

export default class UbicacionController {
    /**
     * Obtener todas las ubicaciones
     */
    static async getAllUbicaciones(req, res) {
        try {
            const ubicaciones = await UbicacionModel.getAllUbicaciones();
            res.json({
                success: true,
                data: ubicaciones,
                count: ubicaciones.length
            });
        } catch (error) {
            console.error('Error en getAllUbicaciones:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener salones por ubicación
     */
    static async getSalonesByUbicacion(req, res) {
        try {
            const { idUbicacion } = req.params;
            
            if (!idUbicacion) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID de ubicación es requerido'
                });
            }

            const salones = await UbicacionModel.getSalonesByUbicacion(idUbicacion);
            res.json({
                success: true,
                data: salones,
                count: salones.length
            });
        } catch (error) {
            console.error('Error en getSalonesByUbicacion:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener ubicación por ID
     */
    static async getUbicacionById(req, res) {
        try {
            const { idUbicacion } = req.params;
            
            if (!idUbicacion) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID de ubicación es requerido'
                });
            }

            const ubicacion = await UbicacionModel.getUbicacionById(idUbicacion);
            
            if (!ubicacion) {
                return res.status(404).json({
                    success: false,
                    message: 'Ubicación no encontrada'
                });
            }

            res.json({
                success: true,
                data: ubicacion
            });
        } catch (error) {
            console.error('Error en getUbicacionById:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}