# 📧 Configuración de Notificaciones por Email (Gmail)

## Requisitos Previos

1. Tener una cuenta de Gmail activa
2. Habilitar la verificación en 2 pasos en tu cuenta de Google
3. Generar una contraseña de aplicación

---

## 📝 Paso 1: Obtener Contraseña de Aplicación de Gmail

### Opción A: Desde Google Account
1. Ve a [myaccount.google.com](https://myaccount.google.com)
2. En el menú lateral, selecciona **"Seguridad"**
3. En la sección "Cómo inicias sesión en Google", busca **"Verificación en 2 pasos"**
4. Si no está activada, actívala primero
5. Una vez activada, busca **"Contraseñas de aplicaciones"**
6. Selecciona:
   - **App:** Correo
   - **Device:** Otro (personalizado)
   - Ponle un nombre: "UniReportes"
7. Haz clic en **"Generar"**
8. Google te mostrará una contraseña de 16 caracteres (sin espacios)
9. **Copia esta contraseña** (no podrás verla de nuevo)

### Opción B: Acceso Directo
Visita directamente: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

---

## 🔧 Paso 2: Configurar Variables de Entorno

Agrega estas líneas a tu archivo `.env` (en la raíz del proyecto):

```env
# Email Configuration (Gmail)
EMAIL_USER=tu-correo@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx    # La contraseña de aplicación de 16 caracteres
EMAIL_ADMIN=correo-admin@gmail.com  # Email que recibirá notificaciones de admin
```

**Ejemplo:**
```env
EMAIL_USER=unireportes@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_ADMIN=admin@universidad.edu
```

---

## 📤 Paso 3: Usar el Servicio de Email

### Importar el servicio

```javascript
import emailService from './src/services/emailService.js';
```

### Ejemplos de uso:

#### 1. Notificar nuevo reporte (al admin)
```javascript
import { enviarNotificacionNuevoReporte } from './src/services/emailService.js';

// En reportController.js al crear un reporte
const reporte = {
    titulo: 'Fuga de agua en baño',
    descripcion: 'Hay una fuga importante...',
    categoria: 'Infraestructura',
    prioridad: 'Alta',
    ubicacion: 'Edificio A - Piso 2'
};

const usuario = {
    nombre: 'Juan Pérez',
    correo: 'juan@universidad.edu'
};

await enviarNotificacionNuevoReporte(reporte, usuario);
```

#### 2. Notificar cambio de estado (al usuario que reportó)
```javascript
import { enviarNotificacionCambioEstado } from './src/services/emailService.js';

// Cuando un admin cambia el estado
await enviarNotificacionCambioEstado(
    reporte,          // Objeto con datos del reporte
    usuario,          // Usuario que hizo el reporte
    'En Progreso'     // Nuevo estado
);
```

#### 3. Notificar nuevo comentario
```javascript
import { enviarNotificacionNuevoComentario } from './src/services/emailService.js';

await enviarNotificacionNuevoComentario(
    reporte,        // Reporte donde se comentó
    comentario,     // Objeto con el comentario
    autor,          // Usuario que comentó
    destinatario    // Usuario que recibirá la notificación
);
```

#### 4. Notificación genérica
```javascript
import { enviarNotificacionGenerica } from './src/services/emailService.js';

await enviarNotificacionGenerica(
    'usuario@email.com',
    'Asunto del correo',
    '<p>Contenido HTML del mensaje</p>'
);
```

---

## 🔌 Paso 4: Integrar en Controladores

### Ejemplo: En `reportController.js`

```javascript
import emailService from '../services/emailService.js';

export const crearReporte = async (req, res) => {
    try {
        // ... código para crear el reporte en la BD
        
        // Enviar notificación por email
        const usuarioReporta = {
            nombre: req.session.user.nombre,
            correo: req.session.user.correo
        };
        
        await emailService.enviarNotificacionNuevoReporte(
            reporteCreado,
            usuarioReporta
        );
        
        res.json({ success: true, mensaje: 'Reporte creado y notificación enviada' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al crear reporte' });
    }
};
```

### Ejemplo: Al cambiar estado en `reportController.js`

```javascript
export const actualizarEstado = async (req, res) => {
    try {
        const { id_reporte, nuevo_estado } = req.body;
        
        // ... actualizar estado en BD
        
        // Obtener datos del reporte y usuario
        const reporte = await obtenerReportePorId(id_reporte);
        const usuario = await obtenerUsuarioPorId(reporte.usuario_id);
        
        // Enviar notificación
        await emailService.enviarNotificacionCambioEstado(
            reporte,
            usuario,
            nuevo_estado
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al actualizar estado' });
    }
};
```

---

## 🧪 Paso 5: Probar el Servicio

Crea un archivo de prueba: `test-email.js`

```javascript
import emailService from './src/services/emailService.js';

const testEmail = async () => {
    const resultado = await emailService.enviarNotificacionGenerica(
        'tu-email@gmail.com',
        '✅ Prueba de Email desde UniReportes',
        '<h2>¡Funciona!</h2><p>El servicio de email está configurado correctamente.</p>'
    );
    
    console.log('Resultado:', resultado);
};

testEmail();
```

Ejecuta: `node test-email.js`

---

## ⚠️ Solución de Problemas

### Error: "Invalid login"
- Verifica que `EMAIL_USER` sea el correo completo (con @gmail.com)
- Confirma que `EMAIL_PASS` sea la contraseña de aplicación (16 caracteres)
- No uses tu contraseña normal de Gmail

### Error: "Connection timeout"
- Verifica tu conexión a internet
- Algunos firewalls corporativos bloquean el puerto 587
- Prueba usar hotspot de celular para descartar bloqueo

### Email no llega
- Revisa la carpeta de Spam/Correo no deseado
- Verifica que el correo destinatario esté correcto
- Revisa los logs de la consola para ver si hay errores

### "Less secure app access"
- Gmail ya no soporta esta opción
- **DEBES usar contraseñas de aplicación** con verificación en 2 pasos

---

## 🚀 Características Adicionales

### Adjuntar archivos (opcional)

```javascript
const mailOptions = {
    from: `"UniReportes" <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: 'Reporte con adjunto',
    html: '<p>Ver archivo adjunto</p>',
    attachments: [
        {
            filename: 'reporte.pdf',
            path: './uploads/reporte.pdf'
        }
    ]
};
```

### Múltiples destinatarios

```javascript
to: 'email1@gmail.com, email2@gmail.com, email3@gmail.com'
// o
to: ['email1@gmail.com', 'email2@gmail.com', 'email3@gmail.com']
```

### CC y BCC

```javascript
const mailOptions = {
    from: `"UniReportes" <${process.env.EMAIL_USER}>`,
    to: 'destinatario@email.com',
    cc: 'copia@email.com',
    bcc: 'copia-oculta@email.com',
    subject: 'Asunto',
    html: '<p>Mensaje</p>'
};
```

---

## 📊 Límites de Gmail

- **500 correos por día** para cuentas gratuitas
- **2000 correos por día** para Google Workspace
- Si necesitas más, considera servicios como:
  - SendGrid
  - Mailgun
  - Amazon SES
  - Resend

---

## 🔒 Seguridad

✅ **Buenas prácticas:**
- Nunca subas tu `.env` a GitHub
- Usa contraseñas de aplicación, no contraseñas reales
- Encripta tu `.env` para producción (usa `npm run env:encrypt`)

❌ **Evita:**
- Hardcodear credenciales en el código
- Compartir contraseñas de aplicación
- Desactivar verificación en 2 pasos

---

## 📝 Notas

- El servicio está listo en: `src/services/emailService.js`
- Las funciones son asíncronas (usa `await`)
- Los errores se logean en consola automáticamente
- El transporter se verifica al iniciar la app
