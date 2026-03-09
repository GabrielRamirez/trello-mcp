import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadEnvFile } from "./utils/env.js";
import { createServer } from "./server.js";

// Load .env file (won't overwrite existing env vars)
loadEnvFile();

const server = createServer();
const transport = new StdioServerTransport();
await server.connect(transport);

if (process.env.TRELLO_API_KEY && process.env.TRELLO_TOKEN) {
  console.error("Trello MCP server running on stdio (credentials configured)");
} else {
  console.error(
    "Trello MCP server running on stdio (credentials not yet configured — any tool call will show setup instructions)",
  );
}
