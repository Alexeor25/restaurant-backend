# Backend del restaurante

API REST con Node.js, Express, TypeScript y PostgreSQL para gestionar el menú,
las categorías y las reservaciones de un restaurante.

## Requisitos

- Node.js 20+
- PostgreSQL 14+

## Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Crear la base de datos y las tablas
psql -U postgres -d ortuzar -f database_setup.sql

# 3. Configurar las variables de entorno
cp .env.example .env   # y editar los valores

# 4. Levantar el servidor en modo desarrollo
npm run dev
```

El servidor corre en `http://localhost:3000`.

### Admin de prueba

El script de base de datos crea un administrador:

| Email | Password |
|---|---|
| `admin@example.com` | `admin123` |

## Variables de entorno

| Variable | Descripción | Default |
|---|---|---|
| `PORT` | Puerto del servidor | `3000` |
| `NODE_ENV` | Entorno (`development` / `production`) | — |
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_NAME` | Nombre de la base de datos | `ortuzar` |
| `DB_USER` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | — |
| `JWT_SECRET` | Secreto del access token | — |
| `REFRESH_SECRET` | Secreto del refresh token | — |
| `CLIENT_URL` | Origen permitido por CORS | `http://localhost:5173` |

## Endpoints

### Públicos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/principal/v1/menu` | Menú completo |
| POST | `/api/principal/v1/reservation` | Crear una reservación |
| POST | `/api/admin/v1/login` | Login de administrador |
| POST | `/api/admin/v1/logout` | Logout |
| POST | `/api/refresh` | Renovar el access token |

### Admin (requieren `Authorization: Bearer <token>`)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/admin/v1/menu` | Listar productos |
| POST | `/api/admin/v1/menu` | Crear producto |
| PUT | `/api/admin/v1/menu/:id` | Actualizar producto |
| DELETE | `/api/admin/v1/menu/:id` | Eliminar producto |
| GET | `/api/admin/v1/categories` | Listar categorías |
| POST | `/api/admin/v1/categories` | Crear categoría |
| PUT | `/api/admin/v1/categories/:id` | Actualizar categoría |
| DELETE | `/api/admin/v1/categories/:id` | Eliminar categoría |
| GET | `/api/admin/v1/reservations` | Listar reservaciones |
| GET | `/api/admin/v1/reservations/:id` | Ver una reservación |
| PUT | `/api/admin/v1/reservations/:id` | Actualizar reservación |
| DELETE | `/api/admin/v1/reservations/:id` | Eliminar reservación |

### Flujo de autenticación

1. `POST /api/admin/v1/login` con `{ email, password }` → devuelve `accessToken`.
2. Usar ese token en el header `Authorization: Bearer <accessToken>` en las rutas admin.
3. Cuando el access token expira (1h), llamar a `POST /api/refresh` para obtener uno nuevo
   (usa una cookie httpOnly que se setea sola en el login).

## Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor en modo desarrollo |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Ejecuta el build compilado |
