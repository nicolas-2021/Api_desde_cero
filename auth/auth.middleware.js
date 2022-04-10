require ('dotenv').config();


const jwt = require('jsonwebtoken');
const {ACCESS_TOKEN_SECRET} = process.env;

exports.checkAuth = function(req, res, next){

    const header = req.header('Authorization');

    if (!header){
        throw new Error('Acceso denegado');
    }else{
        const [bearer, token] = header.split(' ');

        if(bearer === 'Bearer' && token){
            try{
                const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
                req.user = payload.user;
                next();
            }catch(error){
                if(error.name === 'TokenExpiredError'){
                    throw new Error('El token ha Expirado; pruebe loguearse nuevamente');
                }else if(error.name === 'JsonWebTokenError'){
                   throw new Error('El token no es valido'); 
                }
            }
        }else{
            throw new Error('Token invalido');
        }
    }
    
}