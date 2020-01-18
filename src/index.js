const express = require('express')
require('./db/mongoose')

const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
// process.env pra pd s heroku
const port = process.env.PORT

// middleware to enable authentication
// app.use((req, res, next) => {
//   if(req.method === 'GET') {
//     res.send('Get req are disabled')
//   } else {
//     next()
//   }
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
  console.log(`Server is up on port ${port}`)
})

