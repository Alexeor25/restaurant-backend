import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../../../config/db';
import type { LoginInput } from '../../../schemas/auth';


export const createToken = async (
  req: Request<Record<string, string>, unknown, LoginInput>,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    const result = await db.query(
      'SELECT id, email, password FROM admins WHERE lower(email) = $1',
      [email]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!user.password.startsWith('$2')) {
      console.error(
        `El admin ${user.email} tiene la contraseña sin hashear. ` +
          'Corrígelo con: npm run create-admin -- --email <correo> --password <clave> --update'
      );
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
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax',
      path: '/api/refresh', 
    });

    res.json({ accessToken });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el login' });
  }
};


export const logout = (_req: Request, res: Response) => {
  res.clearCookie('refreshToken', { path: '/api/refresh' });
  res.json({ message: 'Sesión cerrada' });
};
