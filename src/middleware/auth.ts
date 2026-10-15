import jwt from 'jwt'

const authenticateToken = (req, res, next) => {
   
 const token = req.cookie.token;
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