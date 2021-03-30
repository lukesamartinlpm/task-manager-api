const express = require('express')
const router = new express.Router()
const objectId= require('mongodb').ObjectID
const Users = require('../models/users.js')
const authToken = require('../middleware/authToken.js')
const multer = require('multer')
const path = require('path')
const sharp = require('sharp')
const {sendWelcomeEmail ,sendLeavingEmail} = require("../emails/email.js")
//uploadFiles
const uploadFolder = path.join(__dirname,'../models/avatar')

const avatar = multer({
   limits:{
   fileSize:1000000
},
fileFilter(req,file,cb){
if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
return cb(new Error('Please upload a image'))
}
cb(undefined,true)
}
})

router.post('/users/me/avatar',authToken,avatar.single('avatar'),async (req,res)=>{
   const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
   req.user.avatar = buffer
   await req.user.save()
   res.send()  
},(error,req,res,next)=>{
   res.status(400).send({Error:error.message})
})

//deleteUploads

router.delete('/users/me/avatar',authToken,async (req,res)=>{
 req.user.avatar = undefined
console.log(req.user)
await req.user.save()
 res.send()
})

//getUploads

router.get('/users/:id/avatar',async (req,res)=>{
try{
   const user = await Users.findById(req.params.id)
if(!user || !user.avatar){
   throw new Error
}
res.set('Content-Type','image/png')
res.send(user.avatar)
}catch(e){res.status(404).send()
   
}
})

//authToken
router.get('/users/me',authToken,(req,res)=>{
   res.send(req.user)
})

//logout
router.post('/users/logout',authToken,async (req,res)=>{
   try{
      req.user.tokens = req.user.tokens.filter((tok)=> req.token !== tok) 
      req.user.save()
      res.send()
 }catch(e){res.status(500).send(e) 
     }
})
   
//logout from all devices
router.post('/users/logoutall',authToken,async (req,res)=>{
try{ req.users.token = []
  await req.user.save()
res.send()
}catch(e){
res.status(500).send(e)
console.log(e)
}
})

//get by Id
router.get('/users/:id',authToken,async (req,res)=>{
    try{
       const id = req.params.id
    if(!objectId.isValid(id)){
       return res.status(404).send()
    }
    res.send(req.user)}
           catch(e){ res.status(500).send(e)
           }
       })
   
       //update
   router.patch('/users/me',authToken,async(req,res)=>{
         const reqBody = req.body
         const toUpdates = Object.keys(reqBody)
       const validationArray = ['name','email','password',]
      const isValidKeys = toUpdates.every((update)=> validationArray.includes(update))
      if(!isValidKeys){
   return res.status(400).send("invalid update")
      }
      try{
         for(user of toUpdates){ 
                   req.user[user] = reqBody[user]
               }
               await req.user.save()
                res.send(req.user)
            }catch(e){res.status(400).send(`catch ${e}`)}
   })
    
   //new user
   router.post('/users/',async (req,res)=>{
       const user = new Users(req.body)
        try{ 
          await user.save()
             const token = await user.generateAuthToken()
              res.send({user,token})
              sendWelcomeEmail(user.name,user.email)
}catch(e){console.log(e)
           res.status(400).send(e)
       }
   })
   
   //login
router.post('/users/login',async (req,res)=>{
    try{ 
     const user = await Users.findByCredentials(req.body.email,req.body.password)
     const token = await user.generateAuthToken()
       if(!user){res.status(404).send()
   }
     
   res.send({user,token})
   }catch(e){
       res.status(404).send(e)
       console.log(e)
        }
    })

    //delete
   router.delete('/users/me',authToken,async (req,res)=>{
       try{
       await req.user.remove()
         res.send(req.user)
         sendLeavingEmail(req.user.name,req.user.email)
         }catch(e){
              res.status(400).send(e)
   }
      })
   module.exports = router
