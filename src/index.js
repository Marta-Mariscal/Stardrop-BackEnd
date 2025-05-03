const express = require('express')
const cors = require('cors')
require('./db/mongoose')
const userRouter = require('./routers/user')
const garmentRouter = require('./routers/garment')

const app = express()
const port = process.env.PORT || 3000

app.use(cors());
app.use(express.json())
app.use(userRouter)
app.use(garmentRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})