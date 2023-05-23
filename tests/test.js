import { expect, test } from '@playwright/test';

// eslint-disable-next-line no-empty-pattern
test.beforeEach(async ({}, testInfo) => {
	testInfo.snapshotPath = (name) => `${testInfo.file}-snapshots/${name}`;
});

test('compare screenshot', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveScreenshot();
});
