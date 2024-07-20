const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Table = require('../models/Table');
const Queue = require('../models/Queue');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Table.deleteMany({});
  await Queue.deleteMany({});
});

describe('API Tests', () => {
  describe('GET /api/tables', () => {
    it('should return all tables', async () => {
      await Table.create({ id: 1, players: [], status: 'available' });
      const res = await request(app).get('/api/tables');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].id).toBe(1);
    });
  });

  describe('PUT /api/tables/:id', () => {
    it('should update table status', async () => {
      const table = await Table.create({ id: 1, players: [], status: 'available' });
      const res = await request(app)
        .put(`/api/tables/${table.id}`)
        .send({ status: 'occupied', players: ['Player 1', 'Player 2'] });
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('occupied');
      expect(res.body.players).toEqual(['Player 1', 'Player 2']);
    });
  });

  describe('GET /api/queue', () => {
    it('should return the queue', async () => {
      await Queue.create({ name: 'Player 1', position: 1 });
      const res = await request(app).get('/api/queue');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Player 1');
    });
  });

  describe('POST /api/queue', () => {
    it('should add a player to the queue', async () => {
      const res = await request(app)
        .post('/api/queue')
        .send({ name: 'New Player' });
      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe('New Player');
      expect(res.body.position).toBe(1);
    });
  });

  describe('DELETE /api/queue/:id', () => {
    it('should remove a player from the queue', async () => {
      const player = await Queue.create({ name: 'Player 1', position: 1 });
      const res = await request(app).delete(`/api/queue/${player._id}`);
      expect(res.statusCode).toBe(200);
      const queueAfter = await Queue.find();
      expect(queueAfter.length).toBe(0);
    });
  });
});
