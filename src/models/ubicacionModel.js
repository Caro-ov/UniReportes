import pool from '../config/db.js';

export default class UbicacionModel {
    /**
     * Obtener todas las ubicaciones
     */
    static async getAllUbicaciones() {
        try {
            const [rows] = await pool.execute(
                'SELECT id_ubicacion, nombre, descripcion FROM ubicaciones ORDER BY nombre'
            );
            return rows;
        } catch (error) {
            console.error('Error al obtener ubicaciones:', error);
            throw error;
        }
    }

    /**
     * Obtener salones por ubicación
     */
    static async getSalonesByUbicacion(idUbicacion) {
        try {
            const [rows] = await pool.execute(
                'SELECT id_salon, nombre, capacidad, tipo FROM salones WHERE ubicacion = ? ORDER BY nombre',
                [idUbicacion]
            );
            return rows;
        } catch (error) {
            console.error('Error al obtener salones por ubicación:', error);
            throw error;
        }
    }

    /**
     * Obtener ubicación por ID
     */
    static async getUbicacionById(idUbicacion) {
        try {
            const [rows] = await pool.execute(
                'SELECT id_ubicacion, nombre, descripcion FROM ubicaciones WHERE id_ubicacion = ?',
                [idUbicacion]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error al obtener ubicación por ID:', error);
            throw error;
        }
    }
}