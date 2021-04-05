const mongoose = require('mongoose')
const tasks = require('./tasks.js')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

//SETTING THE USERS MODEL
const usersSchema = new mongoose.Schema({    
    name:{
        type:String,
        required:true,
        trim:true,
},
email:{
    type:String,
    required:true,
    trim:true,
    unique:true
    ,validate(value){
        if(!validator.isEmail(value))
        throw new Error('Invalid Email')} 
    },
    avatar:{
        type:Buffer
    },
    tokens:[{token:{type:String,
        required:true
        }}],
    password:{
    type:String,
    required:true,
    trim:true,
    minlength:7,
    validate(value){
    if(value.toLowerCase().includes('password')){
        throw new Error('Password cannot contain password')}}
    }
   },
{timestamps:true
})    
 
//SETTING TASKS BINDING
usersSchema.virtual('userTasks',{
    ref:'tasks',
    localField:'_id',
    foreignField:'owner'
})

//Credentials/tokens
usersSchema.methods.toJSON = function(){
const user = this.toObject()
 //   delete user.tokens
 delete user.password
return user
}

usersSchema.methods.generateAuthToken = async function(){
    user = this
    token = jwt.sign({id_:user._id.toString()},process.env.JWT_KEY)
   user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

usersSchema.statics.findByCredentials = async (email,password)=>{
    const user = await Users.findOne({email})
    if(!user){
 throw new Error('Unable to login!')
    }
const isPassword = await bcrypt.compare(password,user.password)
if(!isPassword){
    throw new Error('Unable to login!')
}
return user
}
//hash password before save
usersSchema.pre('save',async function (next) {
    user = this
    if(user.isModified('password')){
     user.password = await bcrypt.hash(user.password,8)
    }
    next()
})
//DELETE TASKS BEFORE USER BEEN DELETED
usersSchema.pre('remove',async function (next){
const user = this
await tasks.deleteMany({owner: user._id})    

next()
})


const Users = mongoose.model('users',usersSchema)


module.exports = Users
