const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./page-objects/todo-page');

test.describe('TODO workflow', () => {
  test('user can create and complete a task', async ({ page }) => {
    const todoPage = new TodoPage(page);

    await todoPage.goto();

    await todoPage.addTask({
      title: 'Prepare release notes',
      description: 'Summarize sprint outcomes for launch',
      dueDate: '2030-05-01',
    });

    const createdTask = todoPage.taskRow('Prepare release notes');
    await expect(createdTask).toBeVisible();

    await createdTask.getByRole('button', { name: 'Mark Complete' }).click();

    const completedSection = page.locator('section', {
      has: page.getByRole('heading', { name: 'Completed Tasks' }),
    });

    await expect(completedSection.getByText('Prepare release notes')).toBeVisible();
  });
});
