# Code Quality Tools

## Complexity Check

Automated code complexity checking maintains code quality and readability.

### Thresholds

| Metric | Threshold | Description |
|--------|-----------|-------------|
| **Cyclomatic Complexity** | 15 | Maximum complexity score per function |
| **Max Lines per Function** | 150 | Maximum lines (excluding comments/blanks) |
| **Max Nesting Depth** | 4 | Maximum levels of nested blocks |
| **Max Nested Callbacks** | 3 | Maximum levels of nested callbacks |

### Workflow Triggers

- Pull requests (checks before merging)
- Pushes to main (verifies main branch quality)
- Manual dispatch (on-demand)

### Running Locally

```bash
# Full check
npx eslint . \
  --rule 'complexity: ["error", { "max": 15 }]' \
  --rule 'max-depth: ["error", 4]' \
  --rule 'max-lines-per-function: ["error", { "max": 150, "skipBlankLines": true, "skipComments": true }]' \
  --rule 'max-nested-callbacks: ["error", 3]'

# Check specific files
npx eslint src/pages/Admin.tsx \
  --rule 'complexity: ["error", { "max": 15 }]'
```

### Refactoring Strategies

**High Complexity:**
- Extract complex conditions into separate functions
- Use early returns to reduce nesting
- Replace conditionals with lookup tables or strategy patterns

**Long Functions:**
- Extract logical sections into separate functions
- Use custom hooks for React components
- Split UI components into smaller sub-components

**Deep Nesting:**
- Use early returns/continues
- Extract nested blocks into separate functions
- Flatten promise chains with async/await

**Nested Callbacks:**
- Convert to async/await
- Use Promise.all() for parallel operations

### Workflow Behavior

**On Pull Requests:**
- Workflow fails if issues detected
- Comment posted to PR with details
- Report uploaded as artifact
- PR blocked until issues resolved

**On Main Branch:**
- Workflow fails if issues detected
- Issue created with labels `code-complexity` and `technical-debt`
- Report uploaded as artifact

## Knip Analysis

[knip.dev](https://knip.dev/) finds unused files, dependencies, and exports.

### Current Status

- ✅ Knip installed and configured
- ✅ NPM scripts added (`npm run knip`, `npm run knip:production`)
- ✅ GitHub Actions workflow active
- ✅ Documentation complete

### Running Knip

```bash
npm run knip              # Check all issues
npm run knip:production   # Check only production dependencies
```

### Typical Findings

**Unused Dependencies:**
- shadcn/ui component dependencies not yet used
- Can be safely removed and reinstalled later if needed

**Unused Files:**
- Auto-generated shadcn/ui components
- Can be regenerated with `npx shadcn-ui add <component>`

**Unused Exports:**
- Internal utilities or sub-components not used elsewhere
- Safe to remove after verification

### Integration with CI

Knip runs automatically in GitHub Actions to prevent accumulation of unused code.

### Notes

- shadcn/ui components are added incrementally - unused ones are common
- Always review findings before removing code
- Some "unused" items may be used dynamically or as part of public API

## Best Practices

1. ✅ Run checks locally before committing
2. ✅ Address issues in the PR that introduces them
3. ✅ Refactor incrementally in smaller PRs
4. ✅ Test after refactoring
5. ✅ Document complex logic when necessary
6. ❌ Don't use blanket exemptions
7. ❌ Don't ignore warnings
