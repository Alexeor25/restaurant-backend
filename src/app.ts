import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import router from './routes/index';

const app = express();


app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());


app.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.use(router);


app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});


app.use(
  (
    error: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const err = error as Error & { status?: number; statusCode?: number; type?: string };

    // Errores provocados por la petición del cliente (JSON mal formado, cuerpo
    // demasiado grande…): respondemos 4xx, no un 500 de "error interno".
    const status = err.statusCode ?? err.status;
    if (status && status >= 400 && status < 500) {
      const message =
        err.type === 'entity.parse.failed'
          ? 'JSON inválido en el cuerpo de la petición'
          : 'Petición inválida';
      return res.status(status).json({ error: message });
    }

    console.error('Error no manejado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
);

export default app;
