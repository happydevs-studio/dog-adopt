# GitHub Pages MIME Type Fix

## Problem

The smoke tests were failing with the following error:

```
Failed to load module script: Expected a JavaScript-or-Wasm module script 
but the server responded with a MIME type of "application/octet-stream".
```

This caused the React application to fail to load, resulting in:
- Empty/hidden body element
- No visible navigation or content
- All smoke tests failing

## Root Cause

The issue was caused by the `actions/upload-pages-artifact@v4` action, which introduced changes to how files are packaged and uploaded. These changes can cause GitHub Pages to serve JavaScript module files with incorrect MIME types (`application/octet-stream` instead of `text/javascript` or `application/javascript`).

This is a known issue when deploying Vite-built single-page applications to GitHub Pages using the v4 upload action.

## Solution

### 1. Downgrade upload-pages-artifact to v3

Changed the deployment workflow to use `actions/upload-pages-artifact@v3` instead of v4:

```yaml
- name: Upload artifact
  uses: actions/upload-pages-artifact@v3  # Changed from v4 to v3
  with:
    path: './dist'
```

### 2. Add .gitattributes

Created a `.gitattributes` file to ensure proper handling of text files:

```gitattributes
* text=auto

# JavaScript files
*.js text eol=lf
*.mjs text eol=lf
*.ts text eol=lf
*.tsx text eol=lf

# CSS files
*.css text eol=lf

# HTML files
*.html text eol=lf
```

This ensures that:
- Text files are normalized with LF line endings
- Binary files are correctly identified
- Git doesn't mangle JavaScript module files

### 3. Ensure CNAME is in public folder

Moved the `CNAME` file to the `public/` folder so it gets automatically copied to the dist folder during the Vite build process.

### 4. Keep .nojekyll file

Ensured the `.nojekyll` file remains in the `public/` folder to prevent GitHub Pages from processing files with Jekyll.

## Verification

After deployment, the following should be verified:

1. **Module Loading**: Check browser console for any MIME type errors
2. **Smoke Tests**: All smoke tests should pass
3. **Site Functionality**: The React app should load and render correctly
4. **MIME Types**: JavaScript files should be served with `text/javascript` or `application/javascript` MIME type

## Alternative Solutions

If the v3 upload action doesn't work or becomes deprecated, other options include:

1. **Use a different deployment method**: Deploy directly to the `gh-pages` branch
2. **Add a build step**: Process files before upload to ensure correct MIME types
3. **Wait for GitHub to fix**: Monitor for updates to the v4 actions

## References

- [GitHub Pages deployment with actions](https://github.com/actions/deploy-pages)
- [Vite static deployment guide](https://vitejs.dev/guide/static-deploy.html)
- [GitHub Pages MIME type issues](https://github.com/actions/upload-pages-artifact/issues)

## Related Files

- `.github/workflows/deploy.yml` - Deployment workflow
- `.gitattributes` - Text file handling configuration
- `public/.nojekyll` - Prevents Jekyll processing
- `public/CNAME` - Custom domain configuration
- `tests/smoke/site.spec.ts` - Smoke tests that verify the fix
