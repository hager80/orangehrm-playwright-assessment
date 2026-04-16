import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { AdminPage } from '../pages/AdminPage';
import { PimPage } from '../pages/PimPage';
import { generateUserData } from '../utils/testData';

test.setTimeout(120000);

test('Admin should add and delete a user successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const adminPage = new AdminPage(page);
  const pimPage = new PimPage(page);

  const user = generateUserData();

  await loginPage.goto();
  await loginPage.login('Admin', 'admin123');

  // Create employee first
  await pimPage.openPimModule();
  await pimPage.clickAddEmployee();
  await pimPage.addEmployee(user.firstName, user.lastName);

  // Go to Admin
  await dashboardPage.openAdminModule();
  const initialCount = await adminPage.getRecordsCount();

  // Add system user
  await adminPage.clickAdd();
  await adminPage.addNewUser(user.firstName, user.username, user.password);

  // Verify count increased
  await adminPage.openAdminModule();
  const countAfterAdd = await adminPage.getRecordsCount();
  expect(countAfterAdd).toBe(initialCount + 1);

  // Search created user
  await adminPage.searchByUsername(user.username);
  await adminPage.verifyUserVisible(user.username);

  // Delete created user
  await adminPage.deleteUserByUsername(user.username);
  await adminPage.resetSearch();

  // Verify count returned
  const finalCount = await adminPage.getRecordsCount();
  expect(finalCount).toBe(initialCount);
});