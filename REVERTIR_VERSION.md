# 🔄 Cómo Revertir a una Versión Anterior del Repositorio

Esta guía explica cómo volver a una versión anterior del repositorio UniReportes usando Git.

## 📋 Tabla de Contenidos

1. [Ver Historial de Versiones](#ver-historial-de-versiones)
2. [Métodos para Revertir Cambios](#métodos-para-revertir-cambios)
3. [Escenarios Comunes](#escenarios-comunes)
4. [Precauciones Importantes](#precauciones-importantes)

---

## 🔍 Ver Historial de Versiones

### Ver commits recientes

```bash
git log --oneline -10
```

Esto muestra los últimos 10 commits con sus identificadores (hash) y mensajes.

### Ver historial detallado

```bash
git log
```

Muestra información completa: autor, fecha, mensaje completo.

### Ver historial con cambios

```bash
git log -p
```

Muestra los commits con los cambios específicos en cada archivo.

### Ver historial gráfico

```bash
git log --oneline --graph --all
```

Visualiza el historial con ramas y merges.

---

## ⚙️ Métodos para Revertir Cambios

### Opción 1: Deshacer Cambios Locales (No Guardados)

**Situación:** Hiciste cambios pero NO los has agregado con `git add`.

```bash
# Deshacer cambios en un archivo específico
git checkout -- nombre_archivo.js

# Deshacer TODOS los cambios no guardados
git checkout -- .
```

⚠️ **ADVERTENCIA:** Esta acción es irreversible. Los cambios se perderán permanentemente.

---

### Opción 2: Deshacer Cambios Preparados (Staged)

**Situación:** Hiciste `git add` pero NO has hecho `git commit`.

```bash
# Quitar un archivo del stage (mantiene los cambios)
git reset HEAD nombre_archivo.js

# Quitar TODOS los archivos del stage
git reset HEAD

# Luego, si quieres descartar los cambios completamente
git checkout -- .
```

---

### Opción 3: Revertir el Último Commit (Manteniendo Cambios)

**Situación:** Ya hiciste `git commit` pero quieres deshacer el commit manteniendo los cambios.

```bash
# Deshace el último commit pero mantiene los cambios en el área de trabajo
git reset --soft HEAD~1
```

**¿Qué hace?**
- Elimina el último commit
- Los cambios permanecen en tu área de trabajo
- Puedes modificarlos y volver a hacer commit

**Ejemplo:**
```bash
# Ver el último commit
git log --oneline -1

# Deshacer el último commit
git reset --soft HEAD~1

# Los cambios siguen ahí, puedes editarlos
# Luego hacer commit nuevamente
git add .
git commit -m "Mensaje corregido"
```

---

### Opción 4: Revertir el Último Commit (Descartando Cambios)

**Situación:** Quieres eliminar completamente el último commit y sus cambios.

```bash
# ⚠️ PELIGROSO: Elimina el último commit y TODOS sus cambios
git reset --hard HEAD~1
```

⚠️ **ADVERTENCIA EXTREMA:** Esta acción es IRREVERSIBLE. Perderás todos los cambios del commit.

---

### Opción 5: Revertir Varios Commits

**Situación:** Quieres deshacer los últimos N commits.

```bash
# Reemplaza N con el número de commits a deshacer
# Por ejemplo, para deshacer los últimos 3 commits:

# Manteniendo los cambios:
git reset --soft HEAD~3

# Descartando los cambios (PELIGROSO):
git reset --hard HEAD~3
```

---

### Opción 6: Volver a un Commit Específico

**Situación:** Quieres volver a un commit específico del pasado.

```bash
# Paso 1: Ver el historial y copiar el hash del commit
git log --oneline

# Paso 2: Volver a ese commit (manteniendo cambios)
git reset --soft [hash-del-commit]

# Paso 2 alternativo: Volver a ese commit (descartando cambios)
git reset --hard [hash-del-commit]
```

**Ejemplo:**
```bash
# Historial:
# abc1234 Último commit
# def5678 Commit anterior
# ghi9012 Commit que quiero recuperar

# Volver al commit ghi9012
git reset --hard ghi9012
```

---

### Opción 7: Crear un Commit de Reversión (Recomendado para Producción)

**Situación:** Ya compartiste los commits (hiciste `git push`) y otros tienen esos cambios.

```bash
# Revierte un commit específico creando un NUEVO commit
git revert [hash-del-commit]

# Revertir el último commit
git revert HEAD
```

**¿Por qué usar esto?**
- ✅ No reescribe el historial
- ✅ Seguro para repositorios compartidos
- ✅ Mantiene un registro de la reversión
- ✅ Otros desarrolladores no tendrán conflictos

**Ejemplo:**
```bash
# Ver commits
git log --oneline
# abc1234 Agregar función rota
# def5678 Commit anterior bueno

# Revertir el commit problemático
git revert abc1234

# Esto crea un NUEVO commit que deshace los cambios de abc1234
# El historial queda intacto
```

---

### Opción 8: Ver un Archivo de una Versión Anterior

**Situación:** Solo necesitas recuperar UN archivo de una versión anterior.

```bash
# Ver el archivo en un commit específico (sin cambiar nada)
git show [hash-del-commit]:ruta/al/archivo.js

# Recuperar el archivo de un commit específico
git checkout [hash-del-commit] -- ruta/al/archivo.js

# Recuperar archivo del commit anterior
git checkout HEAD~1 -- ruta/al/archivo.js
```

**Ejemplo:**
```bash
# Recuperar app.js del commit anterior
git checkout HEAD~1 -- app.js

# Luego hacer commit del cambio
git add app.js
git commit -m "Recuperar app.js de versión anterior"
```

---

## 📚 Escenarios Comunes

### Escenario 1: "¡Cometí un error en el último commit!"

```bash
# Si NO has hecho push:
git reset --soft HEAD~1
# Edita los archivos
git add .
git commit -m "Mensaje corregido"

# Si YA hiciste push:
git revert HEAD
git push
```

---

### Escenario 2: "Quiero descartar todos los cambios locales"

```bash
# Ver qué cambios tienes
git status

# Descartar TODOS los cambios no guardados
git checkout -- .

# O si también quieres eliminar archivos nuevos:
git clean -fd
```

---

### Escenario 3: "La aplicación funcionaba ayer, ahora está rota"

```bash
# Paso 1: Ver historial de ayer
git log --since="yesterday" --oneline

# Paso 2: Identificar el commit bueno (por ejemplo: abc1234)
# Paso 3: Crear una nueva rama para probar
git checkout -b prueba-version-anterior abc1234

# Paso 4: Probar que funciona
npm start

# Paso 5: Si funciona, volver a main y revertir
git checkout main
git revert [commits-problemáticos]
```

---

### Escenario 4: "Necesito recuperar un archivo que eliminé"

```bash
# Paso 1: Buscar cuándo se eliminó el archivo
git log --all --full-history -- ruta/al/archivo.js

# Paso 2: Recuperar del commit anterior a la eliminación
git checkout [hash-del-commit]^ -- ruta/al/archivo.js

# Paso 3: Hacer commit
git add ruta/al/archivo.js
git commit -m "Recuperar archivo eliminado"
```

---

### Escenario 5: "Quiero ver cómo era el proyecto hace una semana"

```bash
# Crear una rama temporal para explorar
git checkout -b exploracion [hash-o-fecha]

# Por fecha:
git checkout -b exploracion @{2025-11-07}

# Ver el proyecto
npm start

# Volver a la rama principal
git checkout main
git branch -d exploracion
```

---

## ⚠️ Precauciones Importantes

### 🔴 NUNCA uses `git reset --hard` si:

1. Ya hiciste `git push` (compartiste los cambios)
2. Otros desarrolladores trabajan en la misma rama
3. No estás 100% seguro de lo que estás haciendo

### 🟡 Alternativas Seguras:

- ✅ Usa `git revert` para repositorios compartidos
- ✅ Usa `git reset --soft` para mantener cambios
- ✅ Crea ramas temporales para experimentar

### 🔵 Consejos de Seguridad:

```bash
# Antes de hacer cambios drásticos, crea un respaldo:
git branch respaldo-$(date +%Y%m%d)

# Esto crea una rama con la fecha actual
# Por ejemplo: respaldo-20251114
```

---

## 🆘 ¿Cometiste un Error con Git?

### Recuperar después de `git reset --hard`

Si acabas de hacer un `git reset --hard` accidental:

```bash
# Ver el historial de todas las acciones (incluso las "eliminadas")
git reflog

# Identificar el commit que perdiste
# Restaurar:
git reset --hard [hash-del-commit-perdido]
```

**El reflog es tu salvavidas:** Git mantiene un registro de TODOS los movimientos durante ~30 días.

---

## 📞 Comandos Útiles de Referencia

```bash
# Ver estado actual
git status

# Ver diferencias no guardadas
git diff

# Ver diferencias en staged
git diff --staged

# Ver historial resumido
git log --oneline -10

# Ver qué cambió en un commit
git show [hash-del-commit]

# Ver reflog (historial de movimientos)
git reflog

# Crear rama de respaldo
git branch respaldo-emergencia

# Listar todas las ramas
git branch -a
```

---

## 🎓 Ejemplos Prácticos para UniReportes

### Ejemplo 1: Revertir cambios en app.js

```bash
# Tienes cambios en app.js que no quieres
git checkout -- app.js
```

### Ejemplo 2: Deshacer el último commit en notificaciones

```bash
# Hiciste commit de cambios en notificaciones pero hay un error
git reset --soft HEAD~1

# Edita public/js/notificaciones.js
nano public/js/notificaciones.js

# Vuelve a hacer commit
git add .
git commit -m "Corregir sistema de notificaciones"
```

### Ejemplo 3: Recuperar configuración de base de datos anterior

```bash
# Recuperar archivo .env.example de hace 2 commits
git checkout HEAD~2 -- .env.example

git add .env.example
git commit -m "Restaurar configuración de base de datos anterior"
```

---

## 📖 Glosario

- **Commit:** Una versión guardada de tu código
- **Hash:** Identificador único de un commit (ej: abc1234)
- **HEAD:** El commit actual donde estás ubicado
- **HEAD~1:** Un commit antes del actual
- **HEAD~N:** N commits antes del actual
- **Staged:** Archivos preparados para commit con `git add`
- **Working Directory:** Tu carpeta de trabajo actual
- **Reflog:** Historial de todos los movimientos en Git

---

## 💡 Mejores Prácticas

1. **Haz commits frecuentes** con mensajes descriptivos
2. **Crea ramas** para características nuevas
3. **Haz push regularmente** para respaldar en GitHub
4. **No uses `--hard`** en ramas compartidas
5. **Usa `.gitignore`** para no incluir archivos sensibles
6. **Lee el mensaje** antes de confirmar comandos destructivos

---

## 🔗 Recursos Adicionales

- [Documentación oficial de Git](https://git-scm.com/doc)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Aprende Git interactivamente](https://learngitbranching.js.org/?locale=es_ES)

---

**Última actualización:** 14 de noviembre de 2025  
**Versión:** 1.0  
**Proyecto:** UniReportes
