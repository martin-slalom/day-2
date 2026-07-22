import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

const defaultTasks = [
  {
    id: 1,
    title: 'Test Task 1',
    description: 'Active task',
    due_date: '2030-01-01',
    completed: false,
    created_at: '2023-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    title: 'Test Task 2',
    description: 'Completed task',
    due_date: '2030-01-02',
    completed: true,
    created_at: '2023-01-02T00:00:00.000Z',
  },
];

let mockTasks = [];

// Mock server to intercept API requests
const server = setupServer(
  // GET /api/items handler
  rest.get('/api/items', (req, res, ctx) => {
    const status = req.url.searchParams.get('status') || 'all';
    const search = req.url.searchParams.get('search') || '';

    const filtered =
      status === 'active'
        ? mockTasks.filter((task) => !task.completed)
        : status === 'completed'
          ? mockTasks.filter((task) => task.completed)
          : mockTasks;

    const searched = search.trim()
      ? filtered.filter(
          (task) =>
            task.title.toLowerCase().includes(search.toLowerCase()) ||
            task.description.toLowerCase().includes(search.toLowerCase())
        )
      : filtered;

    return res(
      ctx.status(200),
      ctx.json(searched)
    );
  }),

  // POST /api/items handler
  rest.post('/api/items', (req, res, ctx) => {
    const { title, description, dueDate } = req.body;

    if (!title || title.trim() === '') {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Task title is required' })
      );
    }

    const createdTask = {
      id: Math.max(...mockTasks.map((task) => task.id), 0) + 1,
      title,
      description: description || '',
      due_date: dueDate || null,
      completed: false,
      created_at: new Date().toISOString(),
    };

    mockTasks = [createdTask, ...mockTasks];

    return res(
      ctx.status(201),
      ctx.json(createdTask)
    );
  }),

  rest.delete('/api/items/:id', (req, res, ctx) => {
    const id = Number(req.params.id);
    mockTasks = mockTasks.filter((task) => task.id !== id);
    return res(ctx.status(200), ctx.json({ message: 'Task deleted successfully' }));
  }),

  rest.delete('/api/items/completed', (req, res, ctx) => {
    const previousLength = mockTasks.length;
    mockTasks = mockTasks.filter((task) => !task.completed);
    return res(
      ctx.status(200),
      ctx.json({ message: 'Completed tasks cleared', deletedCount: previousLength - mockTasks.length })
    );
  })
);

// Setup and teardown for the mock server
beforeAll(() => server.listen());
beforeEach(() => {
  mockTasks = defaultTasks.map((task) => ({ ...task }));
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App Component', () => {
  test('renders the header', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText('Task Compass')).toBeInTheDocument();
    expect(screen.getByText('Plan, track, and complete your work with clarity.')).toBeInTheDocument();
  });

  test('loads and displays tasks in sections', async () => {
    await act(async () => {
      render(<App />);
    });

    // Initially shows loading state
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    });
  });

  test('adds a new task', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });

    // Fill in the form and submit
    const input = screen.getByPlaceholderText('Enter task title');
    await act(async () => {
      await user.type(input, 'New Test Task');
    });

    const submitButton = screen.getByRole('button', { name: 'Add Task' });
    await act(async () => {
      await user.click(submitButton);
    });

    // Assert the newly added task appears after the app re-fetches tasks.
    await waitFor(() => {
      expect(screen.getByText('New Test Task')).toBeInTheDocument();
    });
  });

  test('handles API error', async () => {
    // Override the default handler to simulate an error
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    
    await act(async () => {
      render(<App />);
    });

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch tasks/)).toBeInTheDocument();
    });
  });

  test('shows empty states when no tasks', async () => {
    // Override the default handler to return empty array
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );

    await act(async () => {
      render(<App />);
    });

    // Wait for empty state message
    await waitFor(() => {
      expect(screen.getByText('No active tasks found.')).toBeInTheDocument();
      expect(screen.getByText('No completed tasks yet.')).toBeInTheDocument();
    });
  });

  test('deletes a task', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    await act(async () => {
      await user.click(deleteButtons[0]);
    });

    await waitFor(() => {
      expect(screen.queryByText('Test Task 1')).not.toBeInTheDocument();
    });
  });
});