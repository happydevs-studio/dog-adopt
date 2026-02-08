# Netlify Deployment Guide

This guide explains how to deploy the Dog Adopt application to Netlify.

## Prerequisites

- A Netlify account ([sign up here](https://app.netlify.com/signup))
- A Supabase project with the necessary credentials
- The repository connected to Netlify

## Environment Variables Configuration

Netlify requires environment variables to be configured **before** building the application. These variables are injected at build time by Vite.

### Required Environment Variables

Navigate to your Netlify site dashboard, then go to **Site settings → Environment variables** and add:

| Variable Name | Description | Example Value |
|--------------|-------------|---------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anonymous/public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID | `xxxxx` (extracted from URL) |
| `VITE_BASE_PATH` | Base path for the app | `/` (for root domain) |
| `VITE_DEV_BYPASS_AUTH` | Bypass auth in dev mode | `false` (must be false for production) |

### Getting Your Supabase Credentials

1. **Supabase URL and Keys**:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Navigate to **Settings → API**
   - Copy the **Project URL** and **anon/public** key

2. **Project ID**:
   - Extract from the Project URL (the part before `.supabase.co`)
   - Example: `https://abcd1234.supabase.co` → Project ID is `abcd1234`

## Deployment Methods

### Option 1: Deploy via Netlify UI (Recommended for First Setup)

1. Log in to [Netlify](https://app.netlify.com/)
2. Click **"Add new site" → "Import an existing project"**
3. Connect to your GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Base directory**: (leave empty)
5. Before deploying, click **"Advanced"** and add all environment variables listed above
6. Click **"Deploy site"**

### Option 2: Deploy via GitHub Actions (Automated)

The repository includes a GitHub Actions workflow (`.github/workflows/netlify-deploy.yml`) that automatically deploys to Netlify on every push to `main`.

#### Setup GitHub Secrets

For GitHub Actions to work, add these secrets to your repository:

1. Go to **Repository Settings → Secrets and variables → Actions**
2. Add the following secrets:
   - `NETLIFY_AUTH_TOKEN`: Your Netlify personal access token
     - Get it from [Netlify → User Settings → Applications → Personal access tokens](https://app.netlify.com/user/applications#personal-access-tokens)
   - `NETLIFY_SITE_ID`: Your Netlify site ID
     - Found in **Site settings → General → Site details → Site ID**
   - All the `VITE_*` environment variables listed in the table above

#### How the Workflow Works

- **On push to `main`**: Deploys to production
- **On pull request**: Creates a preview deployment
- Environment variables from GitHub Secrets are used during the build

### Option 3: Deploy via Netlify CLI

Install Netlify CLI:

```bash
npm install -g netlify-cli
```

Log in:

```bash
netlify login
```

Link your site (first time only):

```bash
netlify link
```

Deploy:

```bash
netlify deploy --prod
```

Note: You'll need to set environment variables in the Netlify UI before building.

## Netlify Configuration File

The `netlify.toml` file in the repository root contains:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

This configuration:
- Sets the publish directory to `dist` (Vite's output)
- Defines the build command
- Redirects all routes to `index.html` for client-side routing (React Router)

## Troubleshooting

### Issue: "Configuration Required" Error After Deployment

**Cause**: Environment variables were not set or were not available during build time.

**Solution**:
1. Verify all environment variables are set in **Netlify → Site settings → Environment variables**
2. Important: Netlify needs variables at **build time**, not runtime
3. Trigger a new deployment:
   - Go to **Deploys** tab
   - Click **"Trigger deploy" → "Clear cache and deploy site"**

### Issue: Supabase Calls Fail with CORS Errors

**Cause**: Supabase project doesn't have the Netlify domain in allowed origins.

**Solution**:
1. Go to Supabase Dashboard → **Settings → API**
2. Add your Netlify domain to **Site URL** and **Additional redirect URLs**
3. Format: `https://your-site-name.netlify.app`

### Issue: 404 Errors on Page Refresh

**Cause**: Missing redirect rules for client-side routing.

**Solution**: 
- Ensure the `netlify.toml` file is committed to your repository
- It should contain the redirect rule shown above

### Issue: Build Fails with "vite: not found"

**Cause**: Dependencies not installed properly.

**Solution**:
- Check that `package.json` and `package-lock.json` are committed
- Try clearing build cache in Netlify and redeploying

### Issue: Environment Variables Not Applied

**Symptoms**: 
- Build succeeds but app shows configuration error
- JavaScript contains `UNCONFIGURED` values

**Solution**:
1. Environment variables must be prefixed with `VITE_` for Vite to inject them
2. Variables must be set **before** the build, not after
3. Check that variable names are exactly as shown (case-sensitive)
4. After adding/updating variables, trigger a new deployment

## Post-Deployment Verification

After deploying, verify your site:

1. **Visit the site** - Check that it loads without errors
2. **Open browser console** - Look for any configuration errors
3. **Test Supabase connection**:
   - Try browsing dogs on the homepage
   - Check that data loads from Supabase
4. **Test authentication** (if using):
   - Try signing in
   - Verify user sessions persist

## Custom Domain Setup

To use a custom domain with Netlify:

1. Go to **Site settings → Domain management**
2. Click **"Add custom domain"**
3. Follow Netlify's instructions to configure DNS
4. Update `VITE_BASE_PATH` to `/` if not already set
5. Update Supabase allowed origins with your custom domain

## Comparison: Netlify vs GitHub Pages

| Feature | Netlify | GitHub Pages |
|---------|---------|--------------|
| **Environment Variables** | Set in Netlify UI or CLI | Set as GitHub Secrets |
| **Deployment** | Automatic or manual via UI/CLI | Via GitHub Actions only |
| **Custom Domains** | Built-in, easy setup | Requires CNAME file |
| **HTTPS** | Automatic with Let's Encrypt | Automatic |
| **Preview Deployments** | Yes, for PRs | No |
| **Build Time** | Usually faster | Varies |
| **Cost** | Free tier available | Free for public repos |

## Migration from GitHub Pages to Netlify

If you're migrating from GitHub Pages:

1. Set up environment variables in Netlify (they were in GitHub Secrets)
2. Disable GitHub Pages deployment workflow or remove it
3. Update `VITE_BASE_PATH` from `/adopt-a-dog-uk/` to `/` if using root domain
4. Update any hardcoded URLs in your code
5. Rebuild and deploy

## Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Vite Environment Variables Guide](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase Documentation](https://supabase.com/docs)
- [Repository Setup Guide](./SETUP_AND_DEPLOYMENT.md)

## Support

If you encounter issues:

1. Check Netlify deploy logs: **Deploys → [Your deploy] → Deploy log**
2. Check browser console for client-side errors
3. Verify environment variables are set correctly
4. Review this guide and the troubleshooting section
5. Create an issue in the GitHub repository if problems persist
