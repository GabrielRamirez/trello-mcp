import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";
import { TrelloClient } from "../trello-client.js";
import { textResult, errorResult } from "../utils/response.js";
import type { TrelloChecklist, TrelloCheckItem } from "../types.js";

export function register(server: McpServer, client: TrelloClient) {
  server.registerTool(
    "create_checklist",
    {
      title: "Create Checklist",
      description: "Create a new checklist on a Trello card.",
      inputSchema: z.object({
        cardId: z.string().describe("The ID of the card"),
        name: z.string().describe("Name of the checklist"),
      }),
    },
    async ({ cardId, name }) => {
      try {
        const checklist = await client.post<TrelloChecklist>(
          `/cards/${cardId}/checklists`,
          { name },
        );
        return textResult(checklist);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  server.registerTool(
    "add_checklist_item",
    {
      title: "Add Checklist Item",
      description: "Add an item to an existing checklist.",
      inputSchema: z.object({
        checklistId: z.string().describe("The ID of the checklist"),
        name: z.string().describe("Name/text of the checklist item"),
        checked: z
          .boolean()
          .optional()
          .describe("Whether the item starts checked (default: false)"),
        pos: z
          .union([z.enum(["top", "bottom"]), z.number()])
          .optional()
          .describe("Position of the item"),
      }),
    },
    async ({ checklistId, name, checked, pos }) => {
      try {
        const params: Record<string, string> = { name };
        if (checked !== undefined) params.checked = String(checked);
        if (pos !== undefined) params.pos = String(pos);
        const item = await client.post<TrelloCheckItem>(
          `/checklists/${checklistId}/checkItems`,
          params,
        );
        return textResult(item);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  server.registerTool(
    "update_checklist_item",
    {
      title: "Update Checklist Item",
      description:
        "Update a checklist item (toggle complete/incomplete, rename, or reposition).",
      inputSchema: z.object({
        cardId: z.string().describe("The ID of the card containing the checklist"),
        checkItemId: z.string().describe("The ID of the check item"),
        state: z
          .enum(["complete", "incomplete"])
          .optional()
          .describe("Set item state"),
        name: z.string().optional().describe("New name for the item"),
        pos: z
          .union([z.enum(["top", "bottom"]), z.number()])
          .optional()
          .describe("New position"),
      }),
    },
    async ({ cardId, checkItemId, state, name, pos }) => {
      try {
        const params: Record<string, string> = {};
        if (state) params.state = state;
        if (name !== undefined) params.name = name;
        if (pos !== undefined) params.pos = String(pos);
        const item = await client.put<TrelloCheckItem>(
          `/cards/${cardId}/checkItem/${checkItemId}`,
          params,
        );
        return textResult(item);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
