import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";
import { TrelloClient } from "../trello-client.js";
import { textResult, handleToolError } from "../utils/response.js";
import type {
  TrelloMember,
  TrelloCard,
  TrelloBoard,
  TrelloOrganization,
  TrelloNotification,
} from "../types.js";

export function register(server: McpServer, client: TrelloClient) {
  server.registerTool(
    "get_member",
    {
      title: "Get Member",
      description:
        "Get information about a Trello member by ID or username. Use 'me' for the authenticated user.",
      inputSchema: z.object({
        memberId: z
          .string()
          .describe("The ID or username of the member (use 'me' for yourself)"),
      }),
    },
    async ({ memberId }) => {
      try {
        const member = await client.get<TrelloMember>(
          `/members/${memberId}`,
          { fields: "id,fullName,username,avatarUrl" },
        );
        return textResult(member);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "get_member_cards",
    {
      title: "Get Member Cards",
      description:
        "Get all cards assigned to a member. Use 'me' for the authenticated user.",
      inputSchema: z.object({
        memberId: z
          .string()
          .describe("The ID or username of the member (use 'me' for yourself)"),
        filter: z
          .enum(["all", "open", "closed", "visible"])
          .optional()
          .describe("Filter cards (default: visible)"),
      }),
    },
    async ({ memberId, filter }) => {
      try {
        const params: Record<string, string> = {
          fields:
            "id,name,desc,closed,url,idList,idBoard,due,dueComplete,labels,idMembers,pos,shortUrl",
        };
        if (filter) params.filter = filter;
        const cards = await client.get<TrelloCard[]>(
          `/members/${memberId}/cards`,
          params,
        );
        return textResult(cards);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "get_member_boards",
    {
      title: "Get Member Boards",
      description:
        "Get all boards a member belongs to. Use 'me' for the authenticated user.",
      inputSchema: z.object({
        memberId: z
          .string()
          .describe("The ID or username of the member (use 'me' for yourself)"),
        filter: z
          .enum(["all", "open", "closed", "members", "organization", "public", "starred"])
          .optional()
          .describe("Filter boards (default: all)"),
      }),
    },
    async ({ memberId, filter }) => {
      try {
        const params: Record<string, string> = {
          fields: "id,name,desc,url,closed",
        };
        if (filter) params.filter = filter;
        const boards = await client.get<TrelloBoard[]>(
          `/members/${memberId}/boards`,
          params,
        );
        return textResult(boards);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "get_member_organizations",
    {
      title: "Get Member Organizations",
      description:
        "Get all organizations (workspaces) a member belongs to. Use 'me' for the authenticated user.",
      inputSchema: z.object({
        memberId: z
          .string()
          .describe("The ID or username of the member (use 'me' for yourself)"),
      }),
    },
    async ({ memberId }) => {
      try {
        const orgs = await client.get<TrelloOrganization[]>(
          `/members/${memberId}/organizations`,
          { fields: "id,name,displayName,desc,url,website" },
        );
        return textResult(orgs);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "get_notifications",
    {
      title: "Get Notifications",
      description:
        "Get notifications for the authenticated user.",
      inputSchema: z.object({
        readFilter: z
          .enum(["all", "read", "unread"])
          .optional()
          .describe("Filter by read status (default: all)"),
        limit: z
          .number()
          .optional()
          .describe("Max number of notifications (default: 50, max: 1000)"),
      }),
    },
    async ({ readFilter, limit }) => {
      try {
        const params: Record<string, string> = {
          fields: "id,type,date,unread,data,memberCreator",
          member_fields: "fullName,username",
        };
        if (readFilter) params.read_filter = readFilter;
        if (limit !== undefined) params.limit = String(limit);
        const notifications = await client.get<TrelloNotification[]>(
          "/members/me/notifications",
          params,
        );
        return textResult(notifications);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "mark_all_notifications_read",
    {
      title: "Mark All Notifications Read",
      description: "Mark all notifications as read for the authenticated user.",
      inputSchema: z.object({}),
    },
    async () => {
      try {
        await client.post("/notifications/all/read");
        return textResult({ success: true });
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "search_members",
    {
      title: "Search Members",
      description: "Search for Trello members by name, username, or email.",
      inputSchema: z.object({
        query: z.string().describe("Search query (name, username, or email)"),
        limit: z
          .number()
          .optional()
          .describe("Max results to return (default: 8)"),
        boardId: z
          .string()
          .optional()
          .describe("Limit search to members of this board"),
        organizationId: z
          .string()
          .optional()
          .describe("Limit search to members of this organization"),
      }),
    },
    async ({ query, limit, boardId, organizationId }) => {
      try {
        const params: Record<string, string> = { query };
        if (limit !== undefined) params.limit = String(limit);
        if (boardId) params.idBoard = boardId;
        if (organizationId) params.idOrganization = organizationId;
        const members = await client.get<TrelloMember[]>(
          "/search/members",
          params,
        );
        return textResult(members);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );
}
