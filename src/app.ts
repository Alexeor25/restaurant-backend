import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { ZodError } from 'zod';
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
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    // 1) Datos inválidos según Zod: 400 con el detalle de cada campo.
    //    `error` incluye un resumen legible porque el frontend muestra ese
    //    texto directamente (por ejemplo, el formulario de reservas).
    if (error instanceof ZodError) {
      const details = error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
      }));
      const first = details[0]?.message ?? 'Revisa los datos enviados';
      return res.status(400).json({
        error: `Datos inválidos: ${first}`,
        details,
      });
    }

    // 2) Errores provocados por la petición del cliente (JSON mal formado,
    //    cuerpo demasiado grande…): respondemos 4xx, no un 500 interno.
    const err = error as Error & {
      status?: number;
      statusCode?: number;
      type?: string;
    };
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
