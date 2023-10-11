import { test, expect, Page } from '@playwright/test';

test.describe('hCaptchaLoader', async () => {
    let page: Page;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
    });

    test.describe('per view', () => {

        test.beforeAll(async () => {
            await page.goto('http://localhost:8080/demo/src', { waitUntil: 'networkidle' });
        });

        test('should load hCaptcha checkbox', async () => {
            const element = await page.getByTestId('hCaptcha').click();
            await expect(page).toHaveScreenshot('hcaptcha-loaded.png', { maxDiffPixelRatio: 0.03, fullPage: true });
        });
    });

});
