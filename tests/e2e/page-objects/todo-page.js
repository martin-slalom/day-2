class TodoPage {
  constructor(page) {
    this.page = page;
    this.titleInput = page.getByLabel('Title');
    this.descriptionInput = page.getByLabel('Description');
    this.dueDateInput = page.getByLabel('Due Date');
    this.addTaskButton = page.getByRole('button', { name: 'Add Task' });
  }

  async goto() {
    await this.page.goto('/');
  }

  async addTask({ title, description = '', dueDate = '' }) {
    await this.titleInput.fill(title);
    await this.descriptionInput.fill(description);

    if (dueDate) {
      await this.dueDateInput.fill(dueDate);
    }

    await this.addTaskButton.click();
  }

  taskRow(title) {
    return this.page.locator('li', {
      has: this.page.getByRole('heading', { name: title }),
    });
  }
}

module.exports = { TodoPage };
