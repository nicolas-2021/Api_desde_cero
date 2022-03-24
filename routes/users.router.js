var express = require('express');
const createError = require('http-errors');
var router = express.Router();
const {jsonresponse} = require('../lib/jsonresponse');

const User= require('../model/users.model');


router.get('/', async function(req, res, next) {
  let results= {};

  try{
    results= await User.find({}, 'username password')
  }catch(ex){

  }
  res.json(results);
});

router.post('/', async function(req, res, next) {
  const {username, password} = req.body;

  if(!username || !password){
    next(createError(400, 'El Usuario y la contraseña son requeridos'));
  }else if(username && password){
    const user = new User({username, password});

    const exists = await user.usernameExists(username);

    if(exists){
      next(createError(400, 'El Usuario ya existe'));
    }else{
      await user.save();

      res.json(jsonresponse(200, {
        message: 'El Usuario fue registrado correctamente'
      }));
    }
  }
});

module.exports = router;
