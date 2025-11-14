# 🔔 Sistema de Notificaciones en Tiempo Real - Instrucciones de Implementación

## 📋 Cambios Implementados

### 1. Notificaciones en Tiempo Real
- ✅ Polling cada **5 segundos** (antes era 30 segundos)
- ✅ Detección automática de nuevas notificaciones
- ✅ Animación "shake" en la campana cuando llegan notificaciones nuevas
- ✅ Toast de alerta cuando hay nuevas notificaciones
- ✅ Recarga automática del panel si está abierto

### 2. Notificación a Administradores
- ✅ Nuevo trigger `notif_nuevo_reporte` que se activa cuando se crea un reporte
- ✅ Todos los administradores reciben la notificación
- ✅ El creador del reporte NO recibe su propia notificación

### 3. Notificaciones Urgentes (Rojas)
- ✅ Detección automática de categoría "Urgencia" (ID 6)
- ✅ Badge rojo con animación especial para notificaciones urgentes
- ✅ Fondo rojo claro en la notificación urgente
- ✅ Borde rojo lateral de 4px
- ✅ Emoji 🚨 en el título de notificaciones urgentes

---

## 🚀 Pasos para Aplicar los Cambios

### Paso 1: Actualizar la Base de Datos

Ejecuta el siguiente script SQL en phpMyAdmin:

```sql
-- Archivo: sql/add_trigger_nuevo_reporte.sql
```

**Opción A - phpMyAdmin:**
1. Abre phpMyAdmin
2. Selecciona la base de datos `datos_unireportes`
3. Ve a la pestaña "SQL"
4. Copia y pega el contenido del archivo `sql/add_trigger_nuevo_reporte.sql`
5. Click en "Continuar"

**Opción B - Terminal:**
```bash
mysql -u root -p datos_unireportes < "sql/add_trigger_nuevo_reporte.sql"
```

### Paso 2: Verificar el Trigger

Ejecuta en SQL:
```sql
SHOW TRIGGERS WHERE `Table` = 'reportes';
```

Deberías ver 3 triggers:
- ✅ `notif_reporte_cambio_estado`
- ✅ `notif_comentario_nuevo`
- ✅ `notif_reporte_modificado`
- ✅ `notif_nuevo_reporte` ← **NUEVO**

### Paso 3: Reiniciar el Servidor Node.js

```bash
# Detener el servidor (Ctrl+C si está corriendo)
# Iniciar nuevamente
npm run dev
```

---

## 🧪 Cómo Probar

### Prueba 1: Notificación a Administrador
1. Inicia sesión como **usuario normal** (monitor)
2. Crea un nuevo reporte con categoría normal (ej: "Tecnología")
3. Cierra sesión
4. Inicia sesión como **administrador**
5. **Resultado esperado:** Deberías ver el badge de notificaciones con número (en azul)
6. Click en la campana → verás "Nuevo reporte creado: [título]"

### Prueba 2: Notificación Urgente
1. Inicia sesión como **usuario normal**
2. Crea un nuevo reporte con categoría **"Urgencia"** (ID 6)
3. Cierra sesión
4. Inicia sesión como **administrador**
5. **Resultado esperado:** 
   - Badge ROJO con animación pulsante
   - Notificación con fondo rojo claro
   - Título: "🚨 URGENTE: Nuevo reporte creado"
   - Borde rojo lateral de 4px

### Prueba 3: Tiempo Real
1. Abre 2 navegadores (o 2 ventanas de incógnito)
2. **Navegador 1:** Inicia sesión como **administrador** → Quédate en el dashboard
3. **Navegador 2:** Inicia sesión como **usuario normal** → Crea un nuevo reporte
4. **Navegador 1 (admin):** Dentro de 5 segundos máximo:
   - La campana hará animación "shake"
   - El badge mostrará el nuevo contador
   - Aparecerá un toast: "Tienes nuevas notificaciones"

---

## 🎨 Estilos CSS Agregados

### Clases Nuevas
- `.urgente` - Para notificaciones urgentes (fondo rojo)
- `.badge-count.urgente` - Badge rojo con animación pulsante
- `.shake` - Animación de sacudida para la campana

### Animaciones
- `pulse-urgent` - Pulso rojo para notificaciones urgentes
- `shake` - Sacudida lateral de la campana

---

## 📊 Configuración de Prioridades

| Prioridad | Valor | Color | Uso |
|-----------|-------|-------|-----|
| Normal | 1 | Azul | Reportes estándar |
| Media | 2 | Amarillo | No implementado aún |
| Urgente | 3 | Rojo | Categoría "Urgencia" |

---

## 🔧 Configuración Técnica

### Frecuencia de Actualización
- **Polling:** Cada 5 segundos
- **Verificación urgentes:** Cada 5 segundos
- **Recarga panel abierto:** Cada 5 segundos

Para cambiar la frecuencia, edita en `public/js/notificaciones.js`:
```javascript
// Línea ~272
this.refreshInterval = setInterval(() => {
    this.updateBadge();
    if (this.isPanelOpen) {
        this.loadNotifications();
    }
}, 5000); // ← Cambiar este valor (en milisegundos)
```

### Categorías Urgentes Detectadas
El trigger detecta como urgentes:
- Categoría con ID = 6
- Nombre que contenga: "urgencia", "urgente", "emergencia", "crítico", "critico"

---

## 🐛 Solución de Problemas

### El trigger no se crea
```sql
-- Ver errores
SHOW ERRORS;

-- Verificar permisos
SHOW GRANTS;
```

### Las notificaciones no llegan en tiempo real
1. Verifica que el servidor Node.js esté corriendo
2. Abre la consola del navegador (F12)
3. Busca errores en la pestaña "Console"
4. Verifica que las peticiones a `/api/notifications/count` se hagan cada 5 segundos (pestaña "Network")

### El badge no se pone rojo
1. Verifica que el reporte se creó con categoría "Urgencia" (ID 6)
2. Abre la consola y ejecuta:
```javascript
console.log(window.notificationManager.hasUrgentNotifications);
```
3. Inspecciona el badge:
```javascript
console.log(document.getElementById('badgeNotificaciones').classList);
```

---

## 📝 Notas Importantes

1. **Rendimiento:** El polling cada 5 segundos puede incrementar el uso de recursos. Para producción, considera usar WebSockets o Server-Sent Events (SSE).

2. **Sonido:** El método `playNotificationSound()` está preparado pero comentado. Para activarlo, descomenta las líneas en `notificaciones.js` y agrega un archivo de audio.

3. **Categorías Personalizadas:** Si agregas nuevas categorías urgentes, el trigger las detectará automáticamente si contienen las palabras clave.

4. **Base de Datos:** El trigger solo funciona para reportes NUEVOS creados después de implementarlo. Los reportes anteriores NO generarán notificaciones retroactivas.

---

## ✅ Checklist de Verificación

- [ ] Trigger `notif_nuevo_reporte` creado en la BD
- [ ] 4 triggers totales en la tabla `reportes`
- [ ] Servidor Node.js reiniciado
- [ ] CSS actualizado con clases urgentes
- [ ] JavaScript carga correctamente (sin errores en consola)
- [ ] Badge muestra contador
- [ ] Badge se pone rojo con notificaciones urgentes
- [ ] Animación shake funciona
- [ ] Panel se actualiza cada 5 segundos
- [ ] Administradores reciben notificaciones de nuevos reportes
- [ ] Reportes urgentes se marcan en rojo

---

**Autor:** Sistema de Notificaciones UniReportes  
**Fecha:** 13 de noviembre de 2025  
**Versión:** 2.0 - Tiempo Real + Urgentes
