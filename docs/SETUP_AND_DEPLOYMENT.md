# Setup and Deployment Guide

## Initial Setup

### 1. Enable GitHub Pages

1. Go to repository **Settings** → **Pages**
2. Under **Source**, select **"GitHub Actions"**
3. Save the configuration

### 2. Configure Repository Secrets

Go to **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

#### Application Secrets

| Secret | Description | Location |
|--------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Dashboard → Settings → API → Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | Dashboard → Settings → API → anon public |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID | Extract from project URL |
| `VITE_BASE_PATH` | Deployment base path | `/adopt-a-dog-uk/` or `/` for root |

#### Deployment Secrets

| Secret | Description | Location |
|--------|-------------|----------|
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI access token | https://supabase.com/dashboard/account/tokens |
| `SUPABASE_PROJECT_REF` | Supabase project reference | Dashboard URL or Settings → General |

### 3. Getting Supabase Credentials

1. **Project URL and Keys**: Dashboard → Settings → API
2. **Access Token**: https://supabase.com/dashboard/account/tokens → Generate New Token
3. **Project Reference**: Settings → General → Reference ID

## CI/CD Pipeline

### Deploy Workflow (`deploy.yml`)

**Triggers:** Pushes to `main` branch, manual dispatch

**Jobs:**

1. **CI** - Lint, type check, build
   - Runs ESLint (continues on pre-existing errors)
   - Runs TypeScript type checking
   - Builds with production environment variables
   - Uploads build artifacts

2. **Apply Supabase Migrations** (runs after CI)
   - Links to production project
   - Applies migrations and seed data with `supabase db push --include-seed`

3. **Deploy to GitHub Pages** (runs after migrations)
   - Downloads build artifacts
   - Deploys to GitHub Pages

4. **Create Issue on Failure** (runs if any job fails)
   - Creates GitHub issue with label `deployment-failure`
   - Adds comment if issue already exists
   - Includes failure details and workflow link

### Smoke Tests Workflow (`smoke-tests.yml`)

**Triggers:**
- Every 6 hours (scheduled)
- After deploy workflow completes
- Manual dispatch

**Verification:**
- Homepage loads successfully
- Site is responsive and accessible
- No JavaScript errors
- Dogs and rescues are displayed
- Load time < 5 seconds

**On Failure:** Creates GitHub issue with label `smoke-test-failure`

## Local Development

### Base Path Configuration

Controlled by `VITE_BASE_PATH` environment variable:
- **Local dev**: Use `/` (default if not set)
- **GitHub Pages subdirectory**: Use `/adopt-a-dog-uk/`
- **Root domain**: Use `/`

Update in `.env` for local development and GitHub Secrets for production.

## Troubleshooting

### Build Failures
- Check Actions tab for detailed logs
- Verify all environment variables are set
- Review TypeScript and linting errors

### Migration Failures
- Verify `SUPABASE_ACCESS_TOKEN` has sufficient permissions
- Ensure `SUPABASE_PROJECT_REF` matches production project
- Check migration files for syntax errors

### Deployment Issues
- Ensure GitHub Pages is set to "GitHub Actions" source
- Verify all required secrets are set
- Check repository has Pages write permissions
- Confirm CI and migrations completed successfully

### Site Shows "Configuration Required"
- Environment variables weren't available during build
- Check secrets are in repository settings (not organization)
- Re-run deployment after adding secrets

## Manual Deployment

1. Go to Actions tab
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"
4. Select branch and run

## Security Notes

- Never commit secrets to repository
- Use GitHub Secrets for all sensitive data
- Publishable/Anonymous keys are safe for client-side use (protected by RLS)
- Access tokens are sensitive - use only in CI/CD
- Rotate tokens periodically

## Post-Merge Checklist

After merging changes:

1. ✅ Verify workflows run successfully in Actions tab
2. ✅ Check deployment at GitHub Pages URL
3. ✅ Verify Supabase connection works
4. ✅ Test authentication and database features
5. ✅ Monitor for smoke test failures

## Custom Domain Setup

When moving to custom domain (dogadopt.co.uk):

1. Update `VITE_BASE_PATH` secret to `/`
2. Configure custom domain in Settings → Pages
3. Add DNS records as instructed by GitHub
4. Wait for DNS propagation and SSL certificate provisioning
