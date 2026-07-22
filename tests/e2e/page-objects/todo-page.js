class TodoPage {
  constructor(page) {
    this.page = page;
    this.titleInput = page.getByLabel('Title');
    this.descriptionInput = page.getByLabel('Description');
    this.dueDateInput = page.getByLabel('Due Date');
    this.addTaskButton = page.getByRole('button', { name: 'Add Task' });
    this.activeSection = page.locator('section', {
      has: page.getByRole('heading', { name: 'Active Tasks' }),
    });
    this.completedSection = page.locator('section', {
      has: page.getByRole('heading', { name: 'Completed Tasks' }),
    });
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

  activeTaskRow(title) {
    return this.activeSection.locator('li', {
      has: this.page.getByRole('heading', { name: title }),
    });
  }

  completedTaskRow(title) {
    return this.completedSection.locator('li', {
      has: this.page.getByRole('heading', { name: title }),
    });
  }

  async fetchTasksBySearch(searchText) {
    const response = await this.page.request.get(
      `http://localhost:3030/api/items?search=${encodeURIComponent(searchText)}`
    );
    return response.json();
  }
}

module.exports = { TodoPage };
