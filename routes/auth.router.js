var express = require('express');
const createError = require('http-errors');
var router = express.Router();
const {jsonresponse} = require('../lib/jsonresponse');
const jwt = require('jsonwebtoken');
const Token = require('../model/token.model');
const {ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET} = process.env;

const User= require('../model/users.model');


//el post en users.router.js no deberia existir queda de referencia por eso el codigo es ~=.
router.post('/signup', async (req, res, next) => {   
    const {username, password} = req.body;

    if(!username || !password){
      next(createError(400, 'El Usuario y la contraseña son requeridos'));
    }else if(username && password){
      const user = new User({username, password});
  
      const exists = await user.usernameExists(username);
  
      if(exists){
        next(createError(400, 'El Usuario ya existe'));
      }else{
        const accessToken = user.createAccessToken();
        const refreshToken = await user.createRefreshToken();  
        await user.save();
  
        res.json(jsonresponse(200, {
          message: 'El Usuario fue registrado correctamente', 
          accessToken,
          refreshToken
        }));
      }
    }
});

router.post('/login', async (req, res, next) => {
  const {username, password} = req.body;

  if(!username || !password){
    next(createError(400, 'El Usuario y la contraseña son requeridos'));
  }else if(username && password){
    try{
        let user = new User({username, password});

        const userExists = user.usernameExists(username);

        if(userExists){
            const user = await User.findOne({username:username});
            const passwordCorrect = await user.isCorrectPassword(password, user.password);
        if(passwordCorrect){
          const accessToken = user.createAccessToken();
          const refreshToken = await user.createRefreshToken();

        res.json(jsonresponse(200, {message : 'Se ha logueado satisfactoriamente',
        accessToken,
        refreshToken
    }));
        }else{
          next(createError(400, 'El usuario y/o contraseña son isncorrectos'));
        }    
        }else{
          next(createError(400, 'El usuario y/o la contraseña son incorrectos '));
        }
    }catch(error){
      next(createError(400, 'El usuario y/o contraseña son incorrectos'));
    }
  }
});

router.post('/logout', async (req, res, next) => {
  const {refreshToken} = req.body;

  if (!refreshToken)
    next(createError(400, 'Falta el Token'));

  try{
      await Token.findOneAndRemove({token: refreshToken});

      res.json(jsonresponse(200, {
         message: 'Logout Succesfully'
        }));
  }catch(error){
    next(createError(400, 'Falta el Token'));
  }
});
//El logout este no funciona como en las sesiones, lo que elimina es la posibilidad de ejecutar el refresh-token cuando el token expire.

router.post('/refresh-token', async (req, res, next) => {
  const {refreshToken} = req.body;

  if (!refreshToken)
    next(createError(400, 'Falta el Token'));

  try{
      const tokenDoc = await Token.findOne({token: refreshToken});

      if (!tokenDoc){
        next(createError(400, 'No token found'));
      }else{
        const payload = jwt.verify(tokenDoc.token, REFRESH_TOKEN_SECRET);
        const accessToken = jwt.sign({user: payload}, ACCESS_TOKEN_SECRET, {expiresIn: '1d'});

        res.json(jsonresponse(200, {
          message: 'access token updated',
      accessToken
    }));
      }
  }catch(error){
    next(createError(400, 'Not token found'));
  } 

});
module.exports = router;