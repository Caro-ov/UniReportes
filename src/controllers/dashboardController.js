import * as reportModel from '../models/reportModel.js';
import * as userModel from '../models/userModel.js';
import * as categoryModel from '../models/categoryModel.js';
import pool from '../config/db.js';

/**
 * Obtener estadísticas del dashboard (API)
 */
export async function getDashboardStats(req, res) {
    try {
        const userId = req.session.user?.id;
        const userRole = req.session.user?.rol;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        let dashboardData = {};

        if (userRole === 'admin') {
            // Dashboard para administradores - estadísticas globales
            const [reportStats, userStats, categoryStats] = await Promise.all([
                reportModel.getReportsStats(),
                userModel.getUsersStats(),
                categoryModel.getCategoriesStats()
            ]);

            dashboardData = {
                tipo: 'admin',
                reportes: reportStats,
                usuarios: userStats,
                categorias: categoryStats,
                resumen: {
                    total_reportes: reportStats.total || 0,
                    reportes_pendientes: reportStats.pendientes || 0,
                    reportes_resueltos: reportStats.resueltos || 0,
                    total_usuarios: userStats.total || 0,
                    reportes_hoy: reportStats.hoy || 0,
                    reportes_semana: reportStats.esta_semana || 0
                }
            };
        } else {
            // Dashboard para usuarios normales - solo sus reportes
            const userReports = await reportModel.getReportsByUser(userId, 10, 0);
            const reportStats = {
                total: userReports.length,
                pendientes: userReports.filter(r => r.estado === 'pendiente').length,
                en_proceso: userReports.filter(r => r.estado === 'en_proceso').length,
                resueltos: userReports.filter(r => r.estado === 'resuelto').length,
                cerrados: userReports.filter(r => r.estado === 'cerrado').length
            };

            dashboardData = {
                tipo: 'usuario',
                reportes: reportStats,
                reportes_recientes: userReports.slice(0, 5),
                resumen: {
                    mis_reportes: reportStats.total,
                    pendientes: reportStats.pendientes,
                    resueltos: reportStats.resueltos,
                    en_proceso: reportStats.en_proceso
                }
            };
        }

        res.json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error('Error al obtener estadísticas del dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Obtener reportes recientes (API)
 */
export async function getRecentReports(req, res) {
    try {
        const userId = req.session.user?.id;
        const userRole = req.session.user?.rol;
        const limit = parseInt(req.query.limit) || 10;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        let reports;
        
        if (userRole === 'admin') {
            // Admin ve todos los reportes recientes
            reports = await reportModel.getAllReports(limit, 0);
        } else {
            // Usuario normal ve solo sus reportes
            reports = await reportModel.getReportsByUser(userId, limit, 0);
        }

        res.json({
            success: true,
            data: reports
        });
    } catch (error) {
        console.error('Error al obtener reportes recientes:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Obtener resumen de actividad (API)
 */
export async function getActivitySummary(req, res) {
    try {
        const userId = req.session.user?.id;
        const userRole = req.session.user?.rol;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        let activityData = {};

        if (userRole === 'admin') {
            // Resumen de actividad para admin
            const reportStats = await reportModel.getReportsStats();
            const userStats = await userModel.getUsersStats();

            activityData = {
                reportes_nuevos_hoy: reportStats.hoy || 0,
                reportes_esta_semana: reportStats.esta_semana || 0,
                usuarios_nuevos_hoy: userStats.nuevos_hoy || 0,
                reportes_alta_prioridad: reportStats.alta_prioridad || 0,
                porcentaje_resueltos: reportStats.total > 0 
                    ? Math.round((reportStats.resueltos / reportStats.total) * 100) 
                    : 0
            };
        } else {
            // Resumen de actividad para usuario normal
            const userReports = await reportModel.getReportsByUser(userId, 100, 0);
            const today = new Date().toISOString().split('T')[0];
            const thisWeekStart = new Date();
            thisWeekStart.setDate(thisWeekStart.getDate() - 7);

            const reportsToday = userReports.filter(r => 
                r.fecha_creacion.toISOString().split('T')[0] === today
            ).length;

            const reportsThisWeek = userReports.filter(r => 
                new Date(r.fecha_creacion) >= thisWeekStart
            ).length;

            activityData = {
                mis_reportes_hoy: reportsToday,
                mis_reportes_semana: reportsThisWeek,
                total_reportes: userReports.length,
                reportes_resueltos: userReports.filter(r => r.estado === 'resuelto').length,
                porcentaje_resueltos: userReports.length > 0 
                    ? Math.round((userReports.filter(r => r.estado === 'resuelto').length / userReports.length) * 100) 
                    : 0
            };
        }

        res.json({
            success: true,
            data: activityData
        });
    } catch (error) {
        console.error('Error al obtener resumen de actividad:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Obtener estadísticas por categoría (API)
 */
export async function getCategoryStats(req, res) {
    try {
        const userRole = req.session.user?.rol;

        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden ver estadísticas por categoría'
            });
        }

        const categoryStats = await categoryModel.getCategoriesStats();

        // Calcular porcentajes
        const totalReports = categoryStats.reduce((sum, cat) => sum + cat.total_reportes, 0);
        
        const statsWithPercentages = categoryStats.map(cat => ({
            ...cat,
            porcentaje: totalReports > 0 
                ? Math.round((cat.total_reportes / totalReports) * 100) 
                : 0,
            porcentaje_resueltos: cat.total_reportes > 0 
                ? Math.round((cat.resueltos / cat.total_reportes) * 100) 
                : 0
        }));

        res.json({
            success: true,
            data: {
                categorias: statsWithPercentages,
                total_reportes: totalReports
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas por categoría:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Obtener gráfico de tendencias (API - solo admin)
 */
export async function getTrendsChart(req, res) {
    try {
        const userRole = req.session.user?.rol;

        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden ver tendencias'
            });
        }

        // Obtener reportes de los últimos 30 días agrupados por fecha
        const trendsQuery = `
            SELECT 
                DATE(fecha_creacion) as fecha,
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
                SUM(CASE WHEN estado = 'resuelto' THEN 1 ELSE 0 END) as resueltos
            FROM reportes 
            WHERE fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY DATE(fecha_creacion)
            ORDER BY fecha ASC
        `;

        const [trendsData] = await pool.execute(trendsQuery);

        // Generar array de los últimos 30 días
        const last30Days = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last30Days.push(date.toISOString().split('T')[0]);
        }

        // Mapear datos con días que no tienen reportes
        const chartData = last30Days.map(fecha => {
            const dayData = trendsData.find(d => d.fecha.toISOString().split('T')[0] === fecha);
            return {
                fecha,
                total: dayData ? dayData.total : 0,
                pendientes: dayData ? dayData.pendientes : 0,
                resueltos: dayData ? dayData.resueltos : 0
            };
        });

        res.json({
            success: true,
            data: chartData
        });
    } catch (error) {
        console.error('Error al obtener tendencias:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Obtener estadísticas para las tarjetas del admin dashboard
 */
export async function getAdminCardStats(req, res) {
    try {
        const userRole = req.session.user?.rol;

        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden ver estas estadísticas'
            });
        }

        // Obtener estadísticas de reportes
        const [reportesResults] = await pool.execute(`
            SELECT 
                COUNT(*) as total_reportes,
                SUM(CASE WHEN e.nombre = 'pendiente' THEN 1 ELSE 0 END) as reportes_pendientes,
                SUM(CASE WHEN e.nombre = 'resuelto' AND MONTH(r.fecha_creacion) = MONTH(CURDATE()) AND YEAR(r.fecha_creacion) = YEAR(CURDATE()) THEN 1 ELSE 0 END) as resueltos_mes
            FROM reportes r
            LEFT JOIN estados e ON r.id_estado = e.id_estado
        `);

        const stats = {
            total_reportes: parseInt(reportesResults[0].total_reportes) || 0,
            reportes_pendientes: parseInt(reportesResults[0].reportes_pendientes) || 0,
            resueltos_mes: parseInt(reportesResults[0].resueltos_mes) || 0
        };

        console.log('Estadísticas calculadas:', stats);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error al obtener estadísticas de tarjetas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

export default {
    getDashboardStats,
    getRecentReports,
    getActivitySummary,
    getCategoryStats,
    getTrendsChart,
    getAdminCardStats
};
