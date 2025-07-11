# Chrono X Chroma - Chrome Extension

A Chrome extension that color-codes posts on X.com (formerly Twitter) based on their age, making it easy to see how recent each post is at a glance.

## Features

- **Color-coded posts** based on age:
  - 🟢 **Green**: Very Recent (< 5 minutes)
  - 🟡 **Yellow**: Recent (5 minutes - 1 hour)
  - 🟠 **Orange**: Moderate (1 - 6 hours)
  - 🔴 **Red**: Old (6 - 24 hours)
  - 🟣 **Purple**: Very Old (> 1 day)

- **Interactive legend** in the top-right corner
- **Automatic detection** of new posts (works with infinite scroll)
- **Hover effects** for enhanced visual feedback
- **Responsive design** that works on mobile and desktop

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension folder
5. The extension will now be active on X.com

## Usage

1. Visit [X.com](https://x.com) or [www.x.com](https://www.x.com)
2. Posts will automatically be color-coded based on their age
3. Use the legend in the top-right corner to understand the color scheme
4. Click the "−" button in the legend to collapse it, or "+" to expand it

## How It Works

The extension:
1. Scans the page for posts with `data-testid="tweet"`
2. Finds the `<time datetime="...">` element within each post
3. Calculates the age of the post based on the datetime attribute
4. Applies appropriate background colors and borders
5. Continuously monitors for new posts as you scroll

## Files

- `manifest.json` - Extension configuration
- `content.js` - Main logic for finding and color-coding posts
- `styles.css` - Styling for the legend and post effects
- `README.md` - This file

## Permissions

The extension only requires:
- `activeTab` permission to work on X.com pages
- No data collection or external network requests

## Browser Compatibility

- Chrome (Manifest V3)
- Should work on other Chromium-based browsers (Edge, Brave, etc.)

## Privacy

This extension:
- Only works on X.com domains
- Does not collect or transmit any data
- Processes everything locally in your browser
- Does not modify post content, only adds visual styling

## Troubleshooting

If the extension isn't working:
1. Make sure you're on x.com or www.x.com
2. Try refreshing the page
3. Check that the extension is enabled in `chrome://extensions/`
4. Look for any console errors in Developer Tools

## License

This project is open source and available under the MIT License. 