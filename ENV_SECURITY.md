# 🔐 Sistema de Cifrado .env - UniReportes

Este proyecto incluye un sistema de cifrado para proteger las variables de entorno sensibles.

## 📋 Comandos Disponibles

### Cifrar archivo .env

```bash
npm run env:encrypt
```

- Cifra el archivo `.env` actual
- Crea `.env.encrypted` (archivo cifrado)
- Crea `.env.example` (template sin datos sensibles)
- **Importante**: Guarda tu contraseña de forma segura

### Descifrar archivo .env

```bash
npm run env:decrypt
```

- Descifra el archivo `.env.encrypted`
- Recrea el archivo `.env` original
- Requiere la misma contraseña usada para cifrar

### Ver ayuda

```bash
npm run env:help
```

## 🚀 Uso en Desarrollo

### Primera vez (cifrar):

1. Asegúrate de que tu `.env` tenga todas las variables necesarias
2. Ejecuta: `npm run env:encrypt`
3. Ingresa una contraseña segura (ej: `UniReportes2025!`)
4. Se crean los archivos `.env.encrypted` y `.env.example`
5. El archivo `.env` original se puede eliminar

### Trabajando en el proyecto:

1. Si no tienes `.env`, ejecuta: `npm run env:decrypt`
2. Ingresa la contraseña
3. Inicia el servidor: `npm start`

## 🔧 Uso en Producción

### Opción 1: Descifrar en servidor

```bash
# En el servidor de producción
npm run env:decrypt
npm start
```

### Opción 2: Variables de entorno del sistema

```bash
# Establecer variables directamente en el servidor
export DB_PASSWORD="tu_password_aqui"
export SESSION_SECRET="tu_secret_aqui"
npm start
```

## 📁 Archivos del Sistema

- `.env` - Archivo original con variables (NO subir a git)
- `.env.encrypted` - Archivo cifrado (SEGURO subir a git)
- `.env.example` - Template sin datos sensibles (subir a git)
- `scripts/envCrypto.js` - Script de cifrado/descifrado

## 🔒 Seguridad

### ✅ Buenas Prácticas

- Usa contraseñas fuertes (mín. 8 caracteres, mayúsculas, números, símbolos)
- Guarda la contraseña en un gestor de contraseñas
- No compartas la contraseña en texto plano
- El archivo `.env.encrypted` es seguro para repositorios

### ❌ NO hagas esto

- No subas el archivo `.env` sin cifrar al repositorio
- No pongas la contraseña en comentarios o código
- No uses contraseñas débiles como "123456"

## 🆘 Solución de Problemas

### Error: "Contraseña incorrecta"

- Verifica que estés usando la misma contraseña para cifrar y descifrar
- Las contraseñas son sensibles a mayúsculas/minúsculas

### Error: "No se encontró archivo .env.encrypted"

- Primero debes cifrar con `npm run env:encrypt`
- Verifica que el archivo `.env.encrypted` exista

### Error: "No se encontró archivo .env"

- Usa `npm run env:decrypt` para crear el archivo
- O copia `.env.example` a `.env` y edita los valores

## 📞 Variables de Entorno Requeridas

```bash
# Puerto del servidor
PORT=3000

# Secreto para sesiones (cambiar en producción)
SESSION_SECRET=supersecreto-cambia-esto

# Configuración MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_aqui
DB_NAME=unireportes
```

---

**💡 Tip**: Siempre haz backup de tu contraseña y del archivo `.env.encrypted`
