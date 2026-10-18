import jwt from 'jwt'
import { Request, Response} from 'express'
const authenticateToken = (req:Request, res:Response, next:any) => {
   
 const token = req.cookies.token;
 if (!token) {
      return next();
    }
try{
    jwt.verify(token, process.env.JWT_SECRET);
   res.send({isAdmin: true})
    }catch(error){
        return res.status(403).json({ error: 'Token inválido o expirado' });
    }

}