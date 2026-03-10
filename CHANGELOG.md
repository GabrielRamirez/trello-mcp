# Changelog

## [Unreleased]

### Added

- **Boards** (+3): `get_board_custom_fields`, `add_board_member`, `remove_board_member`; plus from v1.1.0: `update_board` (with background support), `delete_board`, `get_board_actions`
- **Cards** (+3): `update_comment`, `delete_comment`, `update_custom_field_item`; plus from v1.1.0: `unarchive_card`, `get_card_actions`, `list_attachments`, `add_attachment`, `delete_attachment`, `get_card_custom_fields`
- **Lists** (+2): `archive_all_cards`, `move_list_to_board`; plus from v1.1.0: `unarchive_list`, `move_all_cards`
- **Checklists** (from v1.1.0): `get_checklist`, `update_checklist`, `delete_checklist`, `delete_checklist_item`
- **Labels** (new module): `get_label`, `update_label`, `delete_label`
- **Members** (expanded): `get_member`, `get_member_cards`, `get_member_boards`, `get_member_organizations`, `get_notifications`, `mark_all_notifications_read`, `search_members`
- **Custom Fields** (new module): `create_custom_field`, `get_custom_field`, `delete_custom_field`, `get_custom_field_options`
- **Organizations** (new module): `get_organization`, `get_organization_members`, `get_organization_boards`, `create_organization`, `update_organization`
- **Webhooks** (new module): `create_webhook`, `get_webhook`, `update_webhook`, `delete_webhook`
- **`create_label` tool** — Create new labels on a board with a name and color
- **Graceful error handling** — 403 errors now return friendly messages about Trello plan requirements instead of raw API errors

### Improved

- **Dramatically reduced API response sizes** — All GET/list endpoints now use Trello's `fields` parameter to request only essential fields, reducing token usage by ~80% (e.g., `list_boards` dropped from ~14.5k tokens to ~1-2k). Affected tools:
  - `list_boards` — returns `id, name, desc, url, closed`
  - `get_board` — returns `id, name, desc, url, closed, idOrganization, shortUrl`
  - `get_board_lists` — returns `id, name, closed, pos, idBoard`
  - `get_board_cards` — returns `id, name, desc, closed, url, idList, due, dueComplete, labels, idMembers, pos, shortUrl`
  - `get_card` — returns core card fields plus checklists (`id, name, pos`) and members (`fullName, username`)
  - `get_list` (cards) — returns same card fields as `get_board_cards`
  - `search` — scoped `card_fields` and `board_fields` to essential fields
