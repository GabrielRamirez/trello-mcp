import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";
import { TrelloClient } from "../trello-client.js";
import { textResult, handleToolError } from "../utils/response.js";
import type { TrelloOrganization, TrelloMember, TrelloBoard } from "../types.js";

export function register(server: McpServer, client: TrelloClient) {
  server.registerTool(
    "get_organization",
    {
      title: "Get Organization",
      description: "Get details about a Trello organization (workspace) by ID or name.",
      inputSchema: z.object({
        orgId: z.string().describe("The ID or name of the organization"),
      }),
    },
    async ({ orgId }) => {
      try {
        const org = await client.get<TrelloOrganization>(
          `/organizations/${orgId}`,
          { fields: "id,name,displayName,desc,url,website" },
        );
        return textResult(org);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "get_organization_members",
    {
      title: "Get Organization Members",
      description: "Get all members of a Trello organization (workspace).",
      inputSchema: z.object({
        orgId: z.string().describe("The ID or name of the organization"),
      }),
    },
    async ({ orgId }) => {
      try {
        const members = await client.get<TrelloMember[]>(
          `/organizations/${orgId}/members`,
          { fields: "id,fullName,username,avatarUrl" },
        );
        return textResult(members);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "get_organization_boards",
    {
      title: "Get Organization Boards",
      description: "Get all boards in a Trello organization (workspace).",
      inputSchema: z.object({
        orgId: z.string().describe("The ID or name of the organization"),
        filter: z
          .enum(["all", "open", "closed", "members", "organization", "public"])
          .optional()
          .describe("Filter boards (default: all)"),
      }),
    },
    async ({ orgId, filter }) => {
      try {
        const params: Record<string, string> = {
          fields: "id,name,desc,url,closed",
        };
        if (filter) params.filter = filter;
        const boards = await client.get<TrelloBoard[]>(
          `/organizations/${orgId}/boards`,
          params,
        );
        return textResult(boards);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "create_organization",
    {
      title: "Create Organization",
      description: "Create a new Trello organization (workspace).",
      inputSchema: z.object({
        displayName: z.string().describe("Display name of the organization"),
        name: z
          .string()
          .optional()
          .describe("URL-friendly short name (auto-generated if omitted)"),
        desc: z.string().optional().describe("Description of the organization"),
        website: z.string().optional().describe("Website URL"),
      }),
    },
    async ({ displayName, name, desc, website }) => {
      try {
        const params: Record<string, string> = { displayName };
        if (name) params.name = name;
        if (desc) params.desc = desc;
        if (website) params.website = website;
        const org = await client.post<TrelloOrganization>(
          "/organizations",
          params,
        );
        return textResult(org);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "update_organization",
    {
      title: "Update Organization",
      description: "Update a Trello organization's (workspace) name, description, or website.",
      inputSchema: z.object({
        orgId: z.string().describe("The ID or name of the organization"),
        displayName: z.string().optional().describe("New display name"),
        name: z.string().optional().describe("New URL-friendly short name"),
        desc: z.string().optional().describe("New description"),
        website: z
          .string()
          .nullable()
          .optional()
          .describe("New website URL (or null to remove)"),
      }),
    },
    async ({ orgId, displayName, name, desc, website }) => {
      try {
        const params: Record<string, string> = {};
        if (displayName !== undefined) params.displayName = displayName;
        if (name !== undefined) params.name = name;
        if (desc !== undefined) params.desc = desc;
        if (website !== undefined) params.website = website ?? "";
        const org = await client.put<TrelloOrganization>(
          `/organizations/${orgId}`,
          params,
        );
        return textResult(org);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );
}
