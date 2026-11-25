# backend-parcial

API para la app **Plan Familiar de Ahorro** (parcial Programación por Componentes).
Hecha con Node.js + Express + SQLite (incluido en Node).

### Requisitos

- Node.js 22.5 o superior

### Correr el proyecto

```
npm install
npm start
```

Queda en `http://localhost:3000`. La BD se crea sola en `parcial.db`.

### Correr las pruebas

```
npm test
```

### Endpoints

| Método | Ruta | Body |
|---|---|---|
| GET | `/` | health check |
| GET | `/v1/planes` | lista de planes |
| GET | `/v1/planes/:id` | un plan |
| POST | `/v1/planes` | `{ "nombre": "Viaje", "meta": 5000000, "fecha_limite": "31/12/2026" }` |
| DELETE | `/v1/planes/:id` | borrar plan |
| GET | `/v1/planes/:id/aportes` | aportes del plan |
| POST | `/v1/planes/:id/aportes` | `{ "integrante": "Jorge", "monto": 200000, "fecha": "15/05/2026" }` |

Formato de respuesta: `{ "status", "message", "data" }`.
Cada plan trae además: `total_ahorrado` y `monto_restante`.

### Desde la app Android

- Emulador: `http://10.0.2.2:3000`
- Celular físico: `http://<IP-local-del-PC>:3000` (mismo wifi)
- Manifest: permiso `INTERNET` + `android:usesCleartextTraffic="true"`

### Cómo agregar algo

Lee `GUIA.md` para ver dónde va cada cambio (campo nuevo, endpoint nuevo, etc.).
