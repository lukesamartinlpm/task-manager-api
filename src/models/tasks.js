const mongoose = require('mongoose')

//SETTING THE TASK MODEL
const tasksSchema = new mongoose.Schema({description:{
    
    type:String,
    required:true,
    trim:true
},
completed:{
    type:Boolean,
    default:false
},
owner:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'users',
    required:true
}
},
{timestamps:true
})

const tasks = mongoose.model('tasks',tasksSchema)

module.exports = tasks