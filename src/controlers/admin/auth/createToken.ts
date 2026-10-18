import { Request, Response } from 'express';

import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { db } from '../../config/db';
const findUserByEmail = async (email: string)=>{
    try {
      const query = 'SELECT * FROM admins WHERE email = $1';
      const result = await db.query(query, [email]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error en findByEmail:', error);
      throw error;
    }
  }
  

export const createToken = async (req: Request,res: Response )=>{

const user = await findUserByEmail(email);
    if (user == null) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }
    
const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

   const accessToken = jwt.sign({ userId: user.id }, PRIVATE_KEY, { 
    algorithm: 'RS256', 
    expiresIn: '1h' 
  });

  const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, { 
    expiresIn: '7d' 
  });

 res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', 
    path: '/api/refresh' 
  });
    res.json({ accessToken });
}