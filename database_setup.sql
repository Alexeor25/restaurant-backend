-- Script para crear las tablas del sistema de restaurante
-- Uso: psql -U postgres -d ortuzar -f database_setup.sql

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    orden INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos (menú)
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    category_id VARCHAR(100) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(nombre) ON DELETE CASCADE
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar categorías de ejemplo
INSERT INTO categories (nombre, orden) VALUES
('bebida', 1),
('plato', 2)
ON CONFLICT (nombre) DO NOTHING;

-- Insertar productos de ejemplo
INSERT INTO products (id, category_id, nombre, precio) VALUES
('1561', 'bebida', 'tukola', 17.00),
('1562', 'bebida', 'tukola', 147.00),
('1563', 'plato', 'pollito', 15.00)
ON CONFLICT (id) DO NOTHING;

-- Insertar admin de ejemplo
--   email:    admin@example.com
--   password: admin123
INSERT INTO admins (email, password) VALUES
('admin@example.com', '$2b$10$fUMMiGsYeqBHVdYwNW323uJCsa8PixBiFzw1WY8pZVe1lXpw0de9C')
ON CONFLICT (email) DO NOTHING;
