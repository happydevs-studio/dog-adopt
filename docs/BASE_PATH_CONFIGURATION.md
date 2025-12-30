# Base Path Configuration

## Overview

The application base path is now controlled via the `VITE_BASE_PATH` environment variable, making it easy to switch between subdirectory and root domain deployments.

## Problem Solved

Previously, the application was hardcoded to use `/adopt-a-dog-uk/` as the base path in production builds. This caused 404 errors when accessing assets and made it difficult to migrate to a root domain deployment.

## Solution

The base path is now configurable via the `VITE_BASE_PATH` environment variable:

- **Current deployment:** `/adopt-a-dog-uk/` (GitHub Pages subdirectory)
- **Future deployment:** `/` (root domain at www.dogadopt.co.uk)

## Configuration

### Local Development

1. Edit your `.env` file:
   ```bash
   VITE_BASE_PATH="/adopt-a-dog-uk/"  # or "/" for root domain testing
   ```

2. The default value (if not set) is `/` for convenience in local development.

### Production Deployment (GitHub Actions)

1. Add the `VITE_BASE_PATH` secret in GitHub repository settings:
   - Go to **Settings → Secrets and variables → Actions**
   - Click **New repository secret**
   - Name: `VITE_BASE_PATH`
   - Value: `/adopt-a-dog-uk/` (current) or `/` (future)

2. The GitHub Actions workflow automatically uses this secret during the build process.

## Migration to Root Domain

When ready to deploy to the root domain (www.dogadopt.co.uk):

1. Update the GitHub secret `VITE_BASE_PATH` from `/adopt-a-dog-uk/` to `/`
2. Trigger a new deployment (push to main or manual workflow dispatch)
3. No code changes required!

## Technical Details

### Files Modified

- **vite.config.ts**: Uses `loadEnv()` to read `VITE_BASE_PATH` and applies it as the base path
- **.env.example**: Documents the new environment variable
- **.github/workflows/deploy.yml**: Passes the secret to the build process
- **src/App.tsx**: Already uses `basename={import.meta.env.BASE_URL}` for React Router

### How It Works

1. Vite reads `VITE_BASE_PATH` from environment variables during build
2. Sets the `base` configuration option (default: `/`)
3. Vite automatically prefixes all asset URLs with the base path
4. React Router's `basename` uses `import.meta.env.BASE_URL` (set by Vite)
5. All routing and asset loading works correctly regardless of deployment path

## Testing

### Test Current Configuration (Subdirectory)
```bash
npm run build
cat dist/index.html | grep "src="
# Should show: src="/adopt-a-dog-uk/assets/..."
```

### Test Root Domain Configuration
```bash
VITE_BASE_PATH="/" npm run build
cat dist/index.html | grep "src="
# Should show: src="/assets/..."
```

## Benefits

✅ **Easy migration**: Change one environment variable, no code changes  
✅ **Clear documentation**: Environment variable is explicitly documented  
✅ **Safe default**: Defaults to `/` for local development  
✅ **Centralized configuration**: Single source of truth for base path  
✅ **No 404 errors**: Assets load correctly with proper path prefix  

## See Also

- [CI/CD Setup](./CI_CD_SETUP.md) - Complete deployment pipeline documentation
- [GitHub Secrets Setup](./GITHUB_SECRETS_SETUP.md) - How to configure all secrets
