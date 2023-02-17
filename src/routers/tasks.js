const express = require('express');
const router = new express.Router();
const Task = require('../models/task');
const auth = require('../middleware/auth');
const { findOne, populate } = require('../models/user');

router.post('/tasks',auth,async(req,res)=>{
    const task = new Task({
        ...req.body,
        owner:req.user._id
    });
    try{
        await task.save();
        res.status(201).send(task);
    }catch(e){
        res.status(400).send(e);
    }
})
/// Get /tasks?completed=true
/// Get /tasks?limit=10&skip=10
/// Get /tasks?sortBy=createdAt:desc
router.get('/tasks',auth,async(req,res)=>{
    try{
        const match = {};
        const sort = {};
        if(req.query.sortBy){
            const parts = req.query.sortBy.split(':');
            sort.parts[0] = parts[1] === 'desc'? -1 : 1
        };

        if(req.query.completed){
            match.completed = req.query.completed === 'true'
        }
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit ),
                skip: parseInt(req.query.skip )  ,
                sort:{
                    createdAt:1
                }              
            }
        })
        res.status(200).send(req.user.tasks)
    }catch(e){
        res.status(500).send(e.message)
    }
    

})
router.get('/tasks/:id',auth,async(req,res)=>{
    const _id = req.params.id;
    try{
        const task = await Task.findOne({_id , owner : req.user._id})

        if(!task){
            return res.status(404).send();
        }
        res.status(201).send(task);
    }catch(e){
        res.status(500).send(e.message)
    };
});

router.patch('/tasks/:id',auth,async (req,res)=>{
    const updates = Object.keys(req.body);
    const allowed = ['description' , 'completed'];
    const isValidOperation = updates.every(update=>allowed.includes(update));
    if(!isValidOperation) return res.status(400).send({error:'Invalid Update'})
    try{
        const task = await Task.findOne({_id:req.params.id , owner : req.user._id})
        
        if(!task){
           return res.status(404).send()
        }

        updates.forEach(update=>task[update]=req.body[update]);
        await task.save();

        res.status(200).send(task);
    }catch(e){
        res.status(400).send(e.message)
    }
});
router.delete('/tasks/:id',auth,async(req,res)=>{
    try{
        // const user =await Task.findByIdAndDelete(req.params.id);
        const task = await Task.findOneAndDelete({_id:req.params.id , owner: req.user._id})
        if(!task) return res.status(404).send();
        res.send(task);
    }catch(e){
        res.status(500).send();
    }
});
module.exports = router