const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const  jwt = require('jsonwebtoken');
const Task = require('./task');
const { Timestamp } = require('mongodb');
// mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api',{useNewUrlParser})
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        lowercase:true
    },email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        unique:true,
        validate(val){
            if(!validator.isEmail(val)){
                throw new Error('not valid mail')
            }
        }
    },password:{
        type:String,
        required:true,
        trim:true,
        minlength:6,
        validate(val){
            if(val.includes('password')){
                throw new Error('not should contain password')
            }
        }
    },age:{
        type:Number,
        default:0,
        min:0
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type: Buffer
    }
    
},{timestamps:true});
/// virtual releation between tasks and users 
userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})
/// show only essentials and hide the details::> public Profile
userSchema.methods.toJSON =  function(){
    const user = this
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject
}
///  generate Authentication JSON Web Token for Loging and registering
userSchema.methods.generateAuthToken = async function(){ 
    const user = this;
    const token = jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET);

    user.tokens = user.tokens.concat({token});
    await user.save();

    return token;
};
///// find a user by email and password for login...
userSchema.statics.findByCredentials = async (email,password)=>{
    const user = await User.findOne({email});
    if(!user){
        throw new Error('Enable to Login')
    };
    const isMatch = await bcrypt.compare( password , user.password);
    if(!isMatch){
        throw new Error('Enable to Login');
    };

    return user;
}
/// Hashing the password for registering.........
userSchema.pre('save',async function(next){
    const user = this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }
    next()
});

//// to Delete all tasks that related to the user before removig the user;
userSchema.pre('remove',async function(next){
    const user = this;
    await Task.deleteMany({owner:user._id});
    next();
})
const User =  mongoose.model('User',userSchema);



module.exports = User