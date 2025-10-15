-- Crear base de datos UniReportes para MySQL
CREATE DATABASE IF NOT EXISTS unireportes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE unireportes;

-- Tabla de usuarios
CREATE TABLE usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    codigo_estudiante VARCHAR(20) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('usuario', 'admin', 'monitor') DEFAULT 'usuario',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de categorías de reportes
CREATE TABLE categorias (
    id_categoria INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de reportes
CREATE TABLE reportes (
    id_reporte INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    ubicacion VARCHAR(200) NOT NULL,
    categoria_id INT,
    usuario_id INT NOT NULL,
    estado ENUM('pendiente', 'en_proceso', 'resuelto', 'cerrado') DEFAULT 'pendiente',
    prioridad ENUM('baja', 'media', 'alta') DEFAULT 'media',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id_categoria) ON DELETE SET NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Tabla de imágenes de reportes
CREATE TABLE imagenes_reporte (
    id_imagen INT PRIMARY KEY AUTO_INCREMENT,
    reporte_id INT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tipo_mime VARCHAR(100),
    tamano_bytes INT,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporte_id) REFERENCES reportes(id_reporte) ON DELETE CASCADE
);

-- Tabla de comentarios
CREATE TABLE comentarios (
    id_comentario INT PRIMARY KEY AUTO_INCREMENT,
    reporte_id INT NOT NULL,
    usuario_id INT NOT NULL,
    comentario TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporte_id) REFERENCES reportes(id_reporte) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Insertar categorías por defecto
INSERT INTO categorias (nombre, descripcion, color) VALUES
('Infraestructura', 'Problemas con edificios, aulas, baños', '#EF4444'),
('Tecnología', 'Problemas con equipos, internet, proyectores', '#3B82F6'),
('Seguridad', 'Problemas de seguridad, iluminación', '#F59E0B'),
('Limpieza', 'Problemas de aseo y mantenimiento', '#10B981'),
('Otros', 'Otros problemas no clasificados', '#6B7280');

-- Insertar usuario administrador por defecto
INSERT INTO usuarios (nombre, correo, codigo_estudiante, contrasena, rol) VALUES
('Administrador', 'admin@uni.local', '202412345', '$2a$10$ytT0UjMYxGdcICXmkUSGseWJAQ0p7mBTE5hKpIkmdEjpUNAHHYodq', 'admin');
-- La contraseña es: Admin123!

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_reportes_usuario ON reportes(usuario_id);
CREATE INDEX idx_reportes_categoria ON reportes(categoria_id);
CREATE INDEX idx_reportes_estado ON reportes(estado);
CREATE INDEX idx_reportes_fecha ON reportes(fecha_creacion);
CREATE INDEX idx_comentarios_reporte ON comentarios(reporte_id);
CREATE INDEX idx_imagenes_reporte ON imagenes_reporte(reporte_id);