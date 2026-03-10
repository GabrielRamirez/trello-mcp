import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";
import { TrelloClient } from "../trello-client.js";
import { textResult, handleToolError } from "../utils/response.js";
import type { TrelloWebhook } from "../types.js";

export function register(server: McpServer, client: TrelloClient) {
  server.registerTool(
    "create_webhook",
    {
      title: "Create Webhook",
      description:
        "Create a webhook to receive notifications when a Trello model changes. The callback URL must be publicly accessible and respond to HEAD requests.",
      inputSchema: z.object({
        idModel: z
          .string()
          .describe("The ID of the model to watch (board, list, card, member, etc.)"),
        callbackURL: z.string().describe("The URL to receive webhook POST callbacks"),
        description: z
          .string()
          .optional()
          .describe("Description of the webhook"),
        active: z
          .boolean()
          .optional()
          .describe("Whether the webhook is active (default: true)"),
      }),
    },
    async ({ idModel, callbackURL, description, active }) => {
      try {
        const params: Record<string, string> = { idModel, callbackURL };
        if (description) params.description = description;
        if (active !== undefined) params.active = String(active);
        const webhook = await client.post<TrelloWebhook>(
          "/webhooks",
          params,
        );
        return textResult(webhook);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "get_webhook",
    {
      title: "Get Webhook",
      description: "Get details of a webhook by ID.",
      inputSchema: z.object({
        webhookId: z.string().describe("The ID of the webhook"),
      }),
    },
    async ({ webhookId }) => {
      try {
        const webhook = await client.get<TrelloWebhook>(
          `/webhooks/${webhookId}`,
        );
        return textResult(webhook);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "update_webhook",
    {
      title: "Update Webhook",
      description: "Update a webhook's callback URL, description, model, or active status.",
      inputSchema: z.object({
        webhookId: z.string().describe("The ID of the webhook"),
        callbackURL: z.string().optional().describe("New callback URL"),
        description: z.string().optional().describe("New description"),
        idModel: z.string().optional().describe("New model ID to watch"),
        active: z.boolean().optional().describe("Whether the webhook is active"),
      }),
    },
    async ({ webhookId, callbackURL, description, idModel, active }) => {
      try {
        const params: Record<string, string> = {};
        if (callbackURL !== undefined) params.callbackURL = callbackURL;
        if (description !== undefined) params.description = description;
        if (idModel !== undefined) params.idModel = idModel;
        if (active !== undefined) params.active = String(active);
        const webhook = await client.put<TrelloWebhook>(
          `/webhooks/${webhookId}`,
          params,
        );
        return textResult(webhook);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "delete_webhook",
    {
      title: "Delete Webhook",
      description: "Delete a webhook.",
      inputSchema: z.object({
        webhookId: z.string().describe("The ID of the webhook to delete"),
      }),
    },
    async ({ webhookId }) => {
      try {
        await client.delete(`/webhooks/${webhookId}`);
        return textResult({ deleted: true, webhookId });
      } catch (err) {
        return handleToolError(err);
      }
    },
  );
}
