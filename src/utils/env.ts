import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Loads a .env file into process.env without overwriting existing values.
 * Zero dependencies — just reads the file and parses KEY=VALUE lines.
 */
export function loadEnvFile(dir: string = process.cwd()): void {
  const envPath = resolve(dir, ".env");
  let content: string;
  try {
    content = readFileSync(envPath, "utf-8");
  } catch {
    return; // No .env file — that's fine
  }

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Don't overwrite existing env vars (explicit env takes priority)
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
