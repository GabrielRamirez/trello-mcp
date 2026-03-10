import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";
import { TrelloClient } from "../trello-client.js";
import { textResult, handleToolError } from "../utils/response.js";
import type {
  TrelloBoard,
  TrelloList,
  TrelloCard,
  TrelloLabel,
  TrelloMember,
  TrelloAction,
  TrelloCustomField,
} from "../types.js";

export function register(server: McpServer, client: TrelloClient) {
  server.registerTool(
    "list_boards",
    {
      title: "List Boards",
      description:
        "List all Trello boards for the authenticated user. Returns board id, name, description, URL, and closed status.",
      inputSchema: z.object({
        filter: z
          .enum(["all", "open", "closed", "members", "organization", "public", "starred"])
          .optional()
          .describe("Filter boards by status (default: all)"),
      }),
    },
    async ({ filter }) => {
      try {
        const params: Record<string, string> = {
          fields: "id,name,desc,url,closed",
        };
        if (filter) params.filter = filter;
        const boards = await client.get<TrelloBoard[]>(
          "/members/me/boards",
          params,
        );
        return textResult(boards);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "get_board",
    {
      title: "Get Board",
      description:
        "Get detailed information about a specific Trello board by its ID.",
      inputSchema: z.object({
        boardId: z.string().describe("The ID of the board"),
      }),
    },
    async ({ boardId }) => {
      try {
        const board = await client.get<TrelloBoard>(`/boards/${boardId}`, {
          fields: "id,name,desc,url,closed,idOrganization,shortUrl",
        });
        return textResult(board);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "get_board_lists",
    {
      title: "Get Board Lists",
      description: "Get all lists on a Trello board.",
      inputSchema: z.object({
        boardId: z.string().describe("The ID of the board"),
        filter: z
          .enum(["all", "open", "closed"])
          .optional()
          .describe("Filter lists (default: open)"),
      }),
    },
    async ({ boardId, filter }) => {
      try {
        const params: Record<string, string> = {
          fields: "id,name,closed,pos,idBoard",
        };
        if (filter) params.filter = filter;
        const lists = await client.get<TrelloList[]>(
          `/boards/${boardId}/lists`,
          params,
        );
        return textResult(lists);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "get_board_cards",
    {
      title: "Get Board Cards",
      description: "Get all cards on a Trello board.",
      inputSchema: z.object({
        boardId: z.string().describe("The ID of the board"),
        filter: z
          .enum(["all", "open", "closed", "visible"])
          .optional()
          .describe("Filter cards (default: visible)"),
      }),
    },
    async ({ boardId, filter }) => {
      try {
        const params: Record<string, string> = {
          fields: "id,name,desc,closed,url,idList,due,dueComplete,labels,idMembers,pos,shortUrl",
        };
        if (filter) params.filter = filter;
        const cards = await client.get<TrelloCard[]>(
          `/boards/${boardId}/cards`,
          params,
        );
        return textResult(cards);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "get_board_labels",
    {
      title: "Get Board Labels",
      description: "Get all labels defined on a Trello board.",
      inputSchema: z.object({
        boardId: z.string().describe("The ID of the board"),
      }),
    },
    async ({ boardId }) => {
      try {
        const labels = await client.get<TrelloLabel[]>(
          `/boards/${boardId}/labels`,
        );
        return textResult(labels);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "get_board_members",
    {
      title: "Get Board Members",
      description: "Get all members of a Trello board.",
      inputSchema: z.object({
        boardId: z.string().describe("The ID of the board"),
      }),
    },
    async ({ boardId }) => {
      try {
        const members = await client.get<TrelloMember[]>(
          `/boards/${boardId}/members`,
        );
        return textResult(members);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "create_board",
    {
      title: "Create Board",
      description: "Create a new Trello board.",
      inputSchema: z.object({
        name: z.string().describe("Name of the new board"),
        desc: z.string().optional().describe("Description for the board"),
        defaultLists: z
          .boolean()
          .optional()
          .describe("Create default lists (To Do, Doing, Done). Default: true"),
      }),
    },
    async ({ name, desc, defaultLists }) => {
      try {
        const params: Record<string, string> = { name };
        if (desc) params.desc = desc;
        if (defaultLists !== undefined)
          params.defaultLists = String(defaultLists);
        const board = await client.post<TrelloBoard>("/boards", params);
        return textResult(board);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "create_label",
    {
      title: "Create Label",
      description: "Create a new label on a Trello board.",
      inputSchema: z.object({
        boardId: z.string().describe("The ID of the board"),
        name: z.string().describe("Name of the label"),
        color: z
          .enum([
            "yellow", "purple", "blue", "red", "green", "orange",
            "black", "sky", "pink", "lime",
          ])
          .describe("Color of the label"),
      }),
    },
    async ({ boardId, name, color }) => {
      try {
        const label = await client.post<TrelloLabel>(
          `/boards/${boardId}/labels`,
          { name, color },
        );
        return textResult(label);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "update_board",
    {
      title: "Update Board",
      description:
        "Update a board's name, description, closed status, or background color.",
      inputSchema: z.object({
        boardId: z.string().describe("The ID of the board"),
        name: z.string().optional().describe("New name for the board"),
        desc: z.string().optional().describe("New description"),
        closed: z.boolean().optional().describe("Whether the board is closed (archived)"),
        background: z
          .string()
          .optional()
          .describe(
            "Board background — a color name (blue, orange, green, red, purple, pink, lime, sky, grey) or a custom background image ID",
          ),
      }),
    },
    async ({ boardId, name, desc, closed, background }) => {
      try {
        const params: Record<string, string> = {};
        if (name !== undefined) params.name = name;
        if (desc !== undefined) params.desc = desc;
        if (closed !== undefined) params.closed = String(closed);
        if (background !== undefined) params["prefs/background"] = background;
        const board = await client.put<TrelloBoard>(
          `/boards/${boardId}`,
          params,
        );
        return textResult(board);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "delete_board",
    {
      title: "Delete Board",
      description:
        "Permanently delete a Trello board. WARNING: This is irreversible — all lists, cards, and data on the board will be lost.",
      inputSchema: z.object({
        boardId: z.string().describe("The ID of the board to permanently delete"),
      }),
    },
    async ({ boardId }) => {
      try {
        await client.delete(`/boards/${boardId}`);
        return textResult({ deleted: true, boardId });
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "get_board_actions",
    {
      title: "Get Board Actions",
      description: "Get the activity feed (actions) for a board.",
      inputSchema: z.object({
        boardId: z.string().describe("The ID of the board"),
        filter: z
          .string()
          .optional()
          .describe("Comma-separated action types to filter (e.g. commentCard,updateCard)"),
        limit: z
          .number()
          .optional()
          .describe("Max number of actions to return (default: 50, max: 1000)"),
      }),
    },
    async ({ boardId, filter, limit }) => {
      try {
        const params: Record<string, string> = {
          fields: "id,type,date,data,memberCreator",
          member_fields: "fullName,username",
        };
        if (filter) params.filter = filter;
        if (limit !== undefined) params.limit = String(limit);
        const actions = await client.get<TrelloAction[]>(
          `/boards/${boardId}/actions`,
          params,
        );
        return textResult(actions);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "get_board_custom_fields",
    {
      title: "Get Board Custom Fields",
      description:
        "Get all custom field definitions on a board. Requires Trello Premium or Enterprise.",
      inputSchema: z.object({
        boardId: z.string().describe("The ID of the board"),
      }),
    },
    async ({ boardId }) => {
      try {
        const fields = await client.get<TrelloCustomField[]>(
          `/boards/${boardId}/customFields`,
        );
        return textResult(fields);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "add_board_member",
    {
      title: "Add Board Member",
      description: "Add a member to a board with a specified role.",
      inputSchema: z.object({
        boardId: z.string().describe("The ID of the board"),
        memberId: z.string().describe("The ID of the member to add"),
        type: z
          .enum(["admin", "normal", "observer"])
          .optional()
          .describe("Member role on the board (default: normal)"),
      }),
    },
    async ({ boardId, memberId, type }) => {
      try {
        const params: Record<string, string> = { type: type ?? "normal" };
        const member = await client.put<TrelloMember>(
          `/boards/${boardId}/members/${memberId}`,
          params,
        );
        return textResult(member);
      } catch (err) {
        return handleToolError(err);
      }
    },
  );

  server.registerTool(
    "remove_board_member",
    {
      title: "Remove Board Member",
      description: "Remove a member from a board.",
      inputSchema: z.object({
        boardId: z.string().describe("The ID of the board"),
        memberId: z.string().describe("The ID of the member to remove"),
      }),
    },
    async ({ boardId, memberId }) => {
      try {
        await client.delete(`/boards/${boardId}/members/${memberId}`);
        return textResult({ success: true, boardId, memberId });
      } catch (err) {
        return handleToolError(err);
      }
    },
  );
}
