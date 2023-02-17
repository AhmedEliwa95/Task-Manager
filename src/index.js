const User = require('./models/user');
const Task = require('./models/task')
require('./db/mongoose');
const express = require('express');

const app = express();
const userRouter = require('./routers/users')
const taskRouter = require('./routers/tasks')
const port = process.env.PORT ;



app.use(express.json())
app.use(userRouter)
app.use(taskRouter);

app.listen(port,()=>{
    console.log(`server is up on port: ${port}`)
});

