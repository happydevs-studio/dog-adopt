# Post-Merge Setup Checklist

After merging this PR, follow these steps to complete the CI/CD setup:

## 1. Enable GitHub Pages

1. Go to repository **Settings**
2. Navigate to **Pages** (under "Code and automation")
3. Under **Source**, select **"GitHub Actions"**
4. Click **Save**

## 2. Add Repository Secrets

Go to **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add the following secrets:

### For Application Deployment:

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API → Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon/public key | Supabase Dashboard → Settings → API → Project API keys → anon public |
| `VITE_SUPABASE_PROJECT_ID` | Your Supabase project ID | Extract from your project URL (the subdomain) |

### For Supabase Migrations:

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI access token | https://supabase.com/dashboard/account/tokens |
| `SUPABASE_PROJECT_REF` | Your Supabase project reference | Supabase Dashboard URL or Settings → General |

## 3. Test the Workflows

After merging to main:

1. **Check CI Workflow**: 
   - Should run automatically after merge
   - Verify in **Actions** tab
   - Ensure lint, typecheck, and build pass

2. **Check Deploy Workflow**:
   - Should run automatically after merge
   - Deploys to GitHub Pages
   - Site will be available at: `https://[your-username].github.io/adopt-a-dog-uk/`

3. **Test Supabase Migrations** (if migrations exist):
   - Manually trigger via **Actions** → **Supabase Migrations** → **Run workflow**
   - Or push changes to `supabase/migrations/**`

## 4. Verify Deployment

1. Visit your GitHub Pages URL: `https://[your-username].github.io/adopt-a-dog-uk/`
2. Check that the site loads correctly
3. Verify Supabase connection is working
4. Test authentication and database features

## 5. Optional: Custom Domain Setup

If using a custom domain (dogadopt.co.uk):

1. Update `vite.config.ts`:
   ```typescript
   base: mode === "production" ? "/" : "/",
   ```

2. Configure custom domain in **Settings** → **Pages** → **Custom domain**

3. Add DNS records as instructed by GitHub

## Troubleshooting

### Build Fails
- Check that all secrets are correctly configured
- Verify no syntax errors in code
- Review Actions logs for specific errors

### Deployment Doesn't Update
- Ensure GitHub Pages is set to "GitHub Actions" source
- Check workflow permissions are correct
- Verify the workflow completed successfully

### Supabase Migrations Fail
- Verify `SUPABASE_ACCESS_TOKEN` has correct permissions
- Check `SUPABASE_PROJECT_REF` matches your production project
- Review migration file syntax

## Need Help?

Refer to the detailed documentation:
- [CI/CD Setup Guide](./CI_CD_SETUP.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
