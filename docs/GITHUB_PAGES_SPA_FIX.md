# GitHub Pages SPA Routing Fix

## Overview
This document explains how 404 errors are handled for Single Page Application (SPA) routing on GitHub Pages.

## Problem Statement
GitHub Pages serves static files. When a user navigates directly to a route like `/adopt-a-dog-uk/admin` or refreshes a non-root page, GitHub Pages looks for:
1. `/adopt-a-dog-uk/admin/index.html`, or
2. `/adopt-a-dog-uk/admin.html`

Since these files don't exist in an SPA, GitHub Pages returns a 404 error instead of serving the React application.

## Solution
We leverage GitHub Pages' built-in fallback behavior: when a requested file is not found, GitHub Pages automatically serves `404.html` instead of showing a generic 404 error page.

### Implementation
1. **Created `404.html`**: A copy of `index.html` at the project root
2. **Updated Vite Configuration**: Added both files as build inputs so they're processed with correct asset paths

```typescript
// vite.config.ts
build: {
  rollupOptions: {
    input: {
      main: path.resolve(__dirname, "index.html"),
      404: path.resolve(__dirname, "404.html"),
    },
  },
}
```

### How It Works
1. User navigates to `/adopt-a-dog-uk/admin`
2. GitHub Pages cannot find this file
3. GitHub Pages serves `/adopt-a-dog-uk/404.html` instead
4. `404.html` loads the React application with all correct asset paths
5. React Router (configured with `basename={import.meta.env.BASE_URL}`) sees the URL
6. React Router matches the route and renders the appropriate component
7. User sees the correct page without any 404 error

## Technical Details

### Vite Configuration
- **Development mode**: `BASE_URL = "/"` (local server root)
- **Production mode**: `BASE_URL = "/adopt-a-dog-uk/"` (GitHub Pages subdirectory)

Both `index.html` and `404.html` are processed by Vite during build, ensuring:
- Correct asset paths (e.g., `/adopt-a-dog-uk/assets/main-[hash].js`)
- Proper CSS injection
- Code splitting and optimization

### React Router Configuration
The `BrowserRouter` is configured with the dynamic base URL:
```typescript
<BrowserRouter basename={import.meta.env.BASE_URL}>
```

This ensures React Router knows about the base path and handles routing correctly in both development and production.

## Build Output
Both files are built with identical content:
```
dist/404.html     4.26 kB
dist/index.html   4.26 kB
```

## Verification
To verify the fix works:
1. Build the project: `npm run build`
2. Check both files exist: `ls -l dist/*.html`
3. Verify they're identical: `diff dist/404.html dist/index.html`
4. Deploy to GitHub Pages
5. Test direct navigation to routes like `/adopt-a-dog-uk/admin`

## Notes
- This is a standard solution for SPAs on GitHub Pages
- The `404.html` file must be at the root of the `dist` directory
- Both files must have the same content and correct base paths
- This approach works because GitHub Pages serves `404.html` for any missing file while preserving the URL in the browser

## References
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vite Multi-Page Configuration](https://vitejs.dev/guide/build.html#multi-page-app)
- [React Router Documentation](https://reactrouter.com/en/main/router-components/browser-router)
