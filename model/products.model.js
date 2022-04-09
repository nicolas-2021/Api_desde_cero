const Mongoose = require('mongoose');

const ProductSchema =new Mongoose.Schema({
    titulo: {type: String, required: true},
    precio:{type: Number, required: true}
});

module.exports = Mongoose.model('Product', ProductSchema);