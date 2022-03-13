var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');

require('dotenv').config(); // Agregamos el requerimiento del modulo dotenv

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users.router');
/*var productsRouter = require('.routes/products.router');
var ordersRouter = require('./routes/orders.router');
var authRouter = require('.routes/auth.router'); */
//Agregamos las rutas que tenemos que crear en /routes

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*
CONEXION A BASE DE DATOS, antes de que inicien las rutas
*/

//mongoose.connect(process.env.CONNECTION_STRING, {useNewUrlParser: true, useUnifiedTopology: true});

const connection = mongoose.connection;

connection.on('error', () => {
  console.log('Error connection to database');
});

connection.once('open', () => {
  console.log('Connected to database');
});


app.use('/', indexRouter);
// app.use('/auth', authRouter);             
app.use('/api/users', usersRouter);       
/*app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter); */
//Asignamos las rutas que usara la app

// catch 404 and forward to error handler, esto sucede si intentamos acceder a rutas que no existen en las app.use
app.use(function(req, res, next) {
  next(createError(404, 'The end point does not exist'));  //Le agregamos un mensaje al error 404 entre comillas
});

// error handler , esto le sigue al error 404
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page , Agregamos un error en formato json
  res.status(err.status || 500);
  res.json({
    errorcode: err.status || 500,
    message: res.locals.message
  });
});

module.exports = app;
