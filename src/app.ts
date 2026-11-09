import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import router from './routes/index';

const app = express();

// CORS: en desarrollo permitimos el origen del frontend.
// `credentials: true` es necesario para poder enviar cookies entre
// el frontend y el backend cuando están en distintos dominios/puertos.
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(router);

// Ruta no encontrada (404)
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejador de errores centralizado.
// Nunca le mandamos el error crudo al cliente: podría filtrar información.
app.use(
  (
    error: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Error no manejado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
);

export default app;
