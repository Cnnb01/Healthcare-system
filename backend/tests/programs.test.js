const request = require('supertest');
const app = require('../server.js');

describe('Programs Endpoints', () => {

  it('should fetch all programs', async () => {
    const res = await request(app).get('/programs');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy(); //should return an array
  });

  it('should create a new program', async () => {
    const res = await request(app)
      .post('/program')
      .send({
        newprogram: 'Hypertension Awareness'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Program added successfully');
  });

});
