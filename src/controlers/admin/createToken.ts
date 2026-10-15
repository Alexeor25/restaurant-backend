import { Request, Response } from 'express';
import { db } from '../../config/db';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
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
const {email,password} = req.body;

 if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y contraseña son requeridos' 
      });
    }

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

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
      },
      process.env.JWT_SECRET || "clave super secreta",
      { expiresIn: '120min' }
    );

        res.cookie('token',token,{
          httpOnly: true,
          secure: false,
          maxAge: 3600000,
          sameSite:'strict'
        });
       
        res.json({isAdmin: true})
}