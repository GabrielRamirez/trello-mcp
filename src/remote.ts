import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { loadEnvFile } from "./utils/env.js";
import { createServer } from "./server.js";

loadEnvFile();

if (!process.env.TRELLO_API_KEY || !process.env.TRELLO_TOKEN) {
  console.error("ERROR: Missing required environment variables.");
  console.error("  TRELLO_API_KEY: %s", process.env.TRELLO_API_KEY ? "set" : "MISSING");
  console.error("  TRELLO_TOKEN:   %s", process.env.TRELLO_TOKEN ? "set" : "MISSING");
  console.error("");
  console.error("Provide them via -e flags or --env-file:");
  console.error("  docker run -p 3333:3333 -e TRELLO_API_KEY=xxx -e TRELLO_TOKEN=xxx trello-mcp");
  process.exit(1);
}

const app = createMcpExpressApp({ host: "0.0.0.0" });
const transports: Record<string, StreamableHTTPServerTransport> = {};

app.post("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (sessionId && transports[sessionId]) {
    await transports[sessionId].handleRequest(req, res, req.body);
    return;
  }

  if (!sessionId && isInitializeRequest(req.body)) {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (id) => {
        transports[id] = transport;
        console.error(`Session initialized: ${id}`);
      },
    });

    transport.onclose = () => {
      if (transport.sessionId) {
        delete transports[transport.sessionId];
        console.error(`Session closed: ${transport.sessionId}`);
      }
    };

    const server = createServer();
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    return;
  }

  res.status(400).json({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Invalid session" },
    id: null,
  });
});

app.get("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string;
  if (sessionId && transports[sessionId]) {
    await transports[sessionId].handleRequest(req, res);
  } else {
    res.status(400).send("Invalid session");
  }
});

app.delete("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string;
  if (sessionId && transports[sessionId]) {
    await transports[sessionId].handleRequest(req, res);
  } else {
    res.status(400).send("Invalid session");
  }
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const port = parseInt(process.env.PORT || "3333", 10);
app.listen(port, "0.0.0.0", () => {
  console.error(`Trello MCP server listening on http://0.0.0.0:${port}/mcp`);
});

function shutdown() {
  console.error("Shutting down...");
  for (const transport of Object.values(transports)) {
    transport.close?.();
  }
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
