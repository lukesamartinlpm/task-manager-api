require('./db/mongoose')
const express = require('express')
const routerTasks = require('./routers/tasks.js')
const routerUsers = require('./routers/users.js')
const app = express()

app.use(express.json())
app.use(routerTasks)
app.use(routerUsers)

module.exports = app