const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user')
const {user1,user1Id,setupDatabase} = require('./fixtures/db')


beforeEach(setupDatabase);


test('Should SignUp a New User' , async ()=>{

   const response = await request(app).post('/users').send({
        name:"Ahmed",
        email:'ahmed.eliwa@example.com',
        password:'MyPass777'
     }).expect(201) 
     // Assert that database was changing correctly
     const user = User.findById(response.body.user._id);
     expect(user).not.toBeNull()
     expect(response.body).toMatchObject({
       user:{
           name:'ahmed'
       }
     });
     expect(user.password).not.toBe('MyPass777')
});

test('should log in existing user',async ()=>{
    const response = await  request(app).post('/users/login').send({
        email:user1.email,
        password:user1.password
    }).expect(200)  ;

    const user =await User.findById(user1Id);
    expect(response.body.token).toBe(user.tokens[1].token)
});

test('should not login non existing user', async()=>{
    await request(app)
        .post('/users/login')
        .send({password:user1.password,email:'ahemd'})
        .expect(400)
})

test('Should Get Profile for User' , async()=>{
    await request(app)
        .get('/users/me') 
        .set('Authorization' , `Bearer ${user1.tokens[0].token}`)
        .send()
        .expect(200)
});

test('Should not get profile' , async ()=>{
    await request(app)
        .get('/users/me')
        .set('Authorization' , `Bearer eeeeeds123`)
        .send()
        .expect(401)
});

test('Should Delete Account for User' , async()=>{
    const response = await request(app)
        .delete('/users/me')
        .set('Authorization' , `Bearer ${user1.tokens[0].token}`)
        .send()
        .expect(200)
    const user = await User.findById(user1Id);
    expect(user).toBeNull()
})

test('Should not Delete Account for unAuthunticated User' , async()=>{
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
});

test('Should Upload Avatar Image',async()=>{
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization' , `Bearer ${user1.tokens[0].token}`)
        .attach('avatar','tests/fixtures/profile-pic.jpg')
        .expect(200)
    const user = await User.findById(user1Id);
    expect(user.avatar).toEqual(expect.any(Buffer))
});

test('Should Update the Name',async()=>{
    await request(app)
        .patch('/users/me')
        .set('Authorization' , `Bearer ${user1.tokens[0].token}`)
        .send({name:'Eliwa'})
        .expect(200)
    const user = await User.findById(user1Id)
    expect(user.name).toEqual('eliwa')
});

test('Should not Update Invalid User Fields',async()=>{
    await request(app)
        .patch('/users/me')
        .set('Authorization' , `Bearer ${user1.tokens[0].token}`)
        .send({location:'Any Location'})
        .expect(400)
})

