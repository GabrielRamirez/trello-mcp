import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";
import { TrelloClient } from "../trello-client.js";
import { textResult, handleToolError } from "../utils/response.js";
import type { TrelloSearchResult } from "../types.js";

export function register(server: McpServer, client: TrelloClient) {
  server.registerTool(
    "search",
    {
      title: "Search Trello",
      description:
        "Search for boards and cards in Trello. Supports Trello search operators like @member, #label, list:name, is:open, is:archived, etc.",
      inputSchema: z.object({
        query: z.string().describe("Search query (supports Trello search operators)"),
        modelTypes: z
          .enum(["all", "cards", "boards"])
          .optional()
          .describe("Type of objects to search for (default: all)"),
        boardIds: z
          .array(z.string())
          .optional()
          .describe("Limit search to specific board IDs"),
        cardsLimit: z
          .number()
          .optional()
          .describe("Max number of cards to return (default: 10, max: 1000)"),
        boardsLimit: z
          .number()
          .optional()
          .describe("Max number of boards to return (default: 10)"),
        partial: z
          .boolean()
          .optional()
          .describe("Enable partial word matching (default: false)"),
      }),
    },
    async ({ query, modelTypes, boardIds, cardsLimit, boardsLimit, partial }) => {
      try {
        const params: Record<string, string> = {
          query,
          card_fields: "id,name,desc,closed,url,idList,idBoard,due,dueComplete,labels,idMembers,shortUrl",
          board_fields: "id,name,desc,url,closed",
        };
        if (modelTypes) params.modelTypes = modelTypes;
        if (boardIds?.length) params.idBoards = boardIds.join(",");
        if (cardsLimit !== undefined) params.cards_limit = String(cardsLimit);
        if (boardsLimit !== undefined) params.boards_limit = String(boardsLimit);
        if (partial !== undefined) params.partial = String(partial);
        const results = await client.get<TrelloSearchResult>("/search", params);
        return textResult(results);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );
}
