-- Actualizar el trigger para marcar notificaciones como leídas cuando un reporte se marca como Resuelto

DROP TRIGGER IF EXISTS `notif_reporte_cambio_estado`;

DELIMITER $$
CREATE TRIGGER `notif_reporte_cambio_estado`
AFTER UPDATE ON `reportes`
FOR EACH ROW
BEGIN
  IF OLD.id_estado != NEW.id_estado THEN
    -- Si el nuevo estado es "Resuelto" (id_estado = 4), marcar todas las notificaciones anteriores como leídas
    IF NEW.id_estado = 4 THEN
      UPDATE notificaciones 
      SET leida = 1 
      WHERE id_reporte = NEW.id_reporte AND leida = 0;
    END IF;
    
    -- Notificar al creador del reporte sobre el cambio de estado
    INSERT INTO notificaciones (id_usuario_destino, id_reporte, tipo, titulo, mensaje, prioridad, color)
    VALUES (
      NEW.id_usuario,
      NEW.id_reporte,
      'cambio_estado',
      CONCAT('Estado actualizado: ', NEW.titulo),
      CONCAT('El estado de tu reporte ha cambiado a "', (SELECT nombre FROM estados WHERE id_estado = NEW.id_estado), '"'),
      2,
      'azul'
    );
  END IF;
END$$
DELIMITER ;
