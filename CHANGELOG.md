# Changelog

## [Unreleased]

### Improved

- **Dramatically reduced API response sizes** — All GET/list endpoints now use Trello's `fields` parameter to request only essential fields, reducing token usage by ~80% (e.g., `list_boards` dropped from ~14.5k tokens to ~1-2k). Affected tools:
  - `list_boards` — returns `id, name, desc, url, closed`
  - `get_board` — returns `id, name, desc, url, closed, idOrganization, shortUrl`
  - `get_board_lists` — returns `id, name, closed, pos, idBoard`
  - `get_board_cards` — returns `id, name, desc, closed, url, idList, due, dueComplete, labels, idMembers, pos, shortUrl`
  - `get_card` — returns core card fields plus checklists (`id, name, pos`) and members (`fullName, username`)
  - `get_list` (cards) — returns same card fields as `get_board_cards`
  - `search` — scoped `card_fields` and `board_fields` to essential fields
