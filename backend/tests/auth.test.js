const request = require('supertest');
const app = require('../server.js');
 // import your express app

describe('Auth Endpoints', () => {

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/signup')
      .send({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toBe(200); //expect success
    expect(res.body.message).toBeDefined(); //expect a success message
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/')
      .send({
        email: 'testuser@example.com',
        loginpassword: 'password123'
      });

    expect(res.statusCode).toBe(200); //login success
    expect(res.body.success).toBe(true); //expect success flag true
    expect(res.body.token).toBeDefined(); //should receive a token
  });

});
