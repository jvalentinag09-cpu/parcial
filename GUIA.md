# Guía: cómo está hecho este backend y cómo cambiarlo

## 1. La idea en una línea

Una petición entra y pasa por capas. Cada capa hace una sola cosa:

```
App Android ──HTTP──> routes ──> validators ──> repository ──SQL──> SQLite (parcial.db)
                        │                                              
                        └──── responde { status, message, data } <─────┘
```

| Archivo | Qué hace | Qué NO hace |
|---|---|---|
| `app.js` (raíz) | Arranca todo: crea la BD, los repositorios y la app | Lógica |
| `src/config.js` | Puerto y nombre del archivo de BD | |
| `src/database.js` | Abre SQLite y crea las tablas | Consultas del negocio |
| `src/planRepository.js` | **Todo el SQL** de la tabla plans | Saber de HTTP |
| `src/aporteRepository.js` | **Todo el SQL** de la tabla aportes | Saber de HTTP |
| `src/validators.js` | Revisa lo que llega (tipos, vacíos, negativos) | SQL |
| `src/planRoutes.js` | Endpoints `/v1/planes`: lee, valida, llama al repositorio, responde | SQL |
| `src/aporteRoutes.js` | Endpoints `/v1/planes/:id/aportes` | SQL |
| `src/responses.js` | Formato común de respuestas | |
| `src/app.js` | Arma Express, monta las rutas, maneja 404 y errores | |
| `test/api.test.js` | Pruebas con BD en memoria | |

## 2. Recetas para cambios típicos

### Agregar un campo (ej. `descripcion` al plan)

1. `database.js`: agrega `descripcion TEXT NOT NULL DEFAULT ''` en el `CREATE TABLE plans`.
2. **Borra `parcial.db`** (CREATE TABLE IF NOT EXISTS no modifica una tabla existente).
3. `planRepository.js`: agrégalo al `INSERT`, a los `SELECT` y al `normalize`.
4. `validators.js`: valida `descripcion` en `validatePlan`.
5. En la app: ver `README.md` de la app para cambiarla también.

### Agregar una validación

Todo está en `validators.js`. Cada función devuelve un mensaje de error o `null`.

### Agregar un endpoint (ej. `PUT /v1/planes/:id` para editar)

1. `planRepository.js`: `const updatePlan = db.prepare('UPDATE plans SET nombre=?, meta=?, fecha_limite=? WHERE id=?')` y método `update(id, data)`.
2. `planRoutes.js`: `router.put('/:id', ...)` que valide, llame a `update` y responda.

### Agregar un recurso nuevo (ej. `categorias`)

1. Tabla en `database.js`.
2. Copia `aporteRepository.js` como `categoriaRepository.js`.
3. Validación en `validators.js`.
4. Copia `planRoutes.js` como `categoriaRoutes.js`.
5. En `src/app.js`: `app.use('/v1/categorias', createCategoriaRoutes(categoriaRepository))`.
6. En `app.js` raíz: crea el repositorio y pásalo a `createApp`.

### Cambiar el puerto

`PORT=4000 npm start` en Git Bash, o cambia el valor por defecto en `config.js`.

## 3. SQL útil

- Se usa `node:sqlite`, el SQLite incluido en Node 22.5+. No se instala nada.
- `db.prepare(sql)` prepara la consulta. `.get()` una fila, `.all()` varias, `.run()` INSERT/UPDATE/DELETE.
- Los `?` son parámetros. Nunca concatenes texto del usuario en el SQL.
- `run()` devuelve `lastInsertRowid` y `changes` como BigInt; se convierten con `Number(...)`.
- `PRAGMA foreign_keys = ON` + `ON DELETE CASCADE`: al borrar un plan se borran sus aportes.

## 4. Códigos de respuesta

| Código | Cuándo |
|---|---|
| 200 | Consulta o borrado correcto |
| 201 | Se creó algo (POST) |
| 400 | Datos inválidos o JSON mal formado |
| 404 | El plan no existe o la ruta no existe |
| 500 | Error inesperado (revisa la consola) |

## 5. Errores comunes

- **`Cannot find module 'express'`**: falta `npm install`.
- **Cambié la tabla y no aparece el campo**: borra `parcial.db` y vuelve a arrancar.
- **La app no conecta**: el backend no está corriendo, se usó `localhost` en vez de `10.0.2.2` en el emulador, o falta `usesCleartextTraffic` en el Manifest.
- **`EADDRINUSE`**: el puerto 3000 ya está en uso.
