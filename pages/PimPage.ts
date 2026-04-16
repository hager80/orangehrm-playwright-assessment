import { Page, expect } from '@playwright/test';

export class PimPage {
  constructor(private page: Page) {}

  async openPimModule() {
    await this.page.getByRole('link', { name: 'PIM' }).click();
    await expect(this.page).toHaveURL(/pim/);
  }

  async clickAddEmployee() {
    await this.page.getByRole('button', { name: 'Add' }).click();
    await expect(this.page).toHaveURL(/addEmployee/);
  }

  async addEmployee(firstName: string, lastName: string) {
    await this.page.locator('input[name="firstName"]').fill(firstName);
    await this.page.locator('input[name="lastName"]').fill(lastName);

    await this.page.getByRole('button', { name: 'Save' }).click();

    await expect(this.page).toHaveURL(/viewPersonalDetails/, { timeout: 20000 });
  }
}