# Configurar Dominio Verificado en Resend

## 📝 Pasos para activar envío a múltiples destinatarios

### 1. Verificar un dominio en Resend

#### Opción A: Si tienes dominio propio
1. Ve a https://resend.com/domains
2. Click en "Add Domain"
3. Ingresa tu dominio (ej: `unireportes.com`)

#### Opción B: Si NO tienes dominio
Puedes obtener uno gratis en:
- **Freenom**: https://www.freenom.com (dominios .tk, .ml, .ga)
- **InfinityFree**: Incluye dominio gratis con hosting
- O comprar uno en Namecheap (~$10/año)

### 2. Agregar registros DNS

Resend te dará estos registros para agregar en tu proveedor de DNS:

```
Tipo: TXT
Nombre: _resend
Valor: resend-verify=xxxxxxxxxxxx

Tipo: TXT
Nombre: @
Valor: v=spf1 include:spf.resend.com ~all

Tipo: TXT  
Nombre: _dmarc
Valor: v=DMARC1; p=none; rua=mailto:postmaster@tudominio.com
```

**Dónde agregar estos registros:**
- Si usas Cloudflare: Dashboard → DNS → Add Record
- Si usas Freenom: Services → My Domains → Manage Domain → Manage Freenom DNS
- Si usas Namecheap: Domain List → Manage → Advanced DNS

### 3. Esperar verificación

Resend verificará automáticamente el dominio (puede tomar 5-30 minutos).

### 4. Configurar en Railway

Una vez verificado el dominio, agrega estas variables en Railway:

```
RESEND_FROM_EMAIL = notificaciones@tudominio.com
RESEND_TEST_MODE = false
```

**Explicación:**
- `RESEND_FROM_EMAIL`: El email "from" que aparecerá en los correos
- `RESEND_TEST_MODE`: Cambiar a `false` para enviar a destinatarios reales

### 5. Verificar funcionamiento

Después del redeploy:

1. Crea un comentario o reporte
2. Los logs mostrarán:
   ```
   🔧 Enviando via Resend API...
   📊 Respuesta de Resend: {"id":"..."}
   ✅ Email enviado via Resend. ID: ...
   ```
3. **El destinatario recibirá el email** (no solo tu email de admin)

---

## ⚡ Resumen rápido

**Estado actual:**
- ✅ Resend funcionando en modo prueba
- ⚠️ Solo envía a carlos15.ci15@gmail.com
- `RESEND_TEST_MODE = true`

**Para producción completa:**
1. Verificar dominio en Resend
2. Cambiar `RESEND_TEST_MODE = false`
3. Agregar `RESEND_FROM_EMAIL = notificaciones@tudominio.com`

**Sin dominio propio:**
- Sigue usando `RESEND_TEST_MODE = true`
- Todos los emails llegarán a tu inbox con nota del destinatario original
- Funcional para demostración y pruebas

---

## 🎯 Alternativa sin dominio propio

Si no quieres verificar dominio, puedes seguir usando el modo de prueba actual:
- Todos los emails llegan a tu bandeja
- En el cuerpo del email aparece el destinatario original
- Perfecto para desarrollo y demostración

Para producción real, **sí necesitas dominio verificado**.
