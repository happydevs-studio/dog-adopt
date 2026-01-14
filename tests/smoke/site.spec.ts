import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Production Site', () => {
  test('homepage loads successfully', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the page title is correct
    await expect(page).toHaveTitle(/Dog Adopt|Adopt a Dog UK/i);
    
    // Check that the main content is visible
    const mainContent = page.locator('body');
    await expect(mainContent).toBeVisible();
    
    // Verify no critical errors on the page
    const errorMessages = page.locator('text=/error|failed|not found/i');
    await expect(errorMessages).toHaveCount(0);
  });

  test('site is responsive and accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that essential navigation elements exist
    const nav = page.locator('nav, header, [role="navigation"]').first();
    await expect(nav).toBeVisible();
    
    // Verify the page has proper structure
    await expect(page.locator('body')).toBeVisible();
  });

  test('key pages are accessible', async ({ page }) => {
    // Test homepage
    await page.goto('/');
    await expect(page).toHaveURL(/dogadopt\.co\.uk/);
    
    // Check for common page elements
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Verify page loaded without server errors
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);
  });

  test('no JavaScript errors on page load', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Capture page errors
    page.on('pageerror', (error) => {
      consoleErrors.push(error.message);
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out known acceptable errors (if any)
    const criticalErrors = consoleErrors.filter(
      error => !error.includes('favicon') // Ignore favicon errors
    );
    
    // Assert no critical JavaScript errors
    expect(criticalErrors).toHaveLength(0);
  });

  test('site loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    
    // Site should load in less than 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});
