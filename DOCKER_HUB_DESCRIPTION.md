# Trello MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server that connects [Trello](https://trello.com) to [Claude Code](https://docs.anthropic.com/en/docs/claude-code). Manage your boards, lists, cards, checklists, and more — all through natural language.

**26 tools** | **Zero config** | **Docker ready** | **Remote HTTP support**

## Quick Start

```bash
docker run -d -p 3333:3333 \
  -e TRELLO_API_KEY=your_key \
  -e TRELLO_TOKEN=your_token \
  --name trello-mcp \
  gabermz/trello-mcp
```

Then connect Claude Code:

```bash
claude mcp add --transport http trello http://localhost:3333/mcp
```

## Get Your Trello Credentials

1. Get your API key at [trello.com/power-ups/admin](https://trello.com/power-ups/admin)
2. Click the token link on that page to authorize and copy your token

## Verify It's Running

```bash
curl http://localhost:3333/health
# {"status":"ok"}
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TRELLO_API_KEY` | Yes | — | Your Trello API key |
| `TRELLO_TOKEN` | Yes | — | Your Trello authorization token |
| `PORT` | No | `3333` | HTTP server port |

## What Can It Do?

Once connected, just ask Claude in natural language:

- "List my Trello boards"
- "Create a card called Fix login bug in the To Do list"
- "Move that card to In Progress"
- "Add a checklist called QA Steps to that card"
- "Search for cards about authentication"
- "Archive all done cards"

## Tools (26 total)

- **Boards** (7): list, get, get lists/cards/labels/members, create
- **Cards** (11): get, create, update, move, archive, delete, comment, labels, members
- **Lists** (4): get, create, update, archive
- **Checklists** (3): create, add item, update item
- **Search** (1): full-text search with Trello operators

## Source Code

[GitHub](https://github.com/GabrielRamirez/trello-mcp)

## License

MIT
