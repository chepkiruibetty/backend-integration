const request = require('supertest');
const app = require('./app'); // Ensure this points to your Express app

describe('GET /transactions', () => {
  it('should return all transactions', async () => {
    const response = await request(app).get('/transactions');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});
