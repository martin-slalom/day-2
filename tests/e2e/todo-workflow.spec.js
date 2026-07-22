const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./page-objects/todo-page');

test.describe('TODO workflow', () => {
  test('user can create and complete a task', async ({ page }) => {
    const todoPage = new TodoPage(page);
    const taskTitle = `Prepare release notes ${Date.now()}`;

    await todoPage.goto();

    await todoPage.addTask({
      title: taskTitle,
      description: 'Summarize sprint outcomes for launch',
      dueDate: '2030-05-01',
    });

    const createdTask = todoPage.activeTaskRow(taskTitle);
    await expect(createdTask).toBeVisible();

    await createdTask.getByRole('button', { name: 'Mark Complete' }).click();

    await expect(todoPage.activeTaskRow(taskTitle)).toHaveCount(0);
    await expect(todoPage.completedTaskRow(taskTitle)).toBeVisible();

    const tasks = await todoPage.fetchTasksBySearch(taskTitle);
    const matchingTask = tasks.find((task) => task.title === taskTitle);
    expect(matchingTask).toBeTruthy();
    expect(matchingTask.completed).toBe(true);
  });
});
