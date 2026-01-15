# CI/CD Pipeline Documentation

## Overview

This repository uses GitHub Actions for continuous integration and deployment. The pipeline automatically builds, tests, and deploys the application to GitHub Pages, while also managing Supabase database migrations—all in a single unified workflow.

## Workflows

### Deploy Workflow (`deploy.yml`)

**Trigger:** Runs on pushes to `main` branch and manual workflow dispatch

**Purpose:** Complete CI/CD pipeline that validates code, applies migrations, and deploys to GitHub Pages

The workflow consists of three sequential jobs:

#### Job 1: CI - Lint, Type Check, and Build

**Purpose:** Validates code quality and builds the application

**Steps:**
- Checkout code
- Install Node.js dependencies
- Run linter (ESLint) - continues on error for pre-existing issues
- Run type checking (TypeScript)
- Build application with production environment variables
- Upload build artifacts

**Required Secrets:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase publishable/anon key
- `VITE_SUPABASE_PROJECT_ID` - Your Supabase project ID

#### Job 2: Apply Supabase Migrations

**Purpose:** Applies database migrations and seeds reference data to production Supabase project

**Dependencies:** Runs only after CI job completes successfully

**Steps:**
- Checkout code
- Setup Supabase CLI
- Link to production project
- Apply migrations and seed data with `supabase db push --include-seed`

**Required Secrets:**
- `SUPABASE_ACCESS_TOKEN` - Supabase access token for CLI authentication
- `SUPABASE_PROJECT_REF` - Your Supabase project reference ID

#### Job 3: Deploy to GitHub Pages

**Purpose:** Deploys the built application to GitHub Pages

**Dependencies:** Runs only after migrations job completes successfully

**Steps:**
- Download build artifacts from CI job
- Configure GitHub Pages
- Upload and deploy to GitHub Pages

**Permissions Required:**
- Contents: read
- Pages: write
- ID token: write

### Smoke Tests Workflow (`smoke-tests.yml`)

**Trigger:** 
- Runs every 6 hours on a schedule (`0 */6 * * *` cron)
- After Deploy workflow completes
- Manual workflow dispatch

**Purpose:** Validates that the production site (www.dogadopt.co.uk) is up and functioning correctly

**Steps:**
- Checkout code
- Install Node.js and dependencies
- Install Playwright browsers (Chromium)
- Run smoke tests against production site
- Upload test reports as artifacts
- Create GitHub issue on failure

**Features:**
- **Automated Monitoring:** Runs every 6 hours to catch issues quickly
- **Post-Deployment Verification:** Runs after each deployment automatically
- **Issue Creation:** Creates a GitHub issue with label `smoke-test-failure` when tests fail
- **Test Reports:** Uploads Playwright HTML reports as artifacts for debugging

**Test Coverage:**
The smoke tests verify:
1. Homepage loads successfully
2. Site is responsive and accessible
3. Key pages are accessible
4. No JavaScript errors on page load
5. Site loads within acceptable time (< 5 seconds)
6. Dogs are displayed on the homepage (core functionality)
7. Rescues are displayed on the rescues page (core functionality)

For more details, see `tests/smoke/README.md`.

## Execution Flow

### Deploy Workflow
The deployment workflow executes in this order:
1. **CI Job** runs first (lint, typecheck, build)
2. **Migrations Job** runs only if CI succeeds
   - Applies database schema migrations and seeds reference data in one command
   - Uses `supabase db push --include-seed` to apply both migrations and seed data
3. **Deploy Job** runs only if migrations succeed

This ensures code quality is validated before migrations are applied, reference data is synchronized via MERGE, and migrations are complete before deployment.

### Smoke Tests Workflow
The smoke tests workflow runs independently:
- **Scheduled:** Every 6 hours automatically
- **Post-Deployment:** After deploy workflow completes
- **On-Demand:** Can be triggered manually

Tests run against the live production site and create issues automatically if failures are detected.

## Setup Instructions

### 1. Enable GitHub Pages

1. Go to your repository settings
2. Navigate to **Pages** section
3. Under **Source**, select "GitHub Actions"
4. Save the configuration

### 2. Configure Repository Secrets

Add the following secrets in your repository settings (Settings → Secrets and variables → Actions):

**For Application Deployment:**
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_BASE_PATH=/adopt-a-dog-uk/
```

**Note:** `VITE_BASE_PATH` controls the base URL path for the application. Use `/adopt-a-dog-uk/` for GitHub Pages subdirectory deployment, or `/` when deploying to the root domain.

**For Supabase Migrations:**
```
SUPABASE_ACCESS_TOKEN=your-access-token
SUPABASE_PROJECT_REF=your-project-ref
```

### 3. Obtaining Supabase Credentials

**Project URL and Keys:**
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the Project URL and anon/public key

**Access Token:**
1. Go to https://supabase.com/dashboard/account/tokens
2. Generate a new access token
3. Store it securely as a repository secret

**Project Reference:**
1. Found in your Supabase project URL: `https://supabase.com/dashboard/project/[PROJECT_REF]`
2. Or in Settings → General

### 4. Verify Deployment

After setting up:
1. Push changes to `main` branch
2. Check the Actions tab for workflow runs
3. Verify deployment at `https://[your-username].github.io/adopt-a-dog-uk/`

## Local Development

The base path is controlled by the `VITE_BASE_PATH` environment variable:
- **Default (if not set):** Uses root path `/`
- **Current production:** Set to `/adopt-a-dog-uk/` for GitHub Pages subdirectory
- **Future production:** Change to `/` when moving to root domain

Update the value in your `.env` file for local development, and in GitHub Secrets for production deployment.

No other changes are needed in your development workflow.

## Troubleshooting

### Build Failures (CI Job)

Check the Actions tab for detailed logs. Common issues:
- Missing or incorrect environment variables
- TypeScript errors
- Linting errors (warnings don't fail the build)

If the CI job fails, the migrations and deployment will not run.

### Migration Failures

- Verify `SUPABASE_ACCESS_TOKEN` has sufficient permissions
- Ensure `SUPABASE_PROJECT_REF` matches your production project
- Check migration files for syntax errors

If migrations fail, deployment will not proceed, protecting your production site from deploying with an inconsistent database state.

### Deployment Issues

- Ensure GitHub Pages is enabled and set to "GitHub Actions" source
- Verify all required secrets are set correctly
- Check that the repository has Pages write permissions
- Ensure CI and migrations jobs completed successfully

## Manual Deployment

You can trigger the full pipeline manually:
1. Go to Actions tab
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"
4. Select the branch and run

This will run all three jobs in sequence: CI, migrations, then deployment.

## Security Notes

- Never commit secrets to the repository
- Use GitHub Secrets for all sensitive data
- Access tokens should have minimum required permissions
- Rotate tokens periodically for security

## Monitoring

Monitor your workflows:
- Actions tab shows all workflow runs
- Email notifications for failures (configurable in GitHub settings)
- Check deployment status before each release
