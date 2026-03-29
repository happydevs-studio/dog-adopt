# Adopt-a-Dog UK

A web application to help people find and adopt rescue dogs across the UK. Browse available dogs, filter by breed, size, age, and location, and connect with rescue organizations.

## Features

- 🐕 Browse available dogs from rescue organizations across the UK
- 🔍 Advanced filtering (breed, size, age, location, compatibility)
- 📍 Location-based search with distance calculations
- 👥 Admin panel for managing dogs, rescues, and breeds
- 🔐 Secure authentication with Supabase
- 📊 Comprehensive audit logging system
- 🤖 **MCP Server** - AI assistant integration for ChatGPT

## Quick Start

### Prerequisites

- Node.js 18+ 
- Supabase account (for database)
- Docker (for local Supabase development)

### Setup

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Start local Supabase (optional for local development)
npm run supabase:start

# Start development server
npm run dev
```

Visit http://localhost:8080 to view the application.

### Full Setup with Task

```bash
# One-command setup (requires Task)
task setup

# Or quick start without Supabase
task quick-start
```

## AI Integration with MCP Server

The project includes a Model Context Protocol (MCP) server that allows AI assistants like ChatGPT to access rescue data.

### Quick MCP Server Setup

```bash
# Navigate to MCP server directory
cd mcp-server

# Install dependencies
npm install

# Build the server
npm run build

# Configure in ChatGPT Desktop (macOS)
# Edit: ~/Library/Application Support/ChatGPT/mcp_config.json
```

For complete setup instructions, see [MCP Server Guide](docs/MCP_SERVER_GUIDE.md).

### Available MCP Tools

- **list_rescues** - List all dog rescue organizations
- **find_rescues_near** - Find rescues near a location (with coordinates)
- **get_rescue_details** - Get detailed info about a specific rescue

## Documentation

- **[MCP Server Guide](docs/MCP_SERVER_GUIDE.md)** - Complete guide for AI integration
- **[Setup and Deployment](docs/SETUP_AND_DEPLOYMENT.md)** - CI/CD and deployment
- **[Authentication](docs/AUTHENTICATION.md)** - User authentication and admin access
- **[Database API Layer](docs/DATABASE_API_LAYER.md)** - Architecture and security
- **[All Documentation](docs/README.md)** - Complete documentation index

## Development

```bash
# Start development server
npm run dev

# Run type checking
npm run typecheck

# Run linter
npm run lint

# Build for production
npm run build

# Run smoke tests
npm run test:smoke
```

### Admin Access

```bash
# Promote user to admin
./scripts/make-admin.sh user@email.com
```

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **AI Integration**: Model Context Protocol (MCP)
- **Testing**: Playwright

## Project Structure

```
├── src/                    # React application source
│   ├── components/        # UI components
│   ├── hooks/            # React hooks
│   ├── integrations/     # Supabase integration
│   └── types/            # TypeScript types
├── mcp-server/            # MCP server for AI integration
│   ├── index.ts          # MCP server implementation
│   └── package.json      # MCP server dependencies
├── supabase/
│   └── migrations/       # Database migrations
├── docs/                  # Documentation
└── scripts/              # Utility scripts
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Check the [documentation](docs/README.md)
- Review existing issues
- Create a new issue with details
