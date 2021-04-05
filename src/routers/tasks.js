const express = require('express')
const router = new express.Router()
const objectId= require('mongodb').ObjectID
const tasks = require('../models/tasks')
const authToken = require('../middleware/authToken.js')

//GET TASKS QUERY

//GET tasks/limit=number
//GET tasks/skip=number
//GET tasks/completed=boolean                                                                                                                                                                                                                                                                                                                                                                                                                 
//GET tasks/?sortBy=createdAt:desc
router.get('/tasks/',authToken,async (req,res)=>{
   const match = {}
   const sort = {}
   if(req.query.completed){
       match.completed =  req.query.completed === 'true'}
   if(req.query.sortBy){
      parts = req.query.sortBy.split(':')
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1   }
       try{
   const user = await req.user.populate(
   {path:'userTasks',
     match,
     options:{limit:parseInt(req.query.limit),
         skip:parseInt(req.query.skip),
          sort}
}).execPopulate()
   res.send(user.userTasks)
   }catch(e){
         res.status(500).send(e)
    }
       })
   
       //GET BY ID TASKS 
   router.get('/tasks/:id',authToken,async (req,res)=>{
     const _id = req.params.id
    if(!objectId.isValid(_id)){
       return res.status(404).send()
    }
    try{
    const task = await tasks.findOne({_id,owner:req.user._id})
           res.send(task)}
           catch{ res.status(500).send()
           }
       })
   
       //UPDATE TASKS
   router.patch('/tasks/:id',authToken, async(req,res)=>{
         const reqBody = req.body
         const reqId = req.params.id
       const updates = Object.keys(reqBody)
       const validationArray = ['completed','description']
      const isValidKeys = updates.every((update)=> validationArray.includes(update))
      if(!isValidKeys){
   return res.status(400).send("invalid update")
      }
     try{const task = await tasks.findOne({_id:reqId,owner:req.user._id})
      if(!task){
        return res.status(404).send()}
      for(task1 of updates){ 
                  task[task1] = reqBody[task1]    
               }
                 const task3 = new tasks(task)
                await task3.save()
                res.send(task3)
               
     }catch(e){res.status(400).send(`catch ${e}`)}
   })
   
   //NEW TASK
   router.post('/tasks',authToken, async(req,res)=>{
     try{
      const task = new tasks({...req.body,owner:req.user._id})
      await task.save()
     res.status(201).send(task)
   }catch(e){
        res.status(500).send()
     }  
   })

   //DELETE TASK
router.delete('/tasks/:id',authToken,async (req,res)=>{
       try{
         const task = await tasks.findOneAndDelete({_id:req.params.id,owner:req.user._id})
         if(!task){
           return res.status(404).send()
         }
            res.send(task)
         }catch(e){
              res.status(400).send(e)
   }
      })
   module.exports = router
