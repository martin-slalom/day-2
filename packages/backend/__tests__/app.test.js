const request = require('supertest');
const { app, db, resetDatabase } = require('../src/app');

beforeEach(() => {
  resetDatabase();
});

// Close the database connection after all tests
afterAll(() => {
  if (db) {
    db.close();
  }
});

// Test helpers
const createItem = async ({
  title = 'Temp Task',
  description = 'Temp description',
  dueDate = null,
} = {}) => {
  const response = await request(app)
    .post('/api/items')
    .send({ title, description, dueDate })
    .set('Accept', 'application/json');

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  return response.body;
};

describe('API Endpoints', () => {
  describe('GET /api/items', () => {
    it('should return all tasks', async () => {
      const response = await request(app).get('/api/items');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const item = response.body[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('title');
      expect(item).toHaveProperty('description');
      expect(item).toHaveProperty('due_date');
      expect(item).toHaveProperty('completed');
      expect(item).toHaveProperty('created_at');
    });

    it('should filter tasks by status', async () => {
      const activeResponse = await request(app).get('/api/items?status=active');
      expect(activeResponse.status).toBe(200);
      expect(activeResponse.body.every((task) => task.completed === false)).toBe(true);

      const completedResponse = await request(app).get('/api/items?status=completed');
      expect(completedResponse.status).toBe(200);
      expect(completedResponse.body.every((task) => task.completed === true)).toBe(true);
    });

    it('should search tasks by title or description', async () => {
      const response = await request(app).get('/api/items?search=API');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toMatch(/API/i);
    });

    it('should reject invalid status filters', async () => {
      const response = await request(app).get('/api/items?status=invalid');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Status must be one of: all, active, completed');
    });
  });

  describe('POST /api/items', () => {
    it('should create a new task', async () => {
      const newItem = {
        title: 'Test Task',
        description: 'Task details',
        dueDate: '2030-01-20',
      };

      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newItem.title);
      expect(response.body.description).toBe(newItem.description);
      expect(response.body.due_date).toBe(newItem.dueDate);
      expect(response.body.completed).toBe(false);
      expect(response.body).toHaveProperty('created_at');
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({})
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Task title is required');
    });

    it('should return 400 if title is empty', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ title: '' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Task title is required');
    });

    it('should return 400 for invalid due date format', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ title: 'Task', dueDate: '01-01-2030' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Due date must use YYYY-MM-DD format');
    });
  });

  describe('PUT /api/items/:id', () => {
    it('should update an existing task', async () => {
      const task = await createItem({ title: 'Original Title' });

      const updateResponse = await request(app)
        .put(`/api/items/${task.id}`)
        .send({
          title: 'Updated Title',
          description: 'Updated description',
          dueDate: '2030-02-01',
          completed: true,
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.title).toBe('Updated Title');
      expect(updateResponse.body.description).toBe('Updated description');
      expect(updateResponse.body.due_date).toBe('2030-02-01');
      expect(updateResponse.body.completed).toBe(true);
    });

    it('should return 404 when updating a missing task', async () => {
      const response = await request(app)
        .put('/api/items/999999')
        .send({ title: 'Missing Task', description: '', dueDate: null, completed: false });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });

    it('should return 400 for non-boolean completed field', async () => {
      const task = await createItem();
      const response = await request(app)
        .put(`/api/items/${task.id}`)
        .send({ title: 'Task', description: '', dueDate: null, completed: 'yes' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Task completed must be a boolean');
    });
  });

  describe('DELETE /api/items/completed', () => {
    it('should clear completed tasks', async () => {
      const response = await request(app).delete('/api/items/completed');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('deletedCount');

      const remaining = await request(app).get('/api/items?status=completed');
      expect(remaining.status).toBe(200);
      expect(remaining.body.length).toBe(0);
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('should delete an existing task', async () => {
      const item = await createItem({ title: 'Task To Be Deleted' });

      const deleteResponse = await request(app).delete(`/api/items/${item.id}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toEqual({ message: 'Task deleted successfully', id: item.id });

      const deleteAgain = await request(app).delete(`/api/items/${item.id}`);
      expect(deleteAgain.status).toBe(404);
      expect(deleteAgain.body).toHaveProperty('error', 'Task not found');
    });

    it('should return 404 when task does not exist', async () => {
      const response = await request(app).delete('/api/items/999999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Task not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).delete('/api/items/abc');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Valid task ID is required');
    });
  });
});