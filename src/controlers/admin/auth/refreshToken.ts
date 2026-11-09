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

  if (!token) {
    return res.sendStatus(401);
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

    res.json({ accessToken: newAccessToken });
  } catch {
    res.sendStatus(403);
  }
};
