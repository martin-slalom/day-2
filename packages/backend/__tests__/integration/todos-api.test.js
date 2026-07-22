const request = require('supertest');
const { app, db, resetDatabase } = require('../../src/app');

describe('Integration: TODO API workflow', () => {
  beforeEach(() => {
    resetDatabase();
  });

  afterAll(() => {
    if (db) {
      db.close();
    }
  });

  it('creates, updates, filters, and clears completed tasks', async () => {
    const createResponse = await request(app)
      .post('/api/items')
      .send({
        title: 'Plan sprint review',
        description: 'Prepare notes and demo list',
        dueDate: '2030-03-01',
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.title).toBe('Plan sprint review');
    expect(createResponse.body.completed).toBe(false);

    const createdTaskId = createResponse.body.id;

    const updateResponse = await request(app)
      .put(`/api/items/${createdTaskId}`)
      .send({
        title: 'Plan sprint review',
        description: 'Prepare notes and demo list',
        dueDate: '2030-03-01',
        completed: true,
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.completed).toBe(true);

    const completedResponse = await request(app).get('/api/items?status=completed');
    expect(completedResponse.status).toBe(200);
    expect(completedResponse.body.some((task) => task.id === createdTaskId)).toBe(true);

    const clearResponse = await request(app).delete('/api/items/completed');
    expect(clearResponse.status).toBe(200);
    expect(clearResponse.body).toHaveProperty('deletedCount');

    const completedAfterClear = await request(app).get('/api/items?status=completed');
    expect(completedAfterClear.status).toBe(200);
    expect(completedAfterClear.body.length).toBe(0);
  });
});
