import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const STATUS = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed',
};

const formatDate = (value) => {
  if (!value) {
    return 'No due date';
  }

  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const isOverdue = (task) => {
  if (!task.due_date || task.completed) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(`${task.due_date}T00:00:00`);
  return due < today;
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(STATUS.ALL);
  const [searchText, setSearchText] = useState('');
  const [form, setForm] = useState({ title: '', description: '', dueDate: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('status', statusFilter);

      if (searchText.trim()) {
        params.set('search', searchText.trim());
      }

      const response = await fetch(`/api/items?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setTasks(result);
      setError(null);
    } catch (err) {
      setError(`Failed to fetch tasks: ${err.message}`);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchText]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const resetForm = () => {
    setForm({ title: '', description: '', dueDate: '' });
    setEditingId(null);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedTitle = form.title.trim();
    if (!trimmedTitle) {
      setError('Task title is required.');
      return;
    }

    const payload = {
      title: trimmedTitle,
      description: form.description.trim(),
      dueDate: form.dueDate || null,
      completed: false,
    };

    try {
      let response;

      if (editingId === null) {
        response = await fetch('/api/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else {
        const existing = tasks.find((task) => task.id === editingId);
        response = await fetch(`/api/items/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...payload,
            completed: existing ? existing.completed : false,
          }),
        });
      }

      if (!response.ok) {
        const responseBody = await response.json();
        throw new Error(responseBody.error || 'Failed to save task');
      }

      resetForm();
      setError(null);
      await fetchTasks();
    } catch (err) {
      setError(`Error saving task: ${err.message}`);
      console.error('Error saving task:', err);
    }
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description || '',
      dueDate: task.due_date || '',
    });
  };

  const handleToggleComplete = async (task) => {
    try {
      const response = await fetch(`/api/items/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description || '',
          dueDate: task.due_date || null,
          completed: !task.completed,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      await fetchTasks();
    } catch (err) {
      setError(`Error updating task status: ${err.message}`);
      console.error('Error updating task status:', err);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      const response = await fetch(`/api/items/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks((previous) => previous.filter((task) => task.id !== taskId));
      setError(null);
    } catch (err) {
      setError(`Error deleting task: ${err.message}`);
      console.error('Error deleting task:', err);
    }
  };

  const handleClearCompleted = async () => {
    try {
      const response = await fetch('/api/items/completed', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear completed tasks');
      }

      await fetchTasks();
    } catch (err) {
      setError(`Error clearing completed tasks: ${err.message}`);
      console.error('Error clearing completed tasks:', err);
    }
  };

  const activeTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Task Compass</h1>
        <p>Plan, track, and complete your work with clarity.</p>
      </header>

      <main>
        <section className="task-form-section" aria-label="task form section">
          <h2>{editingId === null ? 'Add Task' : 'Edit Task'}</h2>
          <form onSubmit={handleSubmit} className="task-form">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleFormChange}
              placeholder="Enter task title"
              required
            />

            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleFormChange}
              placeholder="Add task details"
              rows={3}
            />

            <label htmlFor="dueDate">Due Date</label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={handleFormChange}
            />

            <div className="form-actions">
              <button type="submit" className="primary-btn">
                {editingId === null ? 'Add Task' : 'Save Changes'}
              </button>
              {editingId !== null && (
                <button type="button" className="secondary-btn" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="toolbar-section" aria-label="task controls">
          <h2>Task Controls</h2>
          <div className="toolbar-controls">
            <input
              aria-label="Search tasks"
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search by title or description"
            />
            <select
              aria-label="Filter tasks"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value={STATUS.ALL}>All</option>
              <option value={STATUS.ACTIVE}>Active</option>
              <option value={STATUS.COMPLETED}>Completed</option>
            </select>
            <button type="button" className="danger-btn" onClick={handleClearCompleted}>
              Clear Completed
            </button>
          </div>
        </section>

        <section className="items-section">
          <h2>Active Tasks</h2>
          {loading && <p>Loading tasks...</p>}
          {error && <p className="error">{error}</p>}
          {!loading && !error && activeTasks.length === 0 && <p>No active tasks found.</p>}
          {!loading && !error && activeTasks.length > 0 && (
            <ul>
              {activeTasks.map((task) => (
                <li key={task.id} className={isOverdue(task) ? 'task overdue' : 'task'}>
                  <div className="task-copy">
                    <h3>{task.title}</h3>
                    {task.description && <p>{task.description}</p>}
                    <p className="meta">Due: {formatDate(task.due_date)}</p>
                    {isOverdue(task) && <p className="overdue-label">Overdue</p>}
                  </div>
                  <div className="task-actions">
                    <button type="button" className="secondary-btn" onClick={() => handleEdit(task)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => handleToggleComplete(task)}
                    >
                      Mark Complete
                    </button>
                    <button type="button" className="danger-btn" onClick={() => handleDelete(task.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="items-section">
          <h2>Completed Tasks</h2>
          {!loading && !error && completedTasks.length === 0 && <p>No completed tasks yet.</p>}
          {!loading && !error && completedTasks.length > 0 && (
            <ul>
              {completedTasks.map((task) => (
                <li key={task.id} className="task completed">
                  <div className="task-copy">
                    <h3>{task.title}</h3>
                    {task.description && <p>{task.description}</p>}
                    <p className="meta">Due: {formatDate(task.due_date)}</p>
                  </div>
                  <div className="task-actions">
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => handleToggleComplete(task)}
                    >
                      Mark Active
                    </button>
                    <button type="button" className="danger-btn" onClick={() => handleDelete(task.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;