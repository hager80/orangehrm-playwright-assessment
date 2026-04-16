import { Page, expect, Locator } from '@playwright/test';

export class AdminPage {
  constructor(private page: Page) {}

  private fieldGroupByLabel(labelText: string): Locator {
    return this.page.locator('.oxd-input-group').filter({
      has: this.page.locator('label').filter({
        hasText: new RegExp(`^${labelText}$`),
      }),
    });
  }

  private selectField(labelText: string): Locator {
    return this.fieldGroupByLabel(labelText).locator('.oxd-select-text');
  }

  private inputField(labelText: string): Locator {
    return this.fieldGroupByLabel(labelText).locator('input');
  }

  async openAdminModule() {
    await this.page.getByRole('link', { name: 'Admin' }).click();
    await expect(this.page).toHaveURL(/admin/);
  }

  async getRecordsCount(): Promise<number> {
    await this.page.waitForLoadState('networkidle');

    const text = await this.page
      .locator('span.oxd-text.oxd-text--span')
      .filter({ hasText: 'Records Found' })
      .first()
      .textContent();

    const match = text?.match(/\((\d+)\)\s*Records Found/);

    if (!match) {
      throw new Error(`Could not extract records count from text: ${text}`);
    }

    return Number(match[1]);
  }

  async clickAdd() {
    await this.page.getByRole('button', { name: 'Add' }).click();
    await expect(this.page).toHaveURL(/saveSystemUser/);
  }

  async addNewUser(
    employeeFirstName: string,
    username: string,
    password: string
  ) {
    await this.page.waitForLoadState('networkidle');

    // User Role
    await this.selectField('User Role').click();
    await this.page.getByRole('option', { name: 'ESS' }).click();

    // Employee Name
    const employeeInput = this.inputField('Employee Name');
    await employeeInput.click();
    await employeeInput.fill(employeeFirstName);

    const matchingOption = this.page
      .locator('.oxd-autocomplete-option')
      .filter({ hasText: employeeFirstName })
      .first();

    await expect(matchingOption).toBeVisible({ timeout: 15000 });
    await matchingOption.click();

    // Status
    await this.selectField('Status').click();
    await this.page.getByRole('option', { name: 'Enabled' }).click();

    // Username
    await this.inputField('Username').fill(username);

    // Password
    const passwordInputs = this.page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill(password);
    await passwordInputs.nth(1).fill(password);

    // Save
    await this.page.getByRole('button', { name: 'Save' }).click();

    await expect(this.page).toHaveURL(/viewSystemUsers/, { timeout: 20000 });
  }

  async searchByUsername(username: string) {
    await expect(this.page).toHaveURL(/viewSystemUsers/);
    await this.page.waitForLoadState('networkidle');

    const searchUsernameInput = this.inputField('Username').first();
    await expect(searchUsernameInput).toBeVisible({ timeout: 10000 });
    await searchUsernameInput.fill(username);

    await this.page.getByRole('button', { name: 'Search' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async verifyUserVisible(username: string) {
    await expect(this.page.locator('.oxd-table-body')).toContainText(username);
  }

  async deleteUserByUsername(username: string) {
    const row = this.page.locator('.oxd-table-row', { hasText: username }).first();
    await expect(row).toBeVisible({ timeout: 10000 });

    await row.locator('button i.bi-trash').click();
    await this.page.getByRole('button', { name: 'Yes, Delete' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async resetSearch() {
    await this.page.getByRole('button', { name: 'Reset' }).click();
    await this.page.waitForLoadState('networkidle');
  }
}