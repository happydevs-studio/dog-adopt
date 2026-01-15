# Smoke Tests

This directory contains Playwright smoke tests that verify the production site (www.dogadopt.co.uk) is up and working correctly.

## What are Smoke Tests?

Smoke tests are a subset of tests that verify the critical functionality of the application. They ensure:
- The site loads successfully
- Key pages are accessible
- No critical JavaScript errors occur
- The site responds within acceptable time limits

## Running Tests Locally

```bash
# Install dependencies (if not already installed)
npm ci

# Install Playwright browsers
npx playwright install chromium

# Run smoke tests
npm run test:smoke

# Run with UI for debugging
npm run test:smoke:ui

# Run in headed mode (see browser)
npm run test:smoke:headed
```

## GitHub Actions

The smoke tests run automatically:
- **Every 6 hours** via scheduled cron job
- **After each deployment** to GitHub Pages
- **On-demand** via manual workflow trigger

If tests fail, an issue is automatically created with the label `smoke-test-failure`.

## Configuration

The Playwright configuration is in `playwright.config.ts` and includes:
- Base URL: `https://www.dogadopt.co.uk`
- Browser: Chromium (for speed and reliability)
- Retries: 2 on CI, 0 locally
- Screenshots on failure
- Trace collection on retry

## Test Coverage

Current smoke tests verify:
1. Homepage loads successfully
2. Site is responsive and accessible
3. Key pages are accessible
4. No JavaScript errors on page load
5. Site loads within acceptable time (< 5 seconds)
6. **Dogs are displayed on the homepage** (key site functionality)
7. **Rescues are displayed on the rescues page** (key site functionality)

## Adding New Tests

To add new smoke tests:
1. Add test cases to `site.spec.ts` or create new spec files
2. Keep tests focused on critical functionality
3. Ensure tests are resilient to minor UI changes
4. Test against production URLs only
