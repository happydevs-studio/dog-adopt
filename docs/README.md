# Documentation Index

Concise, organized documentation for the Adopt-a-Dog UK project.

## 🚀 Getting Started

- **[Main README](../README.md)** - Project overview and quick start
- **[Setup and Deployment](SETUP_AND_DEPLOYMENT.md)** - CI/CD pipeline, GitHub Pages, secrets configuration
- **[Authentication](AUTHENTICATION.md)** - User authentication and admin access

## 🏗️ Development

### Core Features
- **[Breed Features](BREED_FEATURES.md)** - Multi-breed support and autocomplete
- **[Dog Age Improvements](DOG_AGE_IMPROVEMENTS.md)** - Birth date tracking
- **[Combobox Refactoring](COMBOBOX_REFACTORING.md)** - Reusable UI components

### Architecture
- **[Database API Layer](DATABASE_API_LAYER.md)** - Two-layer architecture and security patterns
- **[Audit System](AUDIT_SYSTEM.md)** - Complete audit logging for dogs, rescues, and locations
- **[Code Quality](CODE_QUALITY.md)** - Complexity checks and Knip analysis

### Deployment
- **[Base Path Configuration](BASE_PATH_CONFIGURATION.md)** - Configurable deployment paths
- **[GitHub Pages SPA Fix](GITHUB_PAGES_SPA_FIX.md)** - SPA routing workaround

### Troubleshooting
- **[Smoke Test Troubleshooting](SMOKE_TEST_TROUBLESHOOTING.md)** - Production monitoring

## 📊 Data Management

- **[Rescue Contact Collection](RESCUE_CONTACT_COLLECTION.md)** - Charity Commission API integration

## 🔍 Quick Reference

**Local development:**
```bash
task setup              # Full setup
npm run dev             # Start server
```

**Add admin user:**
```bash
./scripts/make-admin.sh user@email.com
```

**Deploy:**
1. Configure secrets (see [Setup and Deployment](SETUP_AND_DEPLOYMENT.md))
2. Push to main branch

**Collect rescue contacts:**
```bash
npm run collect-contacts
```

## 📁 Archive

Historical fixes and completed tasks: [archive/](archive/)

## 📝 Contributing to Documentation

When adding new documentation:

1. **Create the file** in the `docs/` directory with a descriptive name
2. **Use clear markdown** with proper headings and code examples
3. **Add to this index** under the appropriate category
4. **Cross-reference** related documentation when helpful
5. **Keep it current** - update docs when features change

## 🆘 Need Help?

- Check if there's documentation for your topic in the categories above
- Search the docs directory for keywords: `grep -r "search term" docs/`
- Review the [Main README](../README.md) for general project information
- Check [Setup and Deployment](SETUP_AND_DEPLOYMENT.md) for deployment issues
- See [Smoke Test Troubleshooting](SMOKE_TEST_TROUBLESHOOTING.md) for production site issues

## 📋 Documentation Standards

All documentation in this directory follows these standards:

- **Clear headings** - Use markdown headings (##, ###) for structure
- **Code examples** - Include working code snippets with syntax highlighting
- **Prerequisites** - List requirements at the start
- **Step-by-step** - Use numbered lists for procedures
- **Troubleshooting** - Include common issues and solutions
- **Links** - Cross-reference related documentation
- **Current** - Keep documentation up-to-date with code changes
