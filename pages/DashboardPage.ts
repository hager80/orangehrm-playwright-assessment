import { Page, expect } from '@playwright/test';

export class DashboardPage {
  constructor(private page: Page) {}

  async openAdminModule() {
    await this.page.getByRole('link', { name: 'Admin' }).click();
    await expect(this.page).toHaveURL(/admin/);
  }
}