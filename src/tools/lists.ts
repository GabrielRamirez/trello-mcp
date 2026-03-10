import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";
import { TrelloClient } from "../trello-client.js";
import { textResult, errorResult } from "../utils/response.js";
import type { TrelloList, TrelloCard } from "../types.js";

export function register(server: McpServer, client: TrelloClient) {
  server.registerTool(
    "get_list",
    {
      title: "Get List",
      description:
        "Get a Trello list and its cards by list ID.",
      inputSchema: z.object({
        listId: z.string().describe("The ID of the list"),
      }),
    },
    async ({ listId }) => {
      try {
        const [list, cards] = await Promise.all([
          client.get<TrelloList>(`/lists/${listId}`, {
            fields: "id,name,closed,pos,idBoard",
          }),
          client.get<TrelloCard[]>(`/lists/${listId}/cards`, {
            fields: "id,name,desc,closed,url,idList,due,dueComplete,labels,idMembers,pos,shortUrl",
          }),
        ]);
        return textResult({ ...list, cards });
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  server.registerTool(
    "create_list",
    {
      title: "Create List",
      description: "Create a new list on a Trello board.",
      inputSchema: z.object({
        idBoard: z.string().describe("The ID of the board"),
        name: z.string().describe("Name of the list"),
        pos: z
          .union([z.enum(["top", "bottom"]), z.number()])
          .optional()
          .describe("Position: 'top', 'bottom', or a positive number"),
      }),
    },
    async ({ idBoard, name, pos }) => {
      try {
        const params: Record<string, string> = { idBoard, name };
        if (pos !== undefined) params.pos = String(pos);
        const list = await client.post<TrelloList>("/lists", params);
        return textResult(list);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  server.registerTool(
    "update_list",
    {
      title: "Update List",
      description: "Update a list's name or position.",
      inputSchema: z.object({
        listId: z.string().describe("The ID of the list"),
        name: z.string().optional().describe("New name for the list"),
        pos: z
          .union([z.enum(["top", "bottom"]), z.number()])
          .optional()
          .describe("New position"),
      }),
    },
    async ({ listId, name, pos }) => {
      try {
        const params: Record<string, string> = {};
        if (name !== undefined) params.name = name;
        if (pos !== undefined) params.pos = String(pos);
        const list = await client.put<TrelloList>(
          `/lists/${listId}`,
          params,
        );
        return textResult(list);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  server.registerTool(
    "archive_list",
    {
      title: "Archive List",
      description: "Archive (close) a Trello list.",
      inputSchema: z.object({
        listId: z.string().describe("The ID of the list to archive"),
      }),
    },
    async ({ listId }) => {
      try {
        const list = await client.put<TrelloList>(`/lists/${listId}`, {
          closed: "true",
        });
        return textResult(list);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
