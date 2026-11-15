-- Script para crear las tablas del sistema de restaurante
-- Uso: psql -U postgres -d ortuzar -f database_setup.sql

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS category (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    orden INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos (menú)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES category(id) ON DELETE CASCADE,
    nombre VARCHAR(200) NOT NULL,
    precio INTEGER NOT NULL,
    disponible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de administradores (necesaria para el login)
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(200) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de reservaciones
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200),
    phone VARCHAR(200) NOT NULL,
    date TIMESTAMP NOT NULL,
    persons INTEGER NOT NULL,
    special TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar categorías de ejemplo
INSERT INTO category (nombre, orden) VALUES
('bebida', 1),
('plato', 2)
ON CONFLICT (nombre) DO NOTHING;

-- Insertar productos de ejemplo
INSERT INTO products (id, category_id, nombre, precio) VALUES
(1561, 1, 'tukola', 8),
(1562, 1, 'tukola', 4),
(1563, 2, 'pollito', 6)
ON CONFLICT (id) DO NOTHING;

-- Ajustar el sequence de products (porque insertamos ids manuales)
SELECT setval(pg_get_serial_sequence('products', 'id'), (SELECT MAX(id) FROM products));

-- Insertar admin de ejemplo
--   email:    admin@example.com
--   password: admin123
INSERT INTO admins (email, password) VALUES
('admin@example.com', '$2b$10$fUMMiGsYeqBHVdYwNW323uJCsa8PixBiFzw1WY8pZVe1lXpw0de9C')
ON CONFLICT (email) DO NOTHING;
