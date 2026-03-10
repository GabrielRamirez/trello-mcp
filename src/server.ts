import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TrelloClient } from "./trello-client.js";
import { register as registerBoards } from "./tools/boards.js";
import { register as registerCards } from "./tools/cards.js";
import { register as registerLists } from "./tools/lists.js";
import { register as registerSearch } from "./tools/search.js";
import { register as registerChecklists } from "./tools/checklists.js";
import { register as registerLabels } from "./tools/labels.js";
import { register as registerMembers } from "./tools/members.js";
import { register as registerCustomFields } from "./tools/customfields.js";
import { register as registerOrganizations } from "./tools/organizations.js";
import { register as registerWebhooks } from "./tools/webhooks.js";

/**
 * Creates a fully configured MCP server instance with all Trello tools registered.
 * Used by both stdio (index.ts) and HTTP (remote.ts) entry points.
 */
export function createServer(): McpServer {
  const client = new TrelloClient();

  const server = new McpServer({
    name: "trello-mcp",
    version: "1.2.0",
  });

  registerBoards(server, client);
  registerCards(server, client);
  registerLists(server, client);
  registerSearch(server, client);
  registerChecklists(server, client);
  registerLabels(server, client);
  registerMembers(server, client);
  registerCustomFields(server, client);
  registerOrganizations(server, client);
  registerWebhooks(server, client);

  return server;
}
