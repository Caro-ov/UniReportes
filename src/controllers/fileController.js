import * as fileModel from '../models/fileModel.js';
import path from 'path';
import fs from 'fs';

/**
 * Servir un archivo específico
 */
export async function serveFile(req, res) {
    try {
        const { filename } = req.params;
        const userId = req.session.user?.id;
        const userRole = req.session.user?.rol;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        // Buscar el archivo por nombre en el path
        const filePath = findFileByName(filename);
        
        if (!filePath || !fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Archivo no encontrado'
            });
        }

        // Obtener información del archivo desde la BD
        const fileInfo = await getFileInfoByPath(filePath);
        
        if (!fileInfo) {
            return res.status(404).json({
                success: false,
                message: 'Archivo no registrado en la base de datos'
            });
        }

        // Verificar permisos: el propietario del reporte o admin
        const hasPermission = userRole === 'admin' || fileInfo.id_usuario === userId;
        
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para acceder a este archivo'
            });
        }

        // Configurar headers apropiados
        res.setHeader('Content-Type', fileInfo.tipo);
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        
        // Enviar el archivo
        res.sendFile(path.resolve(filePath));

    } catch (error) {
        console.error('Error sirviendo archivo:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Obtener información de archivos de un reporte
 */
export async function getReportFiles(req, res) {
    try {
        const { reportId } = req.params;
        const userId = req.session.user?.id;
        const userRole = req.session.user?.rol;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        // Verificar que el reporte existe y el usuario tiene permisos
        const reportModel = await import('../models/reportModel.js');
        const report = await reportModel.getReportById(parseInt(reportId));
        
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            });
        }

        const hasPermission = userRole === 'admin' || report.id_usuario === userId;
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para ver los archivos de este reporte'
            });
        }

        // Obtener archivos del reporte
        const files = await fileModel.getFilesByReportId(parseInt(reportId));
        
        // Agregar información adicional y URL de acceso
        const filesWithInfo = files.map(file => ({
            ...file,
            filename: path.basename(file.url),
            fileUrl: `/api/files/${path.basename(file.url)}`,
            isImage: file.tipo.startsWith('image/'),
            isVideo: file.tipo.startsWith('video/')
        }));

        res.json({
            success: true,
            data: filesWithInfo
        });

    } catch (error) {
        console.error('Error obteniendo archivos del reporte:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

/**
 * Eliminar un archivo
 */
export async function deleteFile(req, res) {
    try {
        const { fileId } = req.params;
        const userId = req.session.user?.id;
        const userRole = req.session.user?.rol;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        // Obtener información del archivo
        const fileInfo = await fileModel.getFileById(parseInt(fileId));
        
        if (!fileInfo) {
            return res.status(404).json({
                success: false,
                message: 'Archivo no encontrado'
            });
        }

        // Verificar permisos
        const hasPermission = userRole === 'admin' || fileInfo.id_usuario === userId;
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para eliminar este archivo'
            });
        }

        // Eliminar archivo físico
        if (fs.existsSync(fileInfo.url)) {
            fs.unlinkSync(fileInfo.url);
        }

        // Eliminar registro de la BD
        const deleted = await fileModel.deleteFile(parseInt(fileId));
        
        if (deleted) {
            res.json({
                success: true,
                message: 'Archivo eliminado exitosamente'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error al eliminar el archivo de la base de datos'
            });
        }

    } catch (error) {
        console.error('Error eliminando archivo:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

// Función auxiliar para buscar archivo por nombre
function findFileByName(filename) {
    const uploadsDir = 'uploads/reports';
    
    try {
        // Buscar recursivamente en todos los subdirectorios
        const findInDir = (dir) => {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    const found = findInDir(fullPath);
                    if (found) return found;
                } else if (item === filename) {
                    return fullPath;
                }
            }
            return null;
        };
        
        return findInDir(uploadsDir);
    } catch (error) {
        console.error('Error buscando archivo:', error);
        return null;
    }
}

// Función auxiliar para obtener info del archivo por path
async function getFileInfoByPath(filePath) {
    try {
        // Normalizar el path para la consulta
        const normalizedPath = filePath.replace(/\\/g, '/');
        
        // Importar dinámicamente para evitar circular dependency
        const pool = (await import('../config/db.js')).default;
        
        const [rows] = await pool.execute(
            `SELECT a.*, r.id_usuario 
             FROM archivos a
             JOIN reportes r ON a.id_reporte = r.id_reporte
             WHERE a.url = ?`,
            [normalizedPath]
        );
        
        return rows[0] || null;
    } catch (error) {
        console.error('Error obteniendo info del archivo:', error);
        return null;
    }
}

export default {
    serveFile,
    getReportFiles,
    deleteFile
};