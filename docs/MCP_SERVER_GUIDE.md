# Dog Rescue MCP Server Guide

## What is MCP?

**Model Context Protocol (MCP)** is an open protocol developed by Anthropic that allows AI assistants (like ChatGPT, Claude, etc.) to securely connect to external data sources and tools. Think of it as a standardized way for AI to interact with your applications and databases.

### Key Concepts

- **MCP Server**: A program that exposes data and functionality through standardized tools
- **MCP Client**: The AI assistant (e.g., ChatGPT Desktop) that connects to the server
- **Tools**: Functions that the AI can call to retrieve or manipulate data
- **Transport**: How the client and server communicate (usually stdio or HTTP)

## Overview

The Dog Rescue MCP Server provides ChatGPT and other AI assistants with access to the UK dog rescue database. This allows users to:

1. **List all rescues** - Get information about all registered dog rescue organizations
2. **Find rescues nearby** - Search for rescues near a specific location using coordinates
3. **Get rescue details** - Retrieve detailed information about a specific rescue organization

## Prerequisites

Before setting up the MCP server, ensure you have:

1. **Node.js** (version 18 or higher) installed
2. **Supabase credentials** for the dog adopt database
3. **ChatGPT Desktop App** (for macOS) or compatible MCP client

## Installation

### 1. Install Dependencies

Navigate to the MCP server directory and install dependencies:

```bash
cd mcp-server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `mcp-server` directory with your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

You can also use the parent directory's `.env` file with the `VITE_` prefixed variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### 3. Build the Server

Compile the TypeScript code:

```bash
npm run build
```

This creates a `dist` directory with the compiled JavaScript.

## Configuration for ChatGPT Desktop

### For macOS ChatGPT Desktop App

1. **Locate the MCP configuration file**:
   ```bash
   ~/Library/Application Support/ChatGPT/mcp_config.json
   ```

2. **Edit or create the configuration file**:
   ```json
   {
     "mcpServers": {
       "dog-rescue": {
         "command": "node",
         "args": [
           "/absolute/path/to/dog-adopt/mcp-server/dist/index.js"
         ],
         "env": {
           "SUPABASE_URL": "https://your-project.supabase.co",
           "SUPABASE_ANON_KEY": "your-anon-key"
         }
       }
     }
   }
   ```

   **Important**: Replace `/absolute/path/to/dog-adopt` with the actual full path to your repository.

3. **Restart ChatGPT Desktop** - Close and reopen the application for changes to take effect.

### For Other MCP Clients

If you're using a different MCP client (like Claude Desktop or a custom implementation), consult its documentation for configuration. The general pattern is:

- **Command**: `node`
- **Args**: Path to `dist/index.js`
- **Environment**: Supabase credentials
- **Transport**: stdio (standard input/output)

## Available Tools

Once configured, the following tools are available to ChatGPT:

### 1. `list_rescues`

Lists all dog rescue organizations in the database.

**Parameters**:
- `limit` (optional): Maximum number of rescues to return (default: 50)

**Example usage in ChatGPT**:
```
"Can you list all the dog rescues in the database?"
```

### 2. `find_rescues_near`

Finds dog rescues near a specific location using latitude and longitude coordinates.

**Parameters**:
- `latitude` (required): Latitude of the search location
- `longitude` (required): Longitude of the search location
- `radius_km` (optional): Search radius in kilometers (default: 50)
- `limit` (optional): Maximum number of results (default: 10)

**Example usage in ChatGPT**:
```
"Find dog rescues near London" (ChatGPT will use London's coordinates)
"Find dog rescues within 20km of latitude 51.5074, longitude -0.1278"
```

### 3. `get_rescue_details`

Retrieves detailed information about a specific rescue organization.

**Parameters**:
- `rescue_id` (required): The UUID of the rescue organization

**Example usage in ChatGPT**:
```
"Tell me more about the rescue with ID abc123..."
```

## How It Works

### Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────┐
│  ChatGPT Desktop│ ◄─────► │  MCP Server      │ ◄─────► │  Supabase DB │
│     (Client)    │  stdio  │  (Node.js)       │   API   │  (PostgreSQL)│
└─────────────────┘         └──────────────────┘         └──────────────┘
```

1. **User Query**: You ask ChatGPT about dog rescues
2. **Tool Selection**: ChatGPT determines which MCP tool to use
3. **Server Execution**: The MCP server receives the request and queries Supabase
4. **Data Processing**: Server calculates distances, formats data
5. **Response**: Formatted data is returned to ChatGPT
6. **User Response**: ChatGPT presents the information in natural language

### Data Flow Example

When you ask "Find dog rescues near Manchester":

1. ChatGPT recognizes this as a location-based query
2. It calls the `find_rescues_near` tool with Manchester's coordinates
3. MCP server queries the `dogadopt_api.get_rescues()` function
4. Server calculates distances using the Haversine formula
5. Results are filtered by radius and sorted by distance
6. Formatted rescue information is returned to ChatGPT
7. ChatGPT presents the results in a conversational format

## Testing the Server

You can test the MCP server directly using the MCP Inspector tool:

```bash
# Install MCP Inspector globally
npm install -g @modelcontextprotocol/inspector

# Run the inspector
mcp-inspector node dist/index.js
```

This opens a web interface where you can:
- View available tools
- Test tool calls
- See request/response data
- Debug issues

## Troubleshooting

### Server Not Appearing in ChatGPT

1. **Check configuration path**: Ensure the path in `mcp_config.json` is absolute
2. **Verify build**: Make sure `npm run build` completed successfully
3. **Check logs**: Look for errors in ChatGPT's console logs
4. **Restart ChatGPT**: Always restart after configuration changes

### "Missing environment variables" Error

1. **Check .env file**: Ensure it exists in the `mcp-server` directory
2. **Verify credentials**: Confirm Supabase URL and key are correct
3. **Check config**: Ensure environment variables are set in `mcp_config.json`

### No Results Returned

1. **Database connection**: Verify Supabase credentials are valid
2. **Schema access**: Ensure the `dogadopt` schema is accessible with the anon key
3. **Data availability**: Check that rescues exist in the database
4. **Coordinates**: For location searches, verify rescues have latitude/longitude data

### TypeScript Compilation Errors

1. **Install dependencies**: Run `npm install` in the `mcp-server` directory
2. **Check Node version**: Ensure you're using Node.js 18 or higher
3. **Clean build**: Delete `dist` folder and rebuild

## Development

### Making Changes

1. Edit TypeScript files in `mcp-server/`
2. Rebuild: `npm run build`
3. Restart ChatGPT to pick up changes

### Adding New Tools

To add a new tool:

1. Add tool definition in `ListToolsRequestSchema` handler
2. Add tool implementation in `CallToolRequestSchema` handler
3. Update this documentation
4. Rebuild and test

### Hot Reload (Development)

For development with auto-rebuild:

```bash
# Terminal 1: Watch mode for TypeScript
npx tsc --watch

# Terminal 2: Test with MCP Inspector
mcp-inspector node dist/index.js
```

## Security Considerations

1. **API Keys**: Never commit `.env` files or expose API keys
2. **Anon Key**: The MCP server uses the Supabase anonymous key (safe for public use)
3. **RLS**: Database access is controlled by Row Level Security policies
4. **Read-Only**: The server only provides read access to rescue data
5. **Local Execution**: The MCP server runs locally on your machine

## Advanced Usage

### Custom MCP Client

You can create your own MCP client to use this server:

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'node',
  args: ['./mcp-server/dist/index.js'],
  env: {
    SUPABASE_URL: 'your-url',
    SUPABASE_ANON_KEY: 'your-key'
  }
});

const client = new Client({
  name: 'custom-client',
  version: '1.0.0'
}, {
  capabilities: {}
});

await client.connect(transport);

// List tools
const tools = await client.listTools();
console.log(tools);

// Call a tool
const result = await client.callTool({
  name: 'list_rescues',
  arguments: { limit: 5 }
});
console.log(result);
```

### Deploying as HTTP Server

While the current implementation uses stdio transport, you can modify it to use HTTP transport for remote access:

```typescript
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';

// Use HTTP transport instead of stdio
const transport = new SSEServerTransport('/mcp', response);
await server.connect(transport);
```

## Resources

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)
- [ChatGPT Desktop MCP Guide](https://platform.openai.com/docs/guides/mcp)
- [Supabase Documentation](https://supabase.com/docs)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs in ChatGPT console
3. Test with MCP Inspector for debugging
4. Create an issue in the repository

## License

This MCP server is part of the Adopt-a-Dog UK project and follows the same license.
