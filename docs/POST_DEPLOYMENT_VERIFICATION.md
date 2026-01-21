# Post-Deployment Verification Checklist

This checklist should be completed after merging the MIME type fix PR to verify that the issue is resolved.

## 1. Deployment Verification (2-3 minutes)

### Check Workflow Completion
- [ ] Navigate to [GitHub Actions](https://github.com/dogadopt/dogadopt.github.io/actions)
- [ ] Verify "Deploy to GitHub Pages" workflow completed successfully
- [ ] Check that all jobs passed (CI, migrate, deploy)
- [ ] Note the deployment time (should be ~2 minutes)

### Verify Deployment Output
- [ ] Check that the workflow used `upload-pages-artifact@v3` (not v4)
- [ ] Verify no errors in the "Upload artifact" step
- [ ] Confirm "Deploy to GitHub Pages" step succeeded

## 2. Site Functionality Verification (5 minutes)

### Basic Loading
- [ ] Open https://www.dogadopt.co.uk in a new browser tab
- [ ] Page loads completely (no blank page)
- [ ] Content is visible (hero section, navigation, dog cards)
- [ ] Images load correctly

### Browser Console Check
Open DevTools (F12) → Console tab:
- [ ] No MIME type errors (should NOT see "application/octet-stream")
- [ ] No critical JavaScript errors
- [ ] React app loads successfully

### Network Tab Verification
Open DevTools (F12) → Network tab → Reload page (Ctrl+R):
- [ ] Find the main JavaScript file (e.g., `main-[hash].js`)
- [ ] Click on it and check Headers → Response Headers
- [ ] Verify `Content-Type: text/javascript; charset=utf-8` (NOT `application/octet-stream`)
- [ ] Verify `Content-Type: text/css; charset=utf-8` for CSS files

### Functionality Testing
- [ ] Navigate to different pages (Home, Rescues, About)
- [ ] Search functionality works
- [ ] Filters work (breed, size, location)
- [ ] Dog cards display correctly with images
- [ ] Rescue cards display correctly
- [ ] Links work correctly

## 3. Smoke Tests Verification (Automated)

### Manual Trigger (Optional)
If you want immediate verification:
1. [ ] Go to [Smoke Tests Workflow](https://github.com/dogadopt/dogadopt.github.io/actions/workflows/smoke-tests.yml)
2. [ ] Click "Run workflow" → "Run workflow" button
3. [ ] Wait ~3-5 minutes for completion
4. [ ] Verify all tests pass (7/7)

### Scheduled Run (Every 6 hours)
- [ ] Wait for next scheduled run (check schedule in smoke-tests.yml)
- [ ] Verify all 7 tests pass:
  - [ ] homepage loads successfully
  - [ ] site is responsive and accessible
  - [ ] key pages are accessible
  - [ ] no JavaScript errors on page load
  - [ ] site loads within acceptable time
  - [ ] homepage displays dogs available for adoption
  - [ ] rescues page displays rescue organizations

## 4. Smoke Test Results Analysis

### If All Tests Pass ✅
- [ ] Close the smoke test failure issue
- [ ] Document the fix in the issue before closing
- [ ] Add a comment with verification timestamps
- [ ] Mark the incident as resolved

### If Tests Still Fail ❌
1. [ ] Check the test output for specific errors
2. [ ] Compare error messages to the original issue
3. [ ] If MIME type errors persist:
   - Verify the workflow is using v3 of upload-pages-artifact
   - Check if there's a caching issue (wait 15-30 minutes)
   - Review deployment logs for any warnings
4. [ ] If different errors appear:
   - Document the new errors
   - Determine if they're related to the MIME type fix
   - Create a new issue if needed

## 5. Final Verification

### Browser Testing
Test in multiple browsers (if possible):
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)

All browsers should:
- Load the site correctly
- Show no console errors
- Display all content properly

### Mobile Verification (Optional)
- [ ] Test on mobile browser
- [ ] Verify responsive design works
- [ ] Check that touch interactions work

## 6. Documentation

### Update Issue
- [ ] Add comment to the smoke test failure issue
- [ ] Include verification results
- [ ] Attach screenshots of:
  - Successful deployment
  - Working site
  - Network tab showing correct MIME types
  - Passing smoke tests

### Communicate Results
- [ ] Notify team/stakeholders that the fix is deployed
- [ ] Share verification results
- [ ] Confirm site is fully operational

## Expected Timeline

| Step | Duration | When |
|------|----------|------|
| Merge PR | 1 minute | Now |
| Deployment | 2-3 minutes | Automatic |
| Site availability | Immediate | After deployment |
| CDN propagation | 0-15 minutes | Varies |
| Next scheduled smoke test | Up to 6 hours | Automatic |

## Troubleshooting

### If site still doesn't load properly:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Try incognito/private mode
4. Wait 15-30 minutes for CDN propagation
5. Check if custom domain DNS is configured correctly

### If MIME type error persists:
1. Verify workflow used v3 of upload-pages-artifact
2. Check GitHub Pages settings (should be from GitHub Actions)
3. Review artifact upload logs
4. Consider alternative deployment methods (see GITHUB_PAGES_MIME_TYPE_FIX.md)

## Success Criteria

The fix is considered successful when:
- ✅ Site loads completely without errors
- ✅ JavaScript files served with `text/javascript` MIME type
- ✅ All 7 smoke tests pass
- ✅ No MIME type errors in browser console
- ✅ React application renders correctly
- ✅ All functionality works as expected

Once all criteria are met, the incident can be closed as resolved.
