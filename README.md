# 📊 UniReportes

Sistema de gestión de reportes universitarios con notificaciones en tiempo real.

## 📚 Documentación

- [🔐 Sistema de Cifrado .env](ENV_SECURITY.md)
- [🔔 Instrucciones de Notificaciones](INSTRUCCIONES_NOTIFICACIONES.md)
- [🔄 Cómo Revertir a una Versión Anterior](REVERTIR_VERSION.md)

## 🚀 Inicio Rápido

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Caro-ov/UniReportes.git
cd UniReportes

# Instalar dependencias
npm install

# Configurar variables de entorno
npm run env:decrypt
# O copiar .env.example a .env y configurar manualmente

# Iniciar el servidor
npm start
```

### Desarrollo

```bash
# Modo desarrollo con auto-reinicio
npm run dev
```

## 📋 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor en producción |
| `npm run dev` | Inicia el servidor en modo desarrollo |
| `npm run seed:admin` | Crea usuario administrador inicial |
| `npm run env:encrypt` | Cifra el archivo .env |
| `npm run env:decrypt` | Descifra el archivo .env |
| `npm run env:help` | Muestra ayuda sobre cifrado de variables |

## 🛠️ Tecnologías

- **Backend:** Node.js + Express
- **Base de Datos:** MySQL
- **Autenticación:** Express-Session + bcryptjs
- **Seguridad:** Cifrado de variables de entorno con crypto-js
- **Frontend:** HTML, CSS, JavaScript (Vanilla)

## 📂 Estructura del Proyecto

```
UniReportes/
├── app.js                  # Archivo principal del servidor
├── package.json            # Dependencias y scripts
├── .env.example            # Template de variables de entorno
├── public/                 # Archivos estáticos (CSS, JS, imágenes)
│   ├── css/
│   ├── js/
│   └── img/
├── src/                    # Código fuente
│   ├── controllers/        # Controladores de rutas
│   ├── middlewares/        # Middlewares personalizados
│   ├── models/             # Modelos de base de datos
│   └── routes/             # Definición de rutas
├── views/                  # Vistas HTML
├── scripts/                # Scripts de utilidad
└── sql/                    # Scripts SQL
```

## 🔒 Seguridad

Este proyecto incluye medidas de seguridad importantes:

- ✅ Cifrado de variables de entorno sensibles
- ✅ Autenticación basada en sesiones
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Protección contra inyección SQL con consultas preparadas

Ver [ENV_SECURITY.md](ENV_SECURITY.md) para más detalles.

## 🔄 Control de Versiones

¿Necesitas revertir cambios o volver a una versión anterior? Consulta nuestra guía completa:

➡️ [**Guía: Cómo Revertir a una Versión Anterior**](REVERTIR_VERSION.md)

## 🤝 Contribuir

1. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
2. Haz commit de tus cambios: `git commit -m 'Agregar nueva funcionalidad'`
3. Haz push a la rama: `git push origin feature/nueva-funcionalidad`
4. Abre un Pull Request

## 📝 Licencia

Este proyecto es privado y de uso exclusivo universitario.

---

**Última actualización:** 14 de noviembre de 2025  
**Versión:** 0.1.0
