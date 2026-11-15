import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

/**
 * POST /api/refresh
 * Ruta PÚBLICA: usa la cookie de refresh para emitir un nuevo access token.
 * Así el access token puede durar poco (1h) sin que el admin tenga que
 * loguearse de nuevo cada vez.
 */
export const refreshToken = (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;

  // Sin cookie de refresh el visitante simplemente NO tiene sesión de admin
  // (es lo normal en el sitio público). Respondemos 200 con accessToken: null
  // en vez de 401 para que el navegador no registre un error en consola
  // en cada carga de la página.
  if (!token) {
    return res.json({ accessToken: null });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.REFRESH_SECRET as string
    ) as { id: number };

    const newAccessToken = jwt.sign(
      { id: payload.id },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    return res.json({ accessToken: newAccessToken });
  } catch {
    return res.sendStatus(403);
  }
};
