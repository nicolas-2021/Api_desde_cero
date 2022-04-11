var express = require('express');
const createError = require('http-errors');
var router = express.Router();
const {jsonresponse} = require('../lib/jsonresponse');

const Order= require('../model/orders.model');

const auth = require('../auth/auth.middleware');

router.get('/', auth.checkAuth, async (req, res, next) => {
    let results= {};
try{
    results = await Order.find({}, 'iduser products total date');
}catch(ex){
    next(createError(500, 'Error: No se han encontrado Ordenes'));
}
res.json(jsonresponse(200, {
    results
}));
});

router.post('/', async (req, res, next) => {
    const {iduser, products} = req.body;

    if(!iduser || !products){
        next(createError(400,'Debe ingresar id del usuario y los productos'));
    }else {
        if(iduser && products && products.length >0){
    try{
        const order = new Order ({iduser, products});
        await order.save(); 
        res.json(jsonresponse(200, {
            message: 'Orden creada satisfactoriamente'
           }));
    }catch(error){
        next(createError(500, error));
    }
  }
}
});

router.delete('/:idorder', async(req, res, next) => {
    const {idorder}= req.params;

    try{
        await Order.findByIdAndDelete(idorder);
    }catch(ex){
                next(createError(400, `Error: No se pudo eliminar el documento ${idorder}`));
    }
    res.json(jsonresponse(200, {
        message: `El documento ${idorder} fue eliminado satisfactoriamente`
    }));
});
module.exports = router;