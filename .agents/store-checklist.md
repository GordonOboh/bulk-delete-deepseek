# Chrome Web Store Publishing Checklist

## Prerequisites
- [ ] Pay $5 one-time developer fee at https://chrome.google.com/webstore/devconsole
- [ ] Verify you have a Google account

## Package the Extension
```sh
bash scripts/package.sh
```
This creates `dist/deepseek-bulk-delete-v1.0.0.zip` — upload this to the store.

## Store Listing

### Icon
- [ ] 128x128 icon generated (`icon128.png`) — verify it looks correct
- [ ] If icon needs changes, run the Pillow script to regenerate

### Screenshots (required)
- [ ] 1280x800 or 640x400 PNG
- [ ] Take screenshots of chat.deepseek.com showing:
  1. Conversation list without extension
  2. Conversation list with checkboxes added
  3. Multiple conversations selected (Shift-click)
  4. Bulk delete in progress / completion state

### Description
```text
Bulk delete your DeepSeek chat conversations with one click. Add checkboxes to your conversation list, select the ones you want to remove (Shift-click for range selection), and delete them all at once.

Features:
- Add/Remove/Toggle checkboxes on conversation list
- Shift-click to select multiple conversations
- Adjustable deletion delay to avoid rate limiting
- Works entirely locally — no data collected or sent to any server
```

### Category
Productivity

### Privacy Policy
This extension does not collect, store, or transmit any user data. All operations run entirely within your browser on chat.deepseek.com. No network requests are made by this extension.

## Dashboard Steps
1. Go to https://chrome.google.com/webstore/devconsole
2. Click **New Item**
3. Upload the ZIP from `dist/deepseek-bulk-delete-v1.0.0.zip`
4. Fill in: name, description, screenshots, category, icon, privacy
5. Click **Submit for Review**

## After Submission
- Review typically takes a few hours to a few days
- You'll get an email when approved or if changes are needed
- Once published, users can install from the Chrome Web Store
