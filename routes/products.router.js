var express = require('express');
const createError = require('http-errors');
var router = express.Router();
const {jsonresponse} = require('../lib/jsonresponse');

const Product= require('../model/products.model');

router.get('/', async (req, res, next) => {
    let results ={};

    try{
        results= await Product.find({}, 'titulo precio');
    }catch(ex){
                next(createError(500, 'Error encontrando resultados'));
    }
    res.json(jsonresponse(200, {
        results
    }));
});

router.post('/', async (req, res, next) => {
   const {titulo, precio} = req.body;

   if(!titulo || !precio){
       next(createError(400, 'Error: titulo y precio son requeridos'));
   }else{
       if(titulo && precio){
           try{
                const product = new Product({titulo, precio});
                await product.save();
           }catch(ex){
                    next(createError(500, 'Error: los datos no son validos'));          
           }
           res.json(jsonresponse(200, {
               message: 'El producto fue ingresado satisfactoriamente'
            }));
       }
   }
});

router.get('/:idproduct', async (req, res, next) => {
    let results= {};

    const {idproduct} = req.params;

    if(!idproduct){
        next(createError(400, 'Error: Ingrese el Id'));
    }else{
        try{
            results = await Product.findById(idproduct, 'titulo, precio');
        }catch(ex){
                    next(createError(500, 'Error: El producto no existe'));
        }
        res.json(jsonresponse(200, {
            results
        }));
    }
});

router.patch('/:idproduct', async(req, res, next) => {
    let update = {};

    const {idproduct} = req.params;
    const {titulo, precio} = req.body;

    if(!idproduct){
        next(createError(400, 'Error: No hay Id'));
    }
    if(!titulo && !precio){
        next(createError(400, 'Error: No existe ni titulo ni precio'));
    }   
    if(titulo) {
        update['titulo']= titulo;
    }
    if(precio) {
        update['precio']= precio;
    }
    try{
        await Product.findByIdAndUpdate(idproduct, update);
    }catch(error){
                next(createError(500, 'Error: No es posible actualizar'));
    }
    res.json(jsonresponse(200, {
        message: `El documento ${idproduct} se actualizó satisfactoriamente.`
    }));
});

router.delete('/:idproduct', async(req, res, next) => {
    const {idproduct}= req.params;

    try{
        await Product.findByIdAndDelete(idproduct);
    }catch(ex){
                next(createError(400, `Error: No se pudo eliminar el documento ${idproduct}`));
    }
    res.json(jsonresponse(200, {
        message: `El documento ${idproduct} fue eliminado satisfactoriamente`
    }));
});

module.exports = router;