const jwt = require('jsonwebtoken')
const Users = require('../models/users')
 
//TOKEN  AUTENTICATION
const authToken = async (req,res,next)=>{
    try{ 
    const token = req.header('Authorization').replace('Bearer','').replace(' ','')
   const decoded = jwt.verify(token,process.env.JWT_KEY)
    const user = await Users.findOne({id_:decoded._id,'tokens.token':token})
    
    if(!user){
        throw new Error()
    }
    req.user = user
    req.token = token
    next()
   }catch(e){
       res.status(401).send(e)
    }
     
    }

    module.exports = authToken
