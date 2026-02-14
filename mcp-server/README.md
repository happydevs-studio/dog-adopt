# Dog Rescue MCP Server

Model Context Protocol (MCP) server that provides ChatGPT and other AI assistants with access to UK dog rescue organizations.

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment (see ../.env or create local .env)
cp ../.env .env

# Build the server
npm run build

# Test it works
npm start
```

## What Does This Do?

This MCP server allows AI assistants like ChatGPT to:
- List all dog rescue organizations in the UK
- Find rescues near a specific location
- Get detailed information about rescues

## Available Tools

### 1. `list_rescues`
Lists all dog rescue organizations.

### 2. `find_rescues_near` 
Finds rescues near coordinates (latitude, longitude) within a specified radius.

### 3. `get_rescue_details`
Gets detailed information about a specific rescue by ID.

## Configuration

### For ChatGPT Desktop (macOS)

Edit `~/Library/Application Support/ChatGPT/mcp_config.json`:

```json
{
  "mcpServers": {
    "dog-rescue": {
      "command": "node",
      "args": ["/absolute/path/to/dog-adopt/mcp-server/dist/index.js"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_ANON_KEY": "your-anon-key"
      }
    }
  }
}
```

## Development

```bash
# Build
npm run build

# Development mode (build + run)
npm run dev

# With auto-rebuild
npx tsc --watch
```

## Documentation

See [../docs/MCP_SERVER_GUIDE.md](../docs/MCP_SERVER_GUIDE.md) for complete documentation including:
- Detailed setup instructions
- How MCP works
- Troubleshooting guide
- Advanced usage examples

## Requirements

- Node.js 18+
- Valid Supabase credentials
- ChatGPT Desktop app or compatible MCP client

## Security

- Uses Supabase anonymous (public) key
- Read-only access to rescue data
- Runs locally on your machine
- Protected by Supabase Row Level Security (RLS) policies
