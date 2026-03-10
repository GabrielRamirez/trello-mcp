import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";
import { TrelloClient } from "../trello-client.js";
import { textResult, handleToolError } from "../utils/response.js";
import type { TrelloCustomField, TrelloCustomFieldOption } from "../types.js";

export function register(server: McpServer, client: TrelloClient) {
  server.registerTool(
    "create_custom_field",
    {
      title: "Create Custom Field",
      description:
        "Create a new custom field definition on a board. Requires Trello Premium or Enterprise.",
      inputSchema: z.object({
        idModel: z.string().describe("The ID of the board"),
        name: z.string().describe("Name of the custom field"),
        type: z
          .enum(["checkbox", "date", "list", "number", "text"])
          .describe("Type of the custom field"),
        pos: z
          .union([z.enum(["top", "bottom"]), z.number()])
          .optional()
          .describe("Position of the field"),
      }),
    },
    async ({ idModel, name, type, pos }) => {
      try {
        const body: Record<string, unknown> = {
          idModel,
          modelType: "board",
          name,
          type,
          pos: pos ?? "bottom",
        };
        const field = await client.post<TrelloCustomField>(
          "/customFields",
          undefined,
          body,
        );
        return textResult(field);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "get_custom_field",
    {
      title: "Get Custom Field",
      description:
        "Get a custom field definition by ID. Requires Trello Premium or Enterprise.",
      inputSchema: z.object({
        customFieldId: z.string().describe("The ID of the custom field"),
      }),
    },
    async ({ customFieldId }) => {
      try {
        const field = await client.get<TrelloCustomField>(
          `/customFields/${customFieldId}`,
        );
        return textResult(field);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "delete_custom_field",
    {
      title: "Delete Custom Field",
      description:
        "Delete a custom field definition and all its values from every card. Requires Trello Premium or Enterprise.",
      inputSchema: z.object({
        customFieldId: z.string().describe("The ID of the custom field to delete"),
      }),
    },
    async ({ customFieldId }) => {
      try {
        await client.delete(`/customFields/${customFieldId}`);
        return textResult({ deleted: true, customFieldId });
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "get_custom_field_options",
    {
      title: "Get Custom Field Options",
      description:
        "Get the dropdown options for a list-type custom field. Requires Trello Premium or Enterprise.",
      inputSchema: z.object({
        customFieldId: z.string().describe("The ID of the custom field (must be type 'list')"),
      }),
    },
    async ({ customFieldId }) => {
      try {
        const options = await client.get<TrelloCustomFieldOption[]>(
          `/customFields/${customFieldId}/options`,
        );
        return textResult(options);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );
}
