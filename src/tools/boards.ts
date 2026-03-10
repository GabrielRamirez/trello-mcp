import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";
import { TrelloClient } from "../trello-client.js";
import { textResult, errorResult } from "../utils/response.js";
import type {
  TrelloBoard,
  TrelloList,
  TrelloCard,
  TrelloLabel,
  TrelloMember,
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
        return errorResult(err instanceof Error ? err.message : String(err));
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
        return errorResult(err instanceof Error ? err.message : String(err));
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
        return errorResult(err instanceof Error ? err.message : String(err));
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
        return errorResult(err instanceof Error ? err.message : String(err));
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
        return errorResult(err instanceof Error ? err.message : String(err));
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
        return errorResult(err instanceof Error ? err.message : String(err));
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
        return errorResult(err instanceof Error ? err.message : String(err));
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
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
