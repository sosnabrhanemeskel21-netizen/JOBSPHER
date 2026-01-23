import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect the page to have the brand name
    await expect(page.getByText('Jobspher', { exact: true })).toBeVisible();
});

test('can navigate to login', async ({ page }) => {
    await page.goto('/');

    // Click the Login link.
    await page.getByRole('link', { name: 'Login' }).click();

    // Expects page to have a heading with Login.
    await expect(page.getByRole('heading', { name: 'Login to Jobspher' })).toBeVisible();
});
