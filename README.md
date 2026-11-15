# Backend del Restaurante Ortuzar

API REST con Node.js, Express, TypeScript y PostgreSQL para gestionar el menú,
las categorías y las reservaciones de un restaurante.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Runtime | Node.js 20+ |
| Lenguaje | TypeScript 5 (compila a `dist/` con `tsc`) |
| Framework HTTP | Express 5 |
| Base de datos | PostgreSQL 14+ con driver `pg` (Pool de conexiones) |
| Autenticación | JWT (`jsonwebtoken`) + `bcrypt` |
| Cookies | `cookie-parser` (refresh token `httpOnly`) |
| CORS | `cors` con credenciales habilitadas |
| Configuración | `dotenv` |
| Desarrollo | `ts-node` |

## Estructura del proyecto

```
restaurant-backend/
├── src/
│   ├── server.ts             # Arranque del servidor (PORT, cierre elegante)
│   ├── app.ts                # App Express: CORS, JSON, cookies, rutas, errores
│   ├── config/
│   │   └── db.ts             # Pool de PostgreSQL (variables de entorno)
│   ├── middleware/
│   │   └── auth.ts           # authenticateToken (JWT en header Bearer)
│   ├── routes/
│   │   └── index.ts          # Definición de todas las rutas
│   └── controlers/
│       ├── principal/v1/     # Lógica del sitio público
│       │   ├── menu.ts       # GET menú (y getCategories, sin uso actual)
│       │   └── reservation.ts# POST crear reservación
│       └── admin/
│           ├── auth/
│           │   ├── createToken.ts    # Login + emisión de tokens + cookie
│           │   └── refreshToken.ts   # Renovación del access token
│           └── CRUD/
│               ├── menu.ts           # CRUD productos y categorías
│               └── reservation.ts    # CRUD reservaciones
├── database_setup.sql        # Creación de tablas y datos de ejemplo
├── tsconfig.json
└── .env.example              # Plantilla de variables de entorno
```

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

## Modelo de datos

| Tabla | Campos principales | Observaciones |
|---|---|---|
| `category` | `id`, `nombre` (único), `orden` | Categorías del menú |
| `products` | `id`, `category_id` (FK → `category`), `nombre`, `precio`, `disponible` | Carta del restaurante |
| `reservations` | `id`, `name`, `email`, `phone`, `date`, `persons`, `special`, `status` | `status`: `pending` / `confirmed` / `cancelled` |
| `admins` | `id`, `email` (único), `password` (bcrypt) | Usuarios del panel admin |

## Endpoints

### Públicos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/principal/v1/menu` | Menú completo (incluye el nombre de la categoría) |
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

## Seguridad implementada

- Contraseñas hasheadas con bcrypt.
- Access token de corta duración (1 h) en memoria; refresh token (7 d) en cookie `httpOnly`.
- El login devuelve el mismo mensaje para "usuario inexistente" y "clave incorrecta".
- Consultas SQL parametrizadas (sin inyección SQL).
- Validación de datos de entrada (p. ej. `persons` debe ser un entero mayor a 0).
- Cabecera `Cache-Control: no-store` en todas las respuestas.

## Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor en modo desarrollo (`ts-node src/server.ts`) |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Ejecuta el build compilado (`node dist/server.js`) |
