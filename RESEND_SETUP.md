# Configuración de Resend para UniReportes

## ✅ Resend ya instalado y configurado en el código

El sistema está listo para usar **Resend** en producción (Railway) y **Gmail** en desarrollo local.

---

## 📝 Configurar Resend en Railway

### 1. Obtener API Key de Resend:

1. Ve a https://resend.com
2. Crea una cuenta (gratis, sin tarjeta)
3. Settings → API Keys → Create API Key
4. Copia la API key (empieza con `re_`)

### 2. Agregar variable en Railway:

1. Ve a tu proyecto en Railway
2. Settings → Variables
3. Agrega esta nueva variable:

```
Variable Name: RESEND_API_KEY
Value: tu_api_key_aqui
```

4. Haz clic en **Add** y Railway se redesplegará automáticamente

---

## 🔍 Verificar que funciona

Después del redeploy, en los logs de Railway deberías ver:

```
🔍 Verificando configuración de email...
RESEND_API_KEY: ✓ Configurado
📧 Modo: Producción - Usando Resend API
✅ Servicio de email Resend configurado
```

Luego cuando alguien comente en un reporte:

```
📧 Intentando enviar email a usuario@example.com (tipo: comentario)
📤 Enviando email a: usuario@example.com
✅ Email enviado via Resend: abc123-def456-ghi789
✅ Email enviado exitosamente a usuario@example.com
```

---

## ⚠️ Nota importante sobre el email "from"

Resend usa por defecto: `onboarding@resend.dev`

Este es un dominio de prueba. Los emails llegarán pero pueden ir a spam.

### Para usar tu propio dominio (opcional):

1. En Resend.com → Settings → Domains
2. Agrega tu dominio (ej: `unireportes.com`)
3. Verifica el dominio con DNS
4. Cambia en el código `src/services/emailService.js`:
   ```javascript
   from: "UniReportes <notificaciones@tudominio.com>";
   ```

Por ahora, `onboarding@resend.dev` funcionará perfectamente para pruebas.

---

## 📊 Límites de Resend (Plan Gratuito)

- ✅ 100 emails por día
- ✅ 3,000 emails por mes
- ✅ Sin tarjeta de crédito requerida

Es más que suficiente para UniReportes.

---

## 🧪 Probar localmente

En desarrollo local (tu computadora), seguirá usando Gmail:

```
🔍 Verificando configuración de email...
EMAIL_USER: ✓ Configurado
EMAIL_PASS: ✓ Configurado
📧 Modo: Desarrollo - Usando Gmail SMTP
✅ Servicio de email Gmail listo
```

Esto significa que no necesitas Resend en local, solo en Railway.

---

## 🔒 Seguridad

**NUNCA subas tu API key de Resend a Git.**

Las API keys deben ir solo en:

- Variables de entorno de Railway (producción)
- Archivo `.env.temp` en local (ya está en .gitignore)

El archivo `RESEND_CONFIG.md` con tu API key real está en `.gitignore` y no debe subirse al repositorio.
