import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";
import { TrelloClient } from "../trello-client.js";
import { textResult, handleToolError } from "../utils/response.js";
import type { TrelloLabel } from "../types.js";

export function register(server: McpServer, client: TrelloClient) {
  server.registerTool(
    "get_label",
    {
      title: "Get Label",
      description: "Get a label by its ID.",
      inputSchema: z.object({
        labelId: z.string().describe("The ID of the label"),
      }),
    },
    async ({ labelId }) => {
      try {
        const label = await client.get<TrelloLabel>(`/labels/${labelId}`, {
          fields: "id,idBoard,name,color",
        });
        return textResult(label);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "update_label",
    {
      title: "Update Label",
      description: "Update a label's name or color.",
      inputSchema: z.object({
        labelId: z.string().describe("The ID of the label"),
        name: z.string().optional().describe("New name for the label"),
        color: z
          .enum([
            "yellow", "purple", "blue", "red", "green", "orange",
            "black", "sky", "pink", "lime",
          ])
          .nullable()
          .optional()
          .describe("New color (or null to remove color)"),
      }),
    },
    async ({ labelId, name, color }) => {
      try {
        const params: Record<string, string> = {};
        if (name !== undefined) params.name = name;
        if (color !== undefined) params.color = color ?? "";
        const label = await client.put<TrelloLabel>(
          `/labels/${labelId}`,
          params,
        );
        return textResult(label);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "delete_label",
    {
      title: "Delete Label",
      description: "Permanently delete a label from the board.",
      inputSchema: z.object({
        labelId: z.string().describe("The ID of the label to delete"),
      }),
    },
    async ({ labelId }) => {
      try {
        await client.delete(`/labels/${labelId}`);
        return textResult({ deleted: true, labelId });
      } catch (err) {
        return handleToolError(err);
      }
    },
  );
}
