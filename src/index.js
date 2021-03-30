const express = require('express')
const app = express()
const port = process.env.PORT 
require('./db/mongoose')
const routerTasks = require('./routers/tasks.js')
const routerUsers = require('./routers/users.js')

app.use(express.json())
app.use(routerTasks)
app.use(routerUsers)
app.listen(port,()=>{
    console.log(`server is running ${port}`)
})