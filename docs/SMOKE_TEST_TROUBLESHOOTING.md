# Smoke Test Troubleshooting Guide

## Overview

This document provides guidance for troubleshooting smoke test failures on the production site. Smoke tests run automatically on a schedule and after deployments to ensure the live site is functioning correctly.

## Common Failure Scenarios

### 1. MIME Type Errors (Module Script Loading Failures)

**Symptom:**
```
Failed to load module script: Expected a JavaScript-or-Wasm module script 
but the server responded with a MIME type of "application/octet-stream".
```

**Associated Test Failures:**
- `expect(locator).toBeVisible() failed` for body element (body is hidden)
- Navigation elements not found
- No content visible on the page

**Root Cause:**
GitHub Pages is serving JavaScript module files with incorrect MIME types. This prevents the React application from loading, resulting in an empty page.

**Solution:**
This issue is caused by the `actions/upload-pages-artifact@v4` action. The fix is to:

1. Use `actions/upload-pages-artifact@v3` in the deployment workflow
2. Ensure `.gitattributes` file exists with proper text file handling
3. Ensure `.nojekyll` file is in the `public/` folder
4. Ensure `CNAME` file is in the `public/` folder

See [GITHUB_PAGES_MIME_TYPE_FIX.md](./GITHUB_PAGES_MIME_TYPE_FIX.md) for detailed information.

**Verification:**
After deploying the fix:
1. Check browser console for MIME type errors
2. Verify JavaScript files load correctly
3. Verify all smoke tests pass

---

### 2. JavaScript 400 Errors on Page Load

**Symptom:**
```
Error: Failed to load resource: the server responded with a status of 400 ()
```

**Root Cause:**
This error typically indicates that an API call to Supabase is failing. The most common causes are:

1. **Missing Database Migrations** - The production database hasn't had recent migrations applied
2. **Missing Schema Configuration** - The `dogadopt_api` schema is not exposed in the Supabase API configuration
3. **RPC Function Not Available** - Required functions like `get_dogs` or `get_rescues` don't exist in production

**Solution:**

#### Check 1: Verify Migrations Are Applied

Log into your Supabase project and run:
```sql
-- Check if the dogadopt_api schema exists
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'dogadopt_api';

-- Check if get_rescues function exists
SELECT routine_name, routine_schema 
FROM information_schema.routines 
WHERE routine_schema = 'dogadopt_api' 
  AND routine_name = 'get_rescues';
```

If the schema or functions don't exist, you need to apply the migrations:

1. Install the Supabase CLI: `npm install -g supabase`
2. Link to your production project: `supabase link --project-ref your-project-id`
3. Apply migrations: `supabase db push`

#### Check 2: Verify Schema Configuration

The `dogadopt_api` schema must be exposed in the Supabase API configuration.

**For Supabase Cloud (Production):**

1. Go to Supabase Dashboard → Settings → API
2. Scroll to "PostgREST Settings"
3. Ensure `db-schemas` includes both `dogadopt` and `dogadopt_api`
4. The setting should look like: `"dogadopt, dogadopt_api"`
5. Click "Save" and restart the project if needed

**For Local Development:**

Verify in `supabase/config.toml`:
```toml
[api]
enabled = true
port = 54321
schemas = ["dogadopt", "dogadopt_api"]
extra_search_path = ["dogadopt", "dogadopt_api"]
max_rows = 1000
```

#### Check 3: Verify Function Permissions

Ensure the functions have proper permissions:
```sql
-- Grant execute permissions on API functions
GRANT EXECUTE ON FUNCTION dogadopt_api.get_dogs TO anon, authenticated;
GRANT EXECUTE ON FUNCTION dogadopt_api.get_rescues TO anon, authenticated;
GRANT EXECUTE ON FUNCTION dogadopt_api.get_breeds TO anon, authenticated;
```

### 2. Rescues Page Shows No Results

**Symptom:**
```
Test: rescues page displays rescue organizations
Error: expect(locator).toBeVisible() failed
Locator: locator('article h3').first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found
```

**Root Cause:**
The rescues page cannot display rescue cards because the `get_rescues` API function is failing or returning no data.

**Solution:**

#### Check 1: Verify Data Exists
```sql
-- Check if rescues exist in the database
SELECT COUNT(*) FROM dogadopt.rescues;

-- Test the API function directly
SELECT * FROM dogadopt_api.get_rescues() LIMIT 5;
```

If the function fails, see "JavaScript 400 Errors" section above.

If no data exists, you need to populate the rescues table:
- Run the seed data migrations
- Use the admin interface to add rescues
- Import rescue data from CSV files in the `data/` directory

#### Check 2: Check for Database Connection Issues
```sql
-- Verify the database is responding
SELECT NOW();

-- Check for any locks or issues
SELECT * FROM pg_stat_activity 
WHERE datname = current_database() 
  AND state = 'active';
```

### 3. Tests Are Too Flaky (Intermittent Failures)

**Symptom:**
Tests pass sometimes but fail other times without code changes.

**Root Causes:**
- Network latency to production site
- Supabase API rate limits
- Slow database queries
- Browser timeouts

**Solutions:**

#### Increase Timeouts
The smoke tests already have reasonable timeouts, but they can be adjusted:
```typescript
// In tests/smoke/site.spec.ts
await expect(element).toBeVisible({ timeout: 15000 }); // 15 seconds
```

#### Add Retry Logic
The tests already retry 2 times on CI (configured in `playwright.config.ts`):
```typescript
retries: process.env.CI ? 2 : 0
```

#### Filter Out Known Transient Errors
The tests filter out non-critical errors:
```typescript
// Filter out favicon 404s and transient 400 errors
const criticalErrors = consoleErrors.filter(
  error => {
    if (error.includes('favicon') && error.includes('404')) return false;
    if (error.includes('Failed to load resource') && error.includes('400')) return false;
    return true;
  }
);
```

## Deployment Checklist

To prevent smoke test failures after deployment:

### Pre-Deployment
- [ ] Run migrations locally and verify they work: `supabase db reset`
- [ ] Test the application locally with production-like data
- [ ] Run smoke tests against local build: `npm run build && npm run test:smoke`

### During Deployment
- [ ] Apply database migrations to production BEFORE deploying frontend
- [ ] Verify migrations applied successfully in Supabase Dashboard → Database → Migrations
- [ ] Check that `dogadopt_api` schema is exposed in API settings
- [ ] Restart the Supabase project if schema configuration changed

### Post-Deployment
- [ ] Wait for GitHub Pages deployment to complete (~5 minutes)
- [ ] Manually test production site: https://www.dogadopt.co.uk
- [ ] Check that rescues page loads: https://www.dogadopt.co.uk/rescues
- [ ] Review smoke test results in GitHub Actions
- [ ] Check for any console errors in browser DevTools

## Testing Locally Before Production

To test against production-like environment:

```bash
# Build the production bundle
npm run build

# Serve the production build locally
npx serve -s dist

# Run smoke tests against local production build
# (Update playwright.config.ts baseURL temporarily to http://localhost:3000)
npm run test:smoke
```

## Monitoring and Alerts

### Smoke Test Schedule
Smoke tests run:
- **After every deployment** to `main` branch
- **Every 4 hours** on a schedule (via GitHub Actions cron)
- **Manually** via GitHub Actions workflow dispatch

### Alert Workflow
When smoke tests fail:
1. GitHub Actions creates an issue with label `smoke-test-failure`
2. The issue includes:
   - Workflow run ID
   - Timestamp of failure
   - Link to detailed test results
3. Test artifacts (screenshots, traces) are uploaded and available for 30 days

### Accessing Test Results
1. Go to [GitHub Actions](https://github.com/dogadopt/dogadopt.github.io/actions)
2. Find the failed "Smoke Tests" workflow
3. Click on the workflow run
4. Download the `playwright-report` artifact
5. Extract and open `index.html` to view detailed results

## Error Reference

### Common Error Codes

| Error | Meaning | Solution |
|-------|---------|----------|
| 400 Bad Request | Invalid API call or missing function | Check migrations and schema configuration |
| 401 Unauthorized | Authentication required | Check Supabase credentials and auth setup |
| 403 Forbidden | Permission denied | Check RLS policies and function grants |
| 404 Not Found | Page or resource doesn't exist | Check routing and URL configuration |
| 500 Internal Server Error | Database or server error | Check Supabase logs and database status |

### Supabase Error Codes

| Code | Meaning | Common Cause |
|------|---------|--------------|
| 42883 | Function does not exist | Missing migration or wrong schema |
| 42501 | Insufficient privilege | Missing GRANT statement |
| 42P01 | Table does not exist | Missing migration |
| 23505 | Unique violation | Duplicate data in unique constraint |

## Getting Help

If smoke tests continue to fail after following this guide:

1. **Check GitHub Issues** for similar failures: [Issues](https://github.com/dogadopt/dogadopt.github.io/issues?q=is%3Aissue+label%3Asmoke-test-failure)
2. **Review Recent Changes**: Check recent PRs that might have introduced issues
3. **Check Supabase Status**: https://status.supabase.com
4. **Review Application Logs**: Supabase Dashboard → Logs
5. **Create an Issue**: Include workflow run ID and error details

## Related Documentation

- [Database API Layer](DATABASE_API_LAYER.md) - Understanding the API layer architecture
- [Setup and Deployment](SETUP_AND_DEPLOYMENT.md) - Deployment configuration and setup
- [Authentication](AUTHENTICATION.md) - User authentication and roles

## Technical Details

### Test Configuration
- **Framework**: Playwright
- **Browser**: Chromium (headless)
- **Target**: https://www.dogadopt.co.uk (production)
- **Retries**: 2 (on CI)
- **Workers**: 1 (sequential execution)

### Test Coverage
1. Homepage loads successfully
2. Site is responsive and accessible
3. Key pages are accessible
4. No JavaScript errors on page load
5. Site loads within acceptable time
6. Homepage displays dogs
7. Rescues page displays rescue organizations

### Test Files
- Tests: `tests/smoke/site.spec.ts`
- Config: `playwright.config.ts`
- Workflow: `.github/workflows/smoke-tests.yml`
