# Technical Differences from qcrao/bulk-delete-chatGPT

## Namespace
- **Original**: `ChatGPTBulkDelete` / `window.ChatGPTBulkDelete`
- **Fork**: `DeepSeekBulkDelete` / `window.DeepSeekBulkDelete`
- All module registrations, log prefixes, and operation settings follow the new namespace.

## Removed Features

### Bulk Archive (paid feature)
- Removed `bulkArchiveConversations.js`, membership API calls, payment modal, ad container.
- The original extension required a paid membership (verified via `bulk-delete-chatgpt-worker.qcrao.com`) to use bulk archive.
- Removed `storageKey: "BulkDeleteChatGPT_isPaid"`, `MembershipManager`, all sponsor/donate UI elements.

### User Identity & Analytics
- Removed `background.js` user identity logic (`chrome.identity.getProfileUserInfo`, fallback UUID generation, `getUserInfo` message handler).
- Background script is now a trivial no-op.
- Removed `ChromeUtils.getUserInfo()` (stubbed to return `{id:'local', email:''}`).
- No analytics or remote API calls.

### Firefox Support
- Removed `manifest.firefox.json`.
- Removed original Firefox packaging scripts (`scripts/build-firefox.sh`, `scripts/package-extensions.sh`).
- Extension is Chrome/Chromium-only (MV3).
- Our `scripts/` now contains `package.sh` (Web Store ZIP) and `clean-original.sh` (upstream clean-up).

### Agent/Developer Docs
- Removed `AGENTS.md`, `CLAUDE.md`, `DAILY_WORKFLOW.md` (ChatGPT-specific development guidance).
- Removed `.agents/` and `.claude/` config directories.

### Promotional Assets
- Removed `assets/` (screenshot images of ChatGPT UI).
- Removed `README-CN.md`.

## Selectors (config.js)

### Conversations
| Purpose | Original (ChatGPT) | Fork (DeepSeek) |
|---|---|---|
| Sidebar container | `.dc04ec1d` | `._77cdc67` |
| Date-grouped section | `._03210fb` | `._3098d02` |
| Conversation link | `._83421f9` | `._546d736` |
| Title element | `.c08e6e93` | `.c08e6e93` (same hash) |
| Active conversation | `.b64fb9ae` | `.b64fb9ae` (same hash) |
| 3-dot button | (title.nextElementSibling) | `._2090548` |

### Context Menu
| Purpose | Original | Fork |
|---|---|---|
| Floating menu wrapper | `.ds-floating-position-wrapper` | `.ds-floating-position-wrapper` (same) |
| Menu option | `div[role="menuitem"]` | `.ds-dropdown-menu-option` (added as fallback) |
| Delete option | `.ds-dropdown-menu-option--error` | `.ds-dropdown-menu-option--error` (same) |
| Confirm button | `.ds-button--error` | `.ds-button--error` (same) |

### Multi-language Delete strings
- Kept the full set of internationalized "Delete" strings.
- Text-fallback strategy searches both `div[role="menuitem"]` and `.ds-dropdown-menu-option` elements.

## DOM Interaction

### 3-dot button discovery
- **Original**: `titleEl.nextElementSibling` (the 3-dot button was the direct next sibling).
- **Fork**: `titleEl.nextElementSibling.querySelector('div[role="button"]')` (the 3-dot button is nested inside a wrapper div `._254829d`).

### Click sequence
- **Original**: Used `dispatchHoverEvent` + `dispatchPointerDownEvent` + `.click()` for menu opening.
- **Fork**: Simplified to just `.click()` on the 3-dot button (DeepSeek uses standard click events, not pointer events).

### Checkbox exclusion
- **Fork**: Conversation click handler skips `[role="button"]` targets so clicking the 3-dot button doesn't inadvertently toggle the checkbox and trigger a React re-render that closes the menu.

### Delete button search scope
- **Fork**: `waitForDeleteButton` first searches for the floating menu wrapper (`.ds-floating-position-wrapper`) and scopes the delete button lookup inside it, rather than searching the full document.

## Conversation Discovery (domHandler.js)

- **Original**: Found sidebar → found chat list → queried conversations inside chat list.
- **Fork**: Queries all conversation links (`._546d736`) directly from the sidebar (DeepSeek uses multiple date-grouped `._3098d02` sections, e.g., Today, 30 Days).

## Configuration

### Storage key
- **Original**: `"BulkDeleteChatGPT_delaySettings"`
- **Fork**: `"DeepSeekBulkDelete_delaySettings"` (isolates settings)

### Popup UI
- **Original**: Had Bulk Archive button (locked behind payment), ad banner, sponsor link, donation button, modal for payment flow.
- **Fork**: Only has Add/Remove/Toggle Checkboxes and Bulk Delete buttons + settings panel. All monetization removed.

## Dependencies
- Both are zero-dependency Manifest V3 extensions — no build step required.
- Fork retains the same file loading order via `manifest.json` content_scripts array.

## Utility Scripts (`scripts/`)

| Script | Purpose |
|---|---|
| `package.sh` | Creates a ZIP (`dist/deepseek-bulk-delete-v1.0.0.zip`) for Chrome Web Store upload |
| `clean-original.sh` | Removes files inherited from upstream ChatGPT repo (exempts `package.sh` and `agent/*`) |

