# Code Complexity Check

This project uses automated code complexity checking to maintain code quality and readability. The complexity check runs as part of the CI/CD pipeline and helps identify code that may be difficult to maintain or test.

## Overview

The complexity check workflow analyzes the codebase for:

- **Cyclomatic Complexity**: Measures the number of independent paths through code
- **Function Length**: Limits the number of lines per function
- **Nesting Depth**: Controls how deeply nested code blocks can be
- **Callback Nesting**: Limits nested callbacks to prevent "callback hell"

## Complexity Thresholds

The following thresholds are enforced:

| Metric | Threshold | Description |
|--------|-----------|-------------|
| **Cyclomatic Complexity** | 15 | Maximum complexity score per function |
| **Max Lines per Function** | 150 | Maximum lines (excluding comments/blanks) |
| **Max Nesting Depth** | 4 | Maximum levels of nested blocks |
| **Max Nested Callbacks** | 3 | Maximum levels of nested callbacks |

### Why These Thresholds?

- **Complexity ≤ 15**: Functions above 15 are considered "complex" and harder to test
- **Lines ≤ 150**: Functions exceeding 150 lines are difficult to understand at a glance
- **Depth ≤ 4**: Deep nesting makes code harder to follow and debug
- **Callbacks ≤ 3**: Prevents deeply nested callback patterns

## Workflow Triggers

The complexity check runs on:

- **Pull Requests**: Checks code before merging
- **Pushes to main**: Verifies main branch quality
- **Manual Trigger**: Can be run on-demand via workflow_dispatch

## Running Locally

### Run Full Complexity Check

```bash
npx eslint . \
  --rule 'complexity: ["error", { "max": 15 }]' \
  --rule 'max-depth: ["error", 4]' \
  --rule 'max-lines-per-function: ["error", { "max": 150, "skipBlankLines": true, "skipComments": true }]' \
  --rule 'max-nested-callbacks: ["error", 3]'
```

### Check Specific Files

```bash
npx eslint src/pages/Admin.tsx \
  --rule 'complexity: ["error", { "max": 15 }]' \
  --rule 'max-lines-per-function: ["error", { "max": 150, "skipBlankLines": true, "skipComments": true }]'
```

### Generate JSON Report

```bash
npx eslint . \
  --rule 'complexity: ["error", { "max": 15 }]' \
  --rule 'max-depth: ["error", 4]' \
  --rule 'max-lines-per-function: ["error", { "max": 150, "skipBlankLines": true, "skipComments": true }]' \
  --rule 'max-nested-callbacks: ["error", 3]' \
  --format json \
  --output-file complexity-report.json
```

## Workflow Behavior

### On Pull Requests

When complexity issues are detected in a PR:

1. ❌ The workflow fails
2. 💬 A comment is posted to the PR with details
3. 📊 A detailed report is uploaded as an artifact
4. 🚫 The PR cannot be merged until issues are resolved

The comment includes:

- Summary table of files with issues
- Detailed list of specific problems
- Guidelines for refactoring

### On Main Branch

When complexity issues are detected on main:

1. ❌ The workflow fails
2. 🐛 An issue is created (or updated if one exists)
3. 📊 A detailed report is uploaded as an artifact
4. 🏷️ Tagged with `code-complexity` and `technical-debt` labels

## Refactoring Strategies

When you encounter complexity issues, consider these refactoring techniques:

### High Cyclomatic Complexity

**Problem**: Too many decision points (if/else, switch, loops)

**Solutions**:
- Extract complex conditions into separate functions
- Use early returns to reduce nesting
- Replace complex conditionals with lookup tables or strategy patterns
- Break large functions into smaller, focused functions

**Example**:

```typescript
// Before (complexity: 16)
function processUser(user) {
  if (user.isActive) {
    if (user.hasPermission) {
      if (user.role === 'admin') {
        // ... many more conditions
      }
    }
  }
}

// After (complexity: 8)
function processUser(user) {
  if (!user.isActive) return;
  if (!user.hasPermission) return;
  
  processUserByRole(user);
}

function processUserByRole(user) {
  const handlers = {
    admin: handleAdmin,
    user: handleUser,
    guest: handleGuest
  };
  
  handlers[user.role]?.(user);
}
```

### Long Functions

**Problem**: Function exceeds 150 lines

**Solutions**:
- Extract logical sections into separate functions
- Use custom hooks for React components
- Move data transformation logic to utility functions
- Split UI components into smaller sub-components

**Example**:

```typescript
// Before (200 lines)
function AdminPanel() {
  // ... tons of state, effects, handlers, JSX
}

// After
function AdminPanel() {
  const dogData = useDogManagement();
  const rescueData = useRescueManagement();
  
  return (
    <>
      <DogSection {...dogData} />
      <RescueSection {...rescueData} />
    </>
  );
}
```

### Deep Nesting

**Problem**: Code nested more than 4 levels deep

**Solutions**:
- Use early returns/continues to reduce nesting
- Extract nested blocks into separate functions
- Use guard clauses at the beginning of functions
- Flatten promise chains with async/await

**Example**:

```typescript
// Before (depth: 5)
if (user) {
  if (user.isActive) {
    if (user.hasAccess) {
      if (resource) {
        if (resource.isAvailable) {
          // do something
        }
      }
    }
  }
}

// After (depth: 2)
if (!user?.isActive) return;
if (!user.hasAccess) return;
if (!resource?.isAvailable) return;

// do something
```

### Nested Callbacks

**Problem**: Callbacks nested more than 3 levels deep

**Solutions**:
- Convert to async/await
- Use Promise.all() for parallel operations
- Extract callback logic into named functions
- Use utility functions like Promise.then() chains

**Example**:

```typescript
// Before (nested: 4)
fetchUser(id, (user) => {
  fetchPosts(user.id, (posts) => {
    fetchComments(posts[0].id, (comments) => {
      updateUI(comments);
    });
  });
});

// After (nested: 1)
async function loadUserData(id) {
  const user = await fetchUser(id);
  const posts = await fetchPosts(user.id);
  const comments = await fetchComments(posts[0].id);
  updateUI(comments);
}
```

## Viewing Reports

### In GitHub Actions

1. Navigate to the failed workflow run
2. Scroll to the "Artifacts" section at the bottom
3. Download the `complexity-report` artifact
4. Extract and open `complexity-report.json`

### Analyzing the JSON Report

The report contains an array of file objects:

```json
[
  {
    "filePath": "/path/to/file.ts",
    "errorCount": 2,
    "warningCount": 1,
    "messages": [
      {
        "ruleId": "complexity",
        "severity": 2,
        "message": "Function 'myFunction' has a complexity of 20. Maximum allowed is 15",
        "line": 42,
        "column": 1
      }
    ]
  }
]
```

## Exemptions and Configuration

### Temporary Exemptions

If you need to temporarily bypass complexity checks for a specific function:

```typescript
/* eslint-disable complexity */
function legacyFunction() {
  // Complex legacy code
}
/* eslint-enable complexity */
```

**Note**: Use exemptions sparingly and document why they're needed.

### Adjusting Thresholds

If the team decides to adjust thresholds, edit `.github/workflows/complexity-check.yml`:

```yaml
--rule 'complexity: ["error", { "max": 20 }]'  # Changed from 15 to 20
```

**Note**: Raising thresholds should be a team decision and documented in a PR.

## Best Practices

1. ✅ **Check before committing**: Run complexity checks locally
2. ✅ **Address issues early**: Fix complexity in the PR that introduces it
3. ✅ **Refactor incrementally**: Break large refactorings into smaller PRs
4. ✅ **Test after refactoring**: Ensure behavior hasn't changed
5. ✅ **Document complex logic**: Add comments explaining why complexity is necessary
6. ❌ **Avoid blanket exemptions**: Don't disable rules for entire files
7. ❌ **Don't ignore warnings**: Treat them as future errors

## Integration with Other Checks

The complexity check complements:

- **Linting** (ESLint): Catches style and potential bugs
- **Type Checking** (TypeScript): Ensures type safety
- **Testing**: Complex code is harder to test
- **Code Review**: Reviewers focus on logic, not complexity metrics

## Troubleshooting

### False Positives

If you believe a complexity warning is a false positive:

1. Review the code to ensure it can't be simplified
2. Document why the complexity is necessary
3. Add an exemption comment with explanation
4. Discuss with the team if threshold adjustment is needed

### Build Failures

If the complexity check is failing:

1. Run the check locally to see the exact issues
2. Review the detailed report artifact from GitHub Actions
3. Refactor the problematic code using strategies above
4. Test your changes thoroughly
5. Re-run the check to verify issues are resolved

## Resources

- [Cyclomatic Complexity](https://en.wikipedia.org/wiki/Cyclomatic_complexity)
- [ESLint Complexity Rules](https://eslint.org/docs/latest/rules/complexity)
- [Refactoring Techniques](https://refactoring.guru/refactoring/techniques)
- [Clean Code Principles](https://www.oreilly.com/library/view/clean-code-a/9780136083238/)

## Monitoring

Track complexity trends over time:

1. Check the `code-complexity` label in Issues
2. Review complexity report artifacts from recent runs
3. Monitor the number of exemptions in the codebase
4. Discuss complexity metrics in retrospectives
