const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const user1Id = new mongoose.Types.ObjectId();
const user1 = {
    _id:user1Id,
    name:'Ahmed',
    email:'ahmed@example.com',
    password:'56what!!',
    tokens:[{
        token:jwt.sign({_id:user1Id } , process.env.JWT_SECRET)
    }]
};

const user2Id = new mongoose.Types.ObjectId();
const user2 = {
    _id:user2Id,
    name:'Eliwa',
    email:'Eliwa@example.com',
    password:'User2@777',
    tokens:[{
        token:jwt.sign({_id:user2Id } , process.env.JWT_SECRET)
    }]
};


const taskOne = {
    _id:mongoose.Types.ObjectId(),
    description:'First Test Task',
    owner:user1Id,
};

const taskTwo = {
    _id:mongoose.Types.ObjectId(),
    description:'Second Test Task',
    owner:user1Id,
    completed:true
};

const taskThree = {
    _id:mongoose.Types.ObjectId(),
    description:'Third Test Task',
    owner:user2Id,
    completed:true
};

const setupDatabase = async()=>{
    await User.deleteMany()
    await Task.deleteMany()

    await new User(user1).save()
    await new User(user2).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
};

module.exports = {
    setupDatabase,
    user1Id,
    user1,
    user2,
    taskOne,
    taskTwo,
    taskThree
}
