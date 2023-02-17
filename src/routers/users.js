const express= require('express');
const router = new express.Router()
const User = require('../models/user') 
const auth = require('../middleware/auth');
const { findById } = require('../models/user');
const multer = require('multer');
const sharp = require('sharp');
const {sendWelcomingMail , cancelingEmail} = require('../emails/account')
router.post('/users',async(req,res)=>{
    const user = new User(req.body);
    try{
        const token =await user.generateAuthToken()
        sendWelcomingMail(user.email,user.name);
        await user.save();
        res.status(201).send({user , token})
    }catch(e){
        res.status(400).send(e)
    }
});

router.post('/users/login', async (req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password);
        const token = await user.generateAuthToken()
        res.status(200).send({user,token});
    }catch(e){
         res.status(400).send();
    }
});
//// LogOut from one User \\\\ 
router.post('/users/logout',auth,async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter(token=>{
            return token.token !== req.token
        });
        await req.user.save();
        res.status(200).send({"M":"you have logged Out"});

    }catch(e){
        res.status(500).send(e)
    }
});
//// LoOut ALL Users \\\\
router.post('/users/logoutAll',auth,async(req,res)=>{
    try{
        req.user.tokens = [];
        await req.user.save();
        res.send();
    }catch(e){
        res.status(500).send(e)
    }

})

// to get profile for the user who logged in
router.get('/users/me',auth,async (req,res)=>{

    res.send(req.user)
});



router.patch('/users/me',auth,async(req,res)=>{
    const updates = Object.keys(req.body);
    const allowed = ['name' , 'email' , 'password' , 'age'];
    const isValidOperation = updates.every(update=>allowed.includes(update))
    if(!isValidOperation)return res.status(400).send({error:'Invalid Update'})
    
    try{
        // const user = await User.findById(req.user._id);
        // const user = await req.user
        updates.forEach(update=>req.user[update] = req.body[update]);
        await req.user.save();
        // const user = await User.findByIdAndUpdate(_id,req.body,{new:true , runValidators:true});

        res.send(req.user)
    }catch(e){
        res.status(400).send(e.message);
    }
});
/// now we get the id from the req.user from auth middleware
router.delete('/users/me',auth,async(req,res)=>{
    try{
        // const user =await User.findByIdAndDelete(req.user._id)
        // if(!user)return res.status(404).send();
        cancelingEmail(req.user.email)
        await req.user.remove();
        res.send(req.user)
    }catch(e){
        res.status(500).send();
    }
})

const upload = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please only upload Photos'))
        }
        cb(undefined,true)
    }
    });
router.post('/users/me/avatar' , auth , upload.single('avatar') , async(req,res)=>{
    // req.user.avatar = req.file.buffer;
    const buffer = await sharp(req.file.buffer).resize({width:250 , height:250}).png().toBuffer();
    req.user.avatar = buffer
    await req.user.save()
    res.send();
},(err,req,res,next)=>{
    res.status(400).send({error: err.message})
});
router.delete('/users/me/avatar',auth , async(req,res)=>{
    req.user.avatar = undefined;
    await req.user.save();
    res.send()
});
router.get('/users/:id/avatar',async(req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
           throw new Error()
        }
        res.set('Content-Type','image/png');
        res.send(user.avatar);
    }catch(e){
        res.status(400).send(e)

    }
});
module.exports = router