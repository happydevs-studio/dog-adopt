# Documentation Index

This directory contains comprehensive documentation for the Adopt-a-Dog UK project. Documentation is organized by category for easy navigation.

## 🚀 Getting Started

Start here if you're new to the project:

- **[Main README](../README.md)** - Project overview, quick start, and basic setup
- **[Authentication Setup](AUTHENTICATION.md)** - User authentication and admin access
- **[Post-Merge Setup](POST_MERGE_SETUP.md)** - Checklist for after merging PRs

## 🏗️ Development

Documentation for developers working on the codebase:

### Core Features
- **[Breed Features](BREED_FEATURES.md)** - Dog breed system with multi-breed support
- **[Dog Age Improvements](DOG_AGE_IMPROVEMENTS.md)** - Birth date tracking and age calculation
- **[Combobox Refactoring](COMBOBOX_REFACTORING.md)** - Reusable UI component patterns

### Database & Auditing
- **[Unified Dog Audit System](UNIFIED_DOG_AUDIT_SYSTEM.md)** - Complete audit logging for dogs
- **[Rescues & Locations Audit](RESCUES_LOCATIONS_AUDIT.md)** - Audit logging for rescue organizations

## 🚢 Deployment

Documentation for deploying and maintaining the application:

### CI/CD Pipeline
- **[CI/CD Setup](CI_CD_SETUP.md)** - Complete GitHub Actions workflow documentation
- **[GitHub Secrets Setup](GITHUB_SECRETS_SETUP.md)** - How to configure repository secrets
- **[GitHub Pages SPA Fix](GITHUB_PAGES_SPA_FIX.md)** - Handling SPA routing on GitHub Pages
- **[Base Path Configuration](BASE_PATH_CONFIGURATION.md)** - Configuring deployment paths

## 📊 Data Management

Documentation for managing rescue and dog data:

### Rescue Data Collection
- **[Rescue Contact Collection](RESCUE_CONTACT_COLLECTION.md)** - Collecting contact details via Charity Commission API (includes geocoding)
- **[Quick Start: API Collector](QUICK_START_API_COLLECTOR.md)** - Quick guide to running the contact collector

## 📚 Document Categories

### Setup & Configuration
Files that help you set up and configure the application:
- AUTHENTICATION.md
- POST_MERGE_SETUP.md
- GITHUB_SECRETS_SETUP.md
- BASE_PATH_CONFIGURATION.md

### Feature Documentation
Documentation about specific features and how they work:
- BREED_FEATURES.md
- DOG_AGE_IMPROVEMENTS.md
- COMBOBOX_REFACTORING.md

### Database & Architecture
Technical documentation about database structure and design:
- UNIFIED_DOG_AUDIT_SYSTEM.md
- RESCUES_LOCATIONS_AUDIT.md

### Deployment & Operations
Documentation for deploying and running the application:
- CI_CD_SETUP.md
- GITHUB_PAGES_SPA_FIX.md
- RESCUE_CONTACT_COLLECTION.md
- QUICK_START_API_COLLECTOR.md

## 🔍 Quick Reference

### Common Tasks

**Setting up local development:**
1. Follow [Main README](../README.md) setup instructions
2. Configure [Authentication](AUTHENTICATION.md)
3. Start developing!

**Adding a new admin user:**
```bash
./scripts/make-admin.sh user@email.com
```

**Deploying to production:**
1. Configure [GitHub Secrets](GITHUB_SECRETS_SETUP.md)
2. Follow [CI/CD Setup](CI_CD_SETUP.md)
3. Push to main branch - automatic deployment!

**Collecting rescue contact data:**
1. Follow [Quick Start API Collector](QUICK_START_API_COLLECTOR.md)
2. Or see full guide: [Rescue Contact Collection](RESCUE_CONTACT_COLLECTION.md)

**Understanding the audit system:**
1. Read [Unified Dog Audit System](UNIFIED_DOG_AUDIT_SYSTEM.md) for dogs
2. Read [Rescues & Locations Audit](RESCUES_LOCATIONS_AUDIT.md) for rescues

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
- Check [CI/CD Setup](CI_CD_SETUP.md) for deployment issues

## 📋 Documentation Standards

All documentation in this directory follows these standards:

- **Clear headings** - Use markdown headings (##, ###) for structure
- **Code examples** - Include working code snippets with syntax highlighting
- **Prerequisites** - List requirements at the start
- **Step-by-step** - Use numbered lists for procedures
- **Troubleshooting** - Include common issues and solutions
- **Links** - Cross-reference related documentation
- **Current** - Keep documentation up-to-date with code changes
