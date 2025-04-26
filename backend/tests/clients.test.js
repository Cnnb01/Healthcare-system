const request = require('supertest');
const app = require('../server.js');


describe('Clients Endpoints', () => {

  it('should fetch all clients', async () => {
    const res = await request(app).get('/clients');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy(); //should return an array
  });

  it('should create a new client', async () => {
    const res = await request(app)
      .post('/client')
      .send({
        name: 'Test Client',
        phoneno: '0712345678',
        idnum: 'ID-1234'
      });

    expect(res.statusCode).toBe(200);
    //new client should be created
  });

});
