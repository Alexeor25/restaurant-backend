import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../../../config/db';

/**
 * POST /api/admin/v1/login
 * Ruta PÚBLICA: valida credenciales y devuelve un access token.
 * También setea una cookie httpOnly con el refresh token.
 */
export const createToken = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email y password son requeridos' });
    }

    const result = await db.query('SELECT * FROM admins WHERE email = $1', [
      email,
    ]);
    const user = result.rows[0];

    // Mismo mensaje para "usuario no existe" y "password incorrecta",
    // así no filtramos información sobre qué usuarios existen.
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_SECRET as string,
      { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // la cookie no se puede leer desde JavaScript (protege contra XSS)
      secure: process.env.NODE_ENV === 'production', // solo por HTTPS en producción
      sameSite: 'lax',
      path: '/api/refresh', // solo se envía a esta ruta
    });

    res.json({ accessToken });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el login' });
  }
};

/**
 * POST /api/admin/v1/logout
 * Ruta PÚBLICA: limpia la cookie de refresh.
 */
export const logout = (_req: Request, res: Response) => {
  res.clearCookie('refreshToken', { path: '/api/refresh' });
  res.json({ message: 'Sesión cerrada' });
};
