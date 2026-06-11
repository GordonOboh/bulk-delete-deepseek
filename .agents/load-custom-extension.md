# How to Load Custom/Unpacked Chrome Extensions

## Method 1: Developer Mode (Standard)

1. **Open Extensions Page**
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`
   - Firefox: `about:debugging#/runtime/this-firefox`

2. **Enable Developer Mode**
   - Toggle switch in top-right corner

3. **Load Unpacked**
   - Click **"Load unpacked"** button (top-left)
   - Select the extension's **source folder** (must contain `manifest.json`)
   - Example: `/home/ocd/git_temp/bulk-delete-chatGPT/`

4. **Verify**
   - Extension appears in list
   - Icon shows in toolbar (puzzle piece → pin it)

## Method 2: Drag & Drop (Chrome/Edge)
- Drag the extension folder directly onto the extensions page

## Method 3: Firefox Temporary Add-on
- `about:debugging` → "This Firefox" → "Load Temporary Add-on"
- Select any file in the extension (e.g., `manifest.json`)
- **Note**: Temporary, disappears on browser restart

## For the ChatGPT Bulk Delete Extension

```bash
# 1. Clone the repo
git clone https://github.com/qcrao/bulk-delete-chatGPT.git
cd bulk-delete-chatGPT

# 2. Load the folder in chrome://extensions/
#    Select: bulk-delete-chatGPT/  (the folder with manifest.json)
```

## For Your Modified DeepSeek Version

```bash
# After modifying the forked code:
# Load: your-fork-folder/  (where manifest.json lives)
```

## Important Notes

| Requirement | Details |
|-------------|---------|
| **Manifest V3** | Required for Chrome Web Store; works locally |
| **Source folder** | Must contain `manifest.json` at root |
| **No build needed** | This extension uses plain JS, no bundler |
| **Updates** | Click refresh icon on extension card after code changes |
| **Permissions** | Grant when prompted (activeTab, scripting) |

## Troubleshooting

- **Not working?** Check DevTools Console (F12) on target site for errors
- **Selectors wrong?** Use Elements tab to inspect conversation DOM
- **Rate limited?** Increase delays in `config.js` → `UI_CONFIG.OPERATION_DELAY`