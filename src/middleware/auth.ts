import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';

// Extendemos Request para poder guardar el usuario autenticado y tiparlo.
export interface AuthRequest extends Request {
  user?: { id: number; email: string };
}

/**
 * Middleware que EXIGE un token válido.
 *
 * Importante: este middleware se aplica SOLO a las rutas que necesitan
 * protección (las de admin). La ruta de login NO lo usa, justamente
 * porque es la que permite obtener el token la primera vez.
 *
 * El token se manda así: Authorization: Bearer <token>
 */
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : undefined;

  if (!token) {
    return res.status(401).json({
      error: 'Token requerido. Usá el header: Authorization: Bearer <token>',
    });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { id: number; email: string };

    req.user = payload;
    next();
  } catch {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};
