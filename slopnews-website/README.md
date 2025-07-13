# SlopNews Website

## MCP Server

This website includes an MCP server that allows AI assistants to browse and read news stories. The server is available at `https://slop247.com/mcp`.

### Configuration

To use the MCP server with an AI assistant, create a configuration file with this content:

```json
{
  "mcpServers": {
    "slopnews": {
      "url": "https://slop247.com/mcp",
      "headers": {
        "Content-Type": "application/json"
      }
    }
  }
}
```

### Setup Instructions

#### Claude Desktop
1. Open Claude Desktop
2. Go to Settings → Model Context Protocol
3. Click "Add Server"
4. Select "Import from file"
5. Choose your configuration file
6. The server will appear as "slopnews" in your MCP servers list

#### Other MCP Hosts
- Copy the configuration to your MCP host's configuration directory
- Restart your MCP host if required

### Available Resources

Once connected, AI assistants can access:

- **News Stories**: Browse stories with filtering by category, limit, and snippet options
- **Individual Stories**: Read specific stories by ID
- **Categories**: Get all available news categories
- **Related Stories**: Find stories similar to a given story
- **Gallery**: View stories with images

### Example Usage

AI assistants can ask questions like:
- "Show me the latest technology news"
- "What news categories do you have?"
- "Tell me about story ID 123"
- "What other stories are related to this one?"
- "Show me news with images"

### Testing

You can test the MCP server manually:

```bash
curl -X POST https://slop247.com/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "resources/list", "params": {}}'
```

## Website Features

- News browsing and reading
- Category filtering
- Related stories
- Image gallery
- REST API endpoints
- MCP server integration