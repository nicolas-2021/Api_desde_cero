const Mongoose = require('mongoose');

const User = require('../model/users.model');

const Product = require('../model/products.model');

const OrderSchema =new Mongoose.Schema({
    iduser: {type: String, required: true},
    products:[{idproduct: String, titulo: String, precio: Number, quantity: Number}],
    total: {type: Number, default: 0},
    date:{type: Date, default: Date.now}
});
 OrderSchema.pre('save', async function(next){
     if(this.isModified('products') || this.isNew){
    const document = this;
    const iduser = document.iduser;
    const products = document.products;

    document.total = 0;

    let user;
    let promises = [];

    try {
        user = await User.findById(iduser);
    }catch(error){
       next( new Error('Ese usuario no existe'));
    }

    try{
        if(products.length === 0){
            next(new Error('No hay productos en su Orden'));
        }else{
            for(const product of products){
                promises.push(await Product.findById(product.idproduct));
            }

            const resultPromises = await Promise.all(promises);

            resultPromises.forEach( (product, index) => {
                document.total += product.precio * document.products[index].quantity;
                document.products[index].titulo = product.titulo;
                document.products[index].precio = product.precio;
            });
        }next();
    }catch(error){
        next(new Error('Error: Ingrese  la informacion de los Productos correcta'));
    }



     }else {
         next();
     }
});

module.exports = Mongoose.model('Order', OrderSchema);