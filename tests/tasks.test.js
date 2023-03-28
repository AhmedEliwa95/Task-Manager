const request = require('supertest');
const Task = require('../src/models/task');
const app = require('../src/app');
const { user1, taskOne, taskOneId, setupDatabase, user2 } = require('../tests/fixtures/db')


beforeEach(setupDatabase)


// beforeEach(async ()=>{
//     await User.deleteMany()
//     await Task.deleteMany()

//     await new User(user1).save()
//     await new Task(taskOne).save()
// });

test('Should Post new Task' , async()=>{
    const response = await request(app)
        .post('/tasks')
        .set('Authorization' , `Bearer ${user1.tokens[0].token}`)
        .send({
            description:'From My Test'
        })
        .expect(201)
    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull()
    expect(task.completed).toBe(false)
})

test('Should Get All Tasks From User 1', async()=>{
    const response = await request(app)
        .get('/tasks')
        .set('Authorization' , `Bearer ${user1.tokens[0].token}`)
        .expect(200)
    const tasks = response.body
    expect(tasks.length).toBe(2)
});

test('Should Fail When some user tryig to delete other user tasks' ,async()=>{
    await request(app)
        .delete(`tasks/:${taskOne._id}`)
        .set('Authorization' , `Bearer ${user2.tokens[0].token}`)
        .expect(404)
        
})