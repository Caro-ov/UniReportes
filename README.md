# 📚 UniReportes

<div align="center">

![UniReportes Logo](https://img.shields.io/badge/UniReportes-Sistema_de_Gestión-blue?style=for-the-badge&logo=school)

**Sistema de gestión y seguimiento de reportes de daños en instalaciones universitarias**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-lightgrey?style=flat-square&logo=express)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue?style=flat-square&logo=mysql)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-Private-red?style=flat-square)](LICENSE)

[Características](#-características) •
[Instalación](#-instalación) •
[Uso](#-uso) •
[Estructura](#-estructura-del-proyecto) •
[Tecnologías](#-tecnologías) •
[Seguridad](#-seguridad)

</div>

---

## 📋 Descripción

**UniReportes** es una plataforma web diseñada para facilitar la notificación, gestión y seguimiento de daños e incidencias en instalaciones universitarias. Permite a estudiantes y personal administrativo reportar problemas de manera eficiente, mientras que los administradores pueden gestionar, priorizar y resolver estos reportes de forma centralizada.

### 🎯 Objetivos del Proyecto

- **Seguridad Primero**: Priorizar la seguridad de estudiantes y personal universitario
- **Rapidez en la Resolución**: Agilizar la comunicación entre reportantes y administración
- **Comunidad Activa**: Fomentar la colaboración para mantener un campus cuidado
- **Transparencia**: Permitir el seguimiento en tiempo real del estado de los reportes

---

## ✨ Características

### Para Usuarios
- 🔐 **Sistema de autenticación seguro** con sesiones encriptadas
- 📝 **Crear reportes** con detalles, imágenes y ubicación exacta
- 📊 **Dashboard personalizado** con estadísticas de reportes
- 🔍 **Explorar reportes** de la comunidad universitaria
- 💬 **Sistema de comentarios** para seguimiento de reportes
- 🔔 **Notificaciones en tiempo real** sobre el estado de tus reportes
- 👤 **Perfil de usuario** personalizable

### Para Administradores
- 📈 **Panel de administración** con métricas y estadísticas
- 👥 **Gestión de usuarios** (crear, editar, eliminar)
- 📋 **Administración de reportes** con filtros avanzados
- 🏷️ **Gestión de categorías** para clasificar reportes
- 📍 **Gestión de ubicaciones** y objetos del campus
- 📧 **Sistema de notificaciones por email** automatizado
- 📊 **Reportes y estadísticas** en tiempo real

### Funcionalidades Técnicas
- 🔒 **Seguridad avanzada**: Encriptación de variables de entorno
- 📧 **Servicio de email**: Integración con SendGrid y Nodemailer
- 📸 **Carga de archivos**: Sistema de upload con Multer
- 🔄 **Sincronización en tiempo real**: Actualización automática de notificaciones
- 🎨 **Interfaz moderna**: Diseño responsive con temas personalizables
- 🌐 **API RESTful**: Arquitectura modular y escalable

---

## 🚀 Instalación

### Prerrequisitos

Asegúrate de tener instalado:
- [Node.js](https://nodejs.org/) (v18 o superior)
- [MySQL](https://www.mysql.com/) (v8.0 o superior)
- [Git](https://git-scm.com/)

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd UniReportes
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Copia el archivo de ejemplo y configura tus credenciales:
   ```bash
   cp .env.example .env
   ```

   Edita el archivo `.env` con tus configuraciones:
   ```env
   # Base de datos
   DB_HOST=localhost
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   DB_NAME=unireportes
   DB_PORT=3306

   # Sesión
   SESSION_SECRET=tu_secreto_super_seguro

   # Email (SendGrid o SMTP)
   EMAIL_USER=tu_email@example.com
   EMAIL_PASS=tu_contraseña
   EMAIL_ADMIN=admin@university.edu
   
   # Aplicación
   APP_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. **Importar la base de datos**
   ```bash
   mysql -u tu_usuario -p unireportes < sql/Datos_UniReportes.sql
   ```

5. **Crear usuario administrador (opcional)**
   ```bash
   npm run seed:admin
   ```

6. **Encriptar variables de entorno (opcional pero recomendado)**
   ```bash
   npm run env:encrypt
   ```

---

## 🎮 Uso

### Modo Desarrollo
```bash
npm run dev
```
El servidor se iniciará en `http://localhost:3000` con hot-reload activado.

### Modo Producción
```bash
npm start
```

### Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm start` | Inicia el servidor en modo producción |
| `npm run dev` | Inicia el servidor en modo desarrollo con nodemon |
| `npm run seed:admin` | Crea un usuario administrador por defecto |
| `npm run env:encrypt` | Encripta el archivo .env |
| `npm run env:decrypt` | Desencripta el archivo .env.encrypted |
| `npm run env:help` | Muestra ayuda sobre encriptación de variables |

### Credenciales por Defecto

Después de ejecutar `npm run seed:admin`:
- **Email**: admin@uni.local
- **Contraseña**: admin123
- **Código**: 2024000001

> ⚠️ **Importante**: Cambia estas credenciales inmediatamente en producción

---

## 📁 Estructura del Proyecto

```
UniReportes/
├── 📂 public/              # Archivos estáticos (CSS, JS, imágenes)
│   ├── css/               # Hojas de estilo
│   ├── js/                # Scripts del cliente
│   ├── img/               # Imágenes
│   └── components/        # Componentes HTML reutilizables
├── 📂 src/                # Código fuente del servidor
│   ├── config/            # Configuración (base de datos, etc.)
│   ├── controllers/       # Lógica de negocio
│   ├── middleware/        # Middleware de Express
│   ├── models/            # Modelos de datos
│   ├── routes/            # Definición de rutas
│   ├── services/          # Servicios (email, etc.)
│   └── utils/             # Utilidades y helpers
├── 📂 views/              # Vistas HTML
├── 📂 sql/                # Scripts SQL
├── 📂 scripts/            # Scripts de utilidad
├── 📄 app.js              # Punto de entrada de la aplicación
├── 📄 package.json        # Dependencias y scripts
├── 📄 .env.example        # Ejemplo de variables de entorno
└── 📄 README.md           # Este archivo
```

---

## 🛠 Tecnologías

### Backend
- **[Node.js](https://nodejs.org/)** - Entorno de ejecución JavaScript
- **[Express.js](https://expressjs.com/)** - Framework web minimalista
- **[MySQL2](https://github.com/sidorares/node-mysql2)** - Cliente MySQL con soporte para Promises
- **[express-session](https://github.com/expressjs/session)** - Middleware de manejo de sesiones

### Seguridad
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** - Encriptación de contraseñas
- **[crypto-js](https://github.com/brix/crypto-js)** - Encriptación de variables de entorno
- **[dotenv](https://github.com/motdotla/dotenv)** - Gestión de variables de entorno

### Servicios
- **[@sendgrid/mail](https://github.com/sendgrid/sendgrid-nodejs)** - Servicio de emails (SendGrid)
- **[nodemailer](https://nodemailer.com/)** - Alternativa de envío de emails (SMTP)
- **[multer](https://github.com/expressjs/multer)** - Middleware para carga de archivos

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Diseño moderno y responsive
- **JavaScript (ES6+)** - Interactividad del cliente
- **[jQuery](https://jquery.com/)** - Manipulación del DOM
- **[Google Fonts](https://fonts.google.com/)** - Tipografías (Inter)
- **[Material Symbols](https://fonts.google.com/icons)** - Iconografía

### Desarrollo
- **[nodemon](https://nodemon.io/)** - Auto-reload en desarrollo

---

## 🔒 Seguridad

### Características de Seguridad Implementadas

1. **Encriptación de Variables de Entorno**
   - Sistema personalizado de encriptación para archivos `.env`
   - Ver [ENV_SECURITY.md](ENV_SECURITY.md) para más detalles

2. **Contraseñas Seguras**
   - Hashing con bcrypt (10 rounds)
   - Nunca se almacenan contraseñas en texto plano

3. **Sesiones Seguras**
   - Sesiones encriptadas con secret key
   - Configuración de cookies seguras
   - Headers de seguridad (X-Frame-Options, X-Content-Type-Options)

4. **Protección contra Caché**
   - Headers de no-caché en páginas sensibles
   - Prevención de acceso a datos sensibles desde botón "Atrás"

5. **Validación de Datos**
   - Middleware de autenticación en rutas protegidas
   - Validación de roles (usuario/administrador)
   - Sanitización de inputs

### Mejores Prácticas

- ⛔ **Nunca** commitear el archivo `.env` al repositorio
- ✅ Usar `.env.encrypted` para producción
- ✅ Cambiar credenciales por defecto
- ✅ Usar HTTPS en producción
- ✅ Mantener dependencias actualizadas

---

## 📧 Configuración de Email

El sistema soporta dos métodos de envío de correo:

### Opción 1: SendGrid (Recomendado)
```env
EMAIL_USER=apikey
EMAIL_PASS=tu_api_key_de_sendgrid
```

### Opción 2: SMTP
```env
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicación
```

> 💡 **Nota**: Para Gmail, necesitas crear una contraseña de aplicación en la configuración de seguridad de tu cuenta.

---

## 🗂 Base de Datos

### Tablas Principales

- **usuarios**: Gestión de usuarios del sistema
- **reportes**: Almacenamiento de reportes de daños
- **categorias**: Categorización de tipos de daños
- **comentarios**: Sistema de comentarios en reportes
- **notificaciones**: Notificaciones del sistema
- **objetos**: Catálogo de objetos/elementos del campus
- **ubicaciones**: Ubicaciones del campus universitario

### Diagrama ER

Para ver el diagrama completo de la base de datos, importa el archivo `sql/Datos_UniReportes.sql` y visualiza las relaciones.

---

## 🧪 Testing

```bash
# Verificar que el servidor está funcionando
curl http://localhost:3000/test

# Verificar usuarios en la base de datos
node check-users.js

# Verificar notificaciones
node check-notifications.js
```

---

## 📝 API Endpoints

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/logout` - Cerrar sesión
- `POST /auth/register` - Registro de usuario

### Reportes
- `GET /api/reports` - Listar reportes
- `POST /api/reports` - Crear reporte
- `GET /api/reports/:id` - Obtener reporte específico
- `PUT /api/reports/:id` - Actualizar reporte
- `DELETE /api/reports/:id` - Eliminar reporte

### Usuarios
- `GET /api/users` - Listar usuarios (admin)
- `POST /api/users` - Crear usuario (admin)
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario (admin)

### Notificaciones
- `GET /api/notifications` - Obtener notificaciones del usuario
- `PUT /api/notifications/:id/read` - Marcar como leída
- `DELETE /api/notifications/:id` - Eliminar notificación

> 📚 Para la lista completa de endpoints, consulta los archivos en `src/routes/`

---

## 🤝 Contribuir

Si deseas contribuir al proyecto:

1. Haz un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es privado y está protegido por derechos de autor.

---

## 👤 Autor

**Proyecto Universitario - UniReportes**

---

## 🙏 Agradecimientos

- Comunidad universitaria por el feedback
- Equipo de desarrollo y testing
- Todos los contribuidores del proyecto

---

<div align="center">

### ⭐ Si te gusta el proyecto, considera darle una estrella

**Desarrollado con ❤️ para mejorar la experiencia universitaria**

</div>
