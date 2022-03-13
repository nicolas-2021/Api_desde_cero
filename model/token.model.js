const Mongoose= require('mongoose');

const TokenSchema= new Mongoose.Schema({
    token: {type: String}
});// crea un Schema de Token

module.exports= Mongoose.model('Token', TokenSchema);