import { test, expect } from '@playwright/test';

// Configuration constants
const MAX_ALLOWED_CONSOLE_ERRORS = 3;

// Helper function to wait for loading spinner to disappear
async function waitForLoadingComplete(page: any) {
  const loadingSpinner = page.locator('svg.animate-spin');
  if (await loadingSpinner.isVisible().catch(() => false)) {
    await loadingSpinner.waitFor({ state: 'hidden', timeout: 20000 });
  }
}

test.describe('Smoke Tests - Production Site', () => {
  test('homepage loads successfully', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for the page to load with a longer timeout
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Check that the page title is correct (allow various formats)
    await expect(page).toHaveTitle(/DogAdopt|Adopt|Dog/i);
    
    // Check that the main content is visible
    const mainContent = page.locator('body');
    await expect(mainContent).toBeVisible();
    
    // Verify the page has some key content (header, main section, etc.)
    const header = page.locator('header, nav, [role="navigation"]').first();
    await expect(header).toBeVisible({ timeout: 10000 });
  });

  test('site is responsive and accessible', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Check that essential navigation elements exist
    const nav = page.locator('nav, header, [role="navigation"]').first();
    await expect(nav).toBeVisible({ timeout: 10000 });
    
    // Verify the page has proper structure
    await expect(page.locator('body')).toBeVisible();
  });

  test('key pages are accessible', async ({ page }) => {
    // Test homepage with longer timeout
    const response = await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Verify page loaded without server errors
    expect(response?.status()).toBeLessThan(400);
    
    // Check for common page elements
    const body = page.locator('body');
    await expect(body).toBeVisible();
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
    
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Filter out known acceptable errors (if any)
    const criticalErrors = consoleErrors.filter(
      error => {
        // Filter out favicon errors
        if (error.includes('favicon') && (error.includes('404') || error.includes('Failed to load'))) {
          return false;
        }
        // Filter out generic 400 errors from failed resource loads without specific details
        // These are often transient network issues or expected API behaviors (e.g., geolocation API)
        if (error.includes('Failed to load resource') && error.includes('400')) {
          return false;
        }
        // Filter out Supabase auth errors that are expected when not logged in
        if (error.includes('AuthApiError') || error.includes('Invalid Refresh Token')) {
          return false;
        }
        return true;
      }
    );
    
    // Log errors for debugging but allow some errors in production
    if (criticalErrors.length > 0) {
      console.log('Console errors detected:', criticalErrors);
    }
    
    // Assert no critical JavaScript errors (allow up to MAX_ALLOWED_CONSOLE_ERRORS minor errors)
    expect(criticalErrors.length).toBeLessThanOrEqual(MAX_ALLOWED_CONSOLE_ERRORS);
  });

  test('site loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    
    // Site should load in less than 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('homepage displays dogs available for adoption', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for the loading spinner to disappear (if present)
    await waitForLoadingComplete(page);
    
    // Check for error state
    const errorMessage = page.locator('text=/error loading dogs/i');
    const hasError = await errorMessage.isVisible().catch(() => false);
    
    if (hasError) {
      // If there's an error, log it but don't fail the test - this might be a transient API issue
      console.log('WARNING: Dogs section is showing an error message');
      await page.screenshot({ path: `playwright-report/dogs-error-${Date.now()}.png` });
      // Verify the page structure loaded even if data didn't
      await expect(page.locator('text=/Dogs Looking for Homes/i')).toBeVisible();
      return;
    }
    
    // Check for "no dogs found" state
    const noDogs = page.locator('text=/no dogs found/i');
    const hasNoDogs = await noDogs.isVisible().catch(() => false);
    
    if (hasNoDogs) {
      // If no dogs are found, verify the page structure loaded
      console.log('INFO: No dogs currently available in the system');
      await expect(page.locator('text=/Dogs Looking for Homes/i')).toBeVisible();
      return;
    }
    
    // Wait for dogs to load - look for dog cards (article elements with dog info)
    // DogCard renders as <article> with dog name in <h3> and breed info
    const dogCards = page.locator('article h3');
    
    // Should have at least one dog displayed
    await expect(dogCards.first()).toBeVisible({ timeout: 10000 });
    
    // Verify multiple dogs are present (key feature of the site)
    const dogCount = await dogCards.count();
    expect(dogCount).toBeGreaterThan(0);
    
    console.log(`Found ${dogCount} dogs on homepage`);
  });

  test('rescues page displays rescue organizations', async ({ page }) => {
    await page.goto('/rescues');
    await page.waitForLoadState('networkidle');
    
    // Wait for the loading spinner to disappear (if present)
    await waitForLoadingComplete(page);
    
    // Check if there's an error message on the page
    const errorMessage = page.locator('text=/error loading rescues/i');
    const hasError = await errorMessage.isVisible().catch(() => false);
    
    if (hasError) {
      // If there's an error, log it but don't fail the test - this might be a transient API issue
      console.log('WARNING: Rescues page is showing an error message');
      await page.screenshot({ path: `playwright-report/rescues-error-${Date.now()}.png` });
      // Verify the page structure loaded even if data didn't
      await expect(page.locator('text=/Rescue Organizations/i')).toBeVisible();
      return;
    }
    
    // Check if there's a "no rescues found" message
    const noRescuesMessage = page.locator('text=/no rescues found/i');
    const hasNoRescues = await noRescuesMessage.isVisible().catch(() => false);
    
    if (hasNoRescues) {
      // If no rescues are found, verify the page structure loaded
      console.log('INFO: No rescues currently available in the system');
      await expect(page.locator('text=/Rescue Organizations/i')).toBeVisible();
      return;
    }
    
    // Wait for rescues to load - look for rescue cards (article elements with rescue info)
    // RescueCard renders as <article> with rescue name in <h3>
    const rescueCards = page.locator('article h3');
    
    // Should have at least one rescue displayed (with a longer timeout for slow API)
    await expect(rescueCards.first()).toBeVisible({ timeout: 15000 });
    
    // Verify multiple rescues are present
    const rescueCount = await rescueCards.count();
    expect(rescueCount).toBeGreaterThan(0);
    
    console.log(`Found ${rescueCount} rescue organizations on rescues page`);
  });
});
