-- Script para agregar trigger de notificación al crear nuevo reporte
-- Ejecutar este script en phpMyAdmin o desde terminal MySQL

USE datos_unireportes;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS `notif_nuevo_reporte`;

-- Crear trigger para notificar al administrador cuando se crea un nuevo reporte
DELIMITER $$
CREATE TRIGGER `notif_nuevo_reporte` AFTER INSERT ON `reportes`
FOR EACH ROW
BEGIN
    DECLARE v_notif_id INT;
    DECLARE v_categoria_nombre VARCHAR(100);
    DECLARE v_prioridad INT DEFAULT 1;
    DECLARE v_color VARCHAR(20) DEFAULT 'azul';
    DECLARE v_titulo_notif VARCHAR(255);
    
    -- Obtener nombre de la categoría
    SELECT nombre INTO v_categoria_nombre
    FROM categorias
    WHERE id_categoria = NEW.id_categoria
    LIMIT 1;
    
    -- Si es categoría urgente, cambiar prioridad y color
    IF LOWER(v_categoria_nombre) LIKE '%urgencia%' OR 
       LOWER(v_categoria_nombre) LIKE '%urgente%' OR 
       LOWER(v_categoria_nombre) LIKE '%emergencia%' OR 
       LOWER(v_categoria_nombre) LIKE '%crítico%' OR
       LOWER(v_categoria_nombre) LIKE '%critico%' OR
       NEW.id_categoria = 6 THEN
        SET v_prioridad = 3;
        SET v_color = 'rojo';
        SET v_titulo_notif = '🚨 URGENTE: Nuevo reporte creado';
    ELSE
        SET v_prioridad = 1;
        SET v_color = 'azul';
        SET v_titulo_notif = 'Nuevo reporte creado';
    END IF;
    
    -- Crear notificación
    INSERT INTO notificaciones (
        tipo, titulo, mensaje, enlace, prioridad, icono, color,
        id_reporte, id_usuario_actor, metadata
    ) VALUES (
        'nuevo_reporte',
        v_titulo_notif,
        CONCAT('Se ha creado un nuevo reporte: ', NEW.titulo),
        CONCAT('detalle-reporte.html?id=', NEW.id_reporte),
        v_prioridad,
        'add_circle',
        v_color,
        NEW.id_reporte,
        NEW.id_usuario,
        JSON_OBJECT('categoria', v_categoria_nombre)
    );
    
    SET v_notif_id = LAST_INSERT_ID();
    
    -- Notificar a todos los administradores
    INSERT INTO notificaciones_usuarios (id_notificacion, id_usuario)
    SELECT v_notif_id, u.id_usuario
    FROM usuarios u
    WHERE u.rol = 'admin'
      AND u.id_usuario != NEW.id_usuario;
END$$
DELIMITER ;

-- Verificar que el trigger fue creado
SHOW TRIGGERS WHERE `Table` = 'reportes';
