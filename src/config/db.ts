import { Pool } from 'pg';

// La configuración de la base de datos sale de las variables de entorno.
// Ya NO hay credenciales hardcodeadas: si falta algo, falla rápido y claro.
export const db: Pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'ortuzar',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});
