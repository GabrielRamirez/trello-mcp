const SETUP_GUIDE = `Trello API credentials are not configured.

To set up your Trello MCP server:

1. Get your API key:
   Visit https://trello.com/power-ups/admin
   Click "New" (or select an existing Power-Up) and copy your API key.

2. Generate a token:
   Open this URL in your browser (replace YOUR_API_KEY):
   https://trello.com/1/authorize?expiration=never&scope=read,write&response_type=token&key=YOUR_API_KEY
   Click "Allow" and copy the token.

3. Configure credentials (pick one method):

   Option A — Environment variables in the MCP command:
     claude mcp add trello -e TRELLO_API_KEY=your_key -e TRELLO_TOKEN=your_token -- npx tsx src/index.ts

   Option B — Create a .env file in the project directory:
     TRELLO_API_KEY=your_key
     TRELLO_TOKEN=your_token

   Option C — Export in your shell profile (~/.bashrc, ~/.zshrc):
     export TRELLO_API_KEY=your_key
     export TRELLO_TOKEN=your_token`;

export class TrelloConfigError extends Error {
  constructor() {
    super(SETUP_GUIDE);
    this.name = "TrelloConfigError";
  }
}

export class TrelloApiError extends Error {
  constructor(
    public status: number,
    public body: string,
    public path: string,
  ) {
    super(`Trello API error ${status} on ${path}: ${body}`);
    this.name = "TrelloApiError";
  }
}

export class TrelloClient {
  private baseUrl = "https://api.trello.com/1";

  private getCredentials(): { apiKey: string; token: string } {
    const apiKey = process.env.TRELLO_API_KEY;
    const token = process.env.TRELLO_TOKEN;
    if (!apiKey || !token) {
      throw new TrelloConfigError();
    }
    return { apiKey, token };
  }

  private buildUrl(path: string, params?: Record<string, string>): string {
    const { apiKey, token } = this.getCredentials();
    const url = new URL(`${this.baseUrl}${path}`);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("token", token);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, v);
      }
    }
    return url.toString();
  }

  private async request<T>(
    method: string,
    path: string,
    params?: Record<string, string>,
    body?: Record<string, unknown>,
  ): Promise<T> {
    const url = this.buildUrl(path, params);
    const options: RequestInit = {
      method,
      headers: { Accept: "application/json" },
    };
    if (body) {
      options.headers = {
        ...options.headers,
        "Content-Type": "application/json",
      };
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const text = await response.text();

    if (!response.ok) {
      throw new TrelloApiError(response.status, text, path);
    }

    return text ? JSON.parse(text) : (undefined as T);
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>("GET", path, params);
  }

  async post<T>(
    path: string,
    params?: Record<string, string>,
    body?: Record<string, unknown>,
  ): Promise<T> {
    return this.request<T>("POST", path, params, body);
  }

  async put<T>(
    path: string,
    params?: Record<string, string>,
    body?: Record<string, unknown>,
  ): Promise<T> {
    return this.request<T>("PUT", path, params, body);
  }

  async delete<T>(path: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>("DELETE", path, params);
  }
}
