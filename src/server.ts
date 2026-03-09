import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TrelloClient } from "./trello-client.js";
import { register as registerBoards } from "./tools/boards.js";
import { register as registerCards } from "./tools/cards.js";
import { register as registerLists } from "./tools/lists.js";
import { register as registerSearch } from "./tools/search.js";
import { register as registerChecklists } from "./tools/checklists.js";

/**
 * Creates a fully configured MCP server instance with all Trello tools registered.
 * Used by both stdio (index.ts) and HTTP (remote.ts) entry points.
 */
export function createServer(): McpServer {
  const client = new TrelloClient();

  const server = new McpServer({
    name: "trello-mcp",
    version: "1.0.0",
  });

  registerBoards(server, client);
  registerCards(server, client);
  registerLists(server, client);
  registerSearch(server, client);
  registerChecklists(server, client);

  return server;
}
