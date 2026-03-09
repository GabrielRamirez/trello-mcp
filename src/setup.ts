import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline";
import { exec } from "node:child_process";

const ENV_PATH = resolve(process.cwd(), ".env");

function readEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  if (!existsSync(ENV_PATH)) return env;
  const content = readFileSync(ENV_PATH, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function writeEnv(env: Record<string, string>): void {
  const lines = Object.entries(env).map(([k, v]) => `${k}=${v}`);
  writeFileSync(ENV_PATH, lines.join("\n") + "\n", "utf-8");
}

function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function openBrowser(url: string): void {
  const cmd =
    process.platform === "win32"
      ? `start "" "${url}"`
      : process.platform === "darwin"
        ? `open "${url}"`
        : `xdg-open "${url}"`;
  exec(cmd, (err) => {
    if (err) {
      console.log("\nCould not open browser automatically.");
      console.log("Open this URL manually:\n");
      console.log(`  ${url}\n`);
    }
  });
}

async function setup() {
  console.log("\n  Trello MCP Server - Setup\n");
  console.log("  -------------------------\n");

  const env = readEnv();

  // Step 1: API Key
  let apiKey = env.TRELLO_API_KEY || "";
  if (apiKey) {
    console.log(`  API Key found: ${apiKey.slice(0, 8)}...`);
    const change = await prompt("  Use this key? (Y/n): ");
    if (change.toLowerCase() === "n") {
      apiKey = "";
    }
  }

  if (!apiKey) {
    console.log("\n  Get your API key at: https://trello.com/power-ups/admin");
    console.log("  Click 'New' or select an existing Power-Up, then copy the API key.\n");
    apiKey = await prompt("  Paste your API Key: ");
    if (!apiKey) {
      console.log("\n  No API key provided. Exiting.\n");
      process.exit(1);
    }
  }

  env.TRELLO_API_KEY = apiKey;

  // Step 2: Token
  let token = env.TRELLO_TOKEN || "";
  if (token) {
    console.log(`\n  Token found: ${token.slice(0, 8)}...`);
    const change = await prompt("  Use this token? (Y/n): ");
    if (change.toLowerCase() !== "n") {
      writeEnv(env);
      console.log("\n  Setup complete. Run: claude mcp add trello -- npx tsx src/index.ts\n");
      process.exit(0);
    }
  }

  const authUrl = `https://trello.com/1/authorize?expiration=never&scope=read,write&response_type=token&key=${apiKey}&name=Trello+MCP+Server`;

  console.log("\n  Opening Trello authorization page in your browser...\n");
  openBrowser(authUrl);

  console.log("  1. Click 'Allow' in the browser window");
  console.log("  2. Copy the token shown on the page");
  console.log("  3. Paste it below\n");

  token = await prompt("  Paste your Token: ");
  if (!token) {
    console.log("\n  No token provided. Exiting.\n");
    process.exit(1);
  }

  env.TRELLO_TOKEN = token;

  // Save
  writeEnv(env);
  console.log("\n  Credentials saved to .env");
  console.log("\n  Next step — add to Claude Code:\n");
  console.log("    claude mcp add trello -- npx tsx src/index.ts\n");
}

setup();
