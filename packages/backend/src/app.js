const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize in-memory SQLite database
const db = new Database(':memory:');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    due_date TEXT,
    completed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

const insertStmt = db.prepare(`
  INSERT INTO items (title, description, due_date, completed)
  VALUES (@title, @description, @due_date, @completed)
`);

const selectByIdStmt = db.prepare('SELECT * FROM items WHERE id = ?');
const deleteByIdStmt = db.prepare('DELETE FROM items WHERE id = ?');
const deleteCompletedStmt = db.prepare('DELETE FROM items WHERE completed = 1');
const updateStmt = db.prepare(`
  UPDATE items
  SET title = @title,
      description = @description,
      due_date = @due_date,
      completed = @completed,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = @id
`);

const initialItems = [
  {
    title: 'Set up project board',
    description: 'Add initial TODO project tasks',
    due_date: null,
    completed: 0,
  },
  {
    title: 'Write API tests',
    description: 'Cover create, update, delete, and filter workflows',
    due_date: '2030-01-15',
    completed: 0,
  },
  {
    title: 'Create first UI pass',
    description: 'Implement task list and edit flow',
    due_date: '2030-01-10',
    completed: 1,
  },
];

const normalizeItem = (item) => ({
  ...item,
  completed: item.completed === 1,
});

const isValidDateInput = (value) => {
  if (value === null || value === undefined || value === '') {
    return true;
  }

  if (typeof value !== 'string') {
    return false;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(value);
};

const parseCompleted = (value) => {
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  if (value === 0 || value === 1) {
    return value;
  }

  return null;
};

const seedInitialData = () => {
  initialItems.forEach((item) => {
    insertStmt.run(item);
  });
};

const resetDatabase = () => {
  db.exec('DELETE FROM items');
  db.exec("DELETE FROM sqlite_sequence WHERE name='items'");
  seedInitialData();
};

resetDatabase();

console.log('In-memory database initialized with sample TODO tasks');

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

// API Routes
app.get('/api/items', (req, res) => {
  try {
    const { status = 'all', search = '' } = req.query;

    if (!['all', 'active', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Status must be one of: all, active, completed' });
    }

    const conditions = [];
    const params = {};

    if (status === 'active') {
      conditions.push('completed = 0');
    }

    if (status === 'completed') {
      conditions.push('completed = 1');
    }

    if (typeof search === 'string' && search.trim() !== '') {
      conditions.push('(title LIKE @search OR description LIKE @search)');
      params.search = `%${search.trim()}%`;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `
      SELECT * FROM items
      ${whereClause}
      ORDER BY
        CASE WHEN due_date IS NULL THEN 1 ELSE 0 END ASC,
        due_date ASC,
        created_at ASC
    `;

    const items = db.prepare(query).all(params).map(normalizeItem);
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.post('/api/items', (req, res) => {
  try {
    const { title, description = '', dueDate = null } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Task title is required' });
    }

    if (typeof description !== 'string') {
      return res.status(400).json({ error: 'Task description must be a string' });
    }

    if (!isValidDateInput(dueDate)) {
      return res.status(400).json({ error: 'Due date must use YYYY-MM-DD format' });
    }

    const result = insertStmt.run({
      title: title.trim(),
      description: description.trim(),
      due_date: dueDate || null,
      completed: 0,
    });

    const id = result.lastInsertRowid;

    const newItem = selectByIdStmt.get(id);
    res.status(201).json(normalizeItem(newItem));
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/api/items/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, description = '', dueDate = null, completed } = req.body;

    const parsedId = Number.parseInt(id, 10);

    if (!Number.isInteger(parsedId)) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    const existingItem = selectByIdStmt.get(parsedId);
    if (!existingItem) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Task title is required' });
    }

    if (typeof description !== 'string') {
      return res.status(400).json({ error: 'Task description must be a string' });
    }

    if (!isValidDateInput(dueDate)) {
      return res.status(400).json({ error: 'Due date must use YYYY-MM-DD format' });
    }

    const parsedCompleted = parseCompleted(completed);
    if (parsedCompleted === null) {
      return res.status(400).json({ error: 'Task completed must be a boolean' });
    }

    updateStmt.run({
      id: parsedId,
      title: title.trim(),
      description: description.trim(),
      due_date: dueDate || null,
      completed: parsedCompleted,
    });

    const updatedItem = selectByIdStmt.get(parsedId);
    res.json(normalizeItem(updatedItem));
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/items/completed', (req, res) => {
  try {
    const result = deleteCompletedStmt.run();
    res.json({ message: 'Completed tasks cleared', deletedCount: result.changes });
  } catch (error) {
    console.error('Error clearing completed tasks:', error);
    res.status(500).json({ error: 'Failed to clear completed tasks' });
  }
});

app.delete('/api/items/:id', (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = Number.parseInt(id, 10);

    if (!Number.isInteger(parsedId)) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    const existingItem = selectByIdStmt.get(parsedId);
    if (!existingItem) {
      return res.status(404).json({ error: 'Task not found' });
    }

    deleteByIdStmt.run(parsedId);
    res.json({ message: 'Task deleted successfully', id: parsedId });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = { app, db, resetDatabase };