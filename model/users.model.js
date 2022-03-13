require('dotenv').config();

const Mongoose= require('mongoose');
const bcrypt= require('bcrypt');
const jwt= require('jsonwebtoken');
const {ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET}= process.env;

const Token= require('./token.model');

const UserSchema= new Mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, requires: true},
    name: {type: String}
}); //creacion de un Schema de usuario

UserSchema.pre('save', function(next){
    if(this.isModified('password') || this.isNew){
        const document= this;

        bcrypt.hash(document.password, 10, function(err,hash){
            if(err){
                next(err);
            }else{
                document.password= hash;
                next();
            }
        });
    }else{
        next();
    }
}); // crear un hash , encriptado

UserSchema.methods.usernameExists= async function(username){  
    try{       
        let result= await Mongoose.model('User').find({username:username}); 

        return result.length > 0;
    }catch(ex){
        return false;
    }
}; // Busca en la BD si existe un documento que tenga el argumento pasado como valor de clave username:, si existe, devuelve true. (Validacion de nombre de usuario)

UserSchema.methods.isCorrectPassword = async function(password, hash){
    try{
        const same= await bcrypt.compare(password, hash);

        return same;
    }catch(ex){
        return false;
    }    
}; // Compara el password con el encriptado correcto, si es asi , devuelve true (Validar Password)

UserSchema.methods.createAccessToken= function(){
    const {id, username}= this;     //datos del objeto a encriptar

    const accessToken= jwt.sign(
        {user: {id, username}},     //Nuevo objeto con el id y los datos que quiera encriptar
        ACCESS_TOKEN_SECRET,        //variable de entorno a guardar
        {expiresIn: '1d'}           //tiempo de expiracion
    );

    return accessToken;
};//Crea un Token

UserSchema.methods.createRefreshToken= async function(){
    const {id, username}= this;

    const refreshToken= jwt.sign(
        {user: {id, username}},
        REFRESH_TOKEN_SECRET,
        {expiresIn: '20d'}
    );

    try{
        await new Token({token: refreshToken}).save();

        return refreshToken;
    }catch(ex){
        next(new Error('Error creando el refresh token'));
    }
};

module.exports= Mongoose.model('User', UserSchema);
