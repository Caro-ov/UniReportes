import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Crear directorio si no existe
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        
        const uploadPath = path.join('uploads', 'reports', String(year), month, day);
        ensureDirectoryExists(uploadPath);
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generar nombre único para el archivo
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 1000);
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);
        
        // Sanitizar nombre del archivo
        const sanitizedBaseName = baseName
            .replace(/[^a-zA-Z0-9\-_]/g, '_')
            .substring(0, 50);
        
        const filename = `${timestamp}-${randomNum}-${sanitizedBaseName}${ext}`;
        cb(null, filename);
    }
});

// Filtro de archivos permitidos
const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/avi'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
    }
};

// Configuración de multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB máximo
        files: 1 // Solo un archivo por reporte
    }
});

// Middleware para manejar errores de multer
export const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    success: false,
                    message: 'El archivo es demasiado grande. Máximo 50MB.'
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    success: false,
                    message: 'Solo se permite un archivo por reporte.'
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    success: false,
                    message: 'Campo de archivo inesperado.'
                });
            default:
                return res.status(400).json({
                    success: false,
                    message: `Error al subir archivo: ${error.message}`
                });
        }
    } else if (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    next();
};

// Exportar middleware configurado
export const uploadSingle = upload.single('archivo');

export default upload;