# Browser screenshot gallery

Captured from the local React app in a headless Chrome browser at a 1440 × 1200 viewport. Results and interactions use the live Java-to-Python services and fabricated sample content.

| State | Screenshot |
| --- | --- |
| Empty, ready-to-analyze screen | ![Empty state](01-empty-state.png) |
| Pending request with disabled button and progress note | ![Loading state](02-loading-state.png) |
| Single message findings and evidence | ![Message result](03-message-result.png) |
| All five checks completed with the legitimacy reminder | ![Completed checklist](04-checklist-complete.png) |
| Conversation timeline and storyline patterns | ![Conversation result](05-conversation-result.png) |
| URL text findings without visiting the destination | ![URL result](06-url-result.png) |
| Invalid URL validation feedback | ![Validation error](07-validation-error.png) |

## Repeat the browser check

Keep Python, Java, and Vite running, then start headless Chrome with a debugging endpoint in PowerShell (adjust the executable path if needed):

```powershell
Start-Process -FilePath 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList @('--headless=new', '--disable-gpu', '--remote-debugging-port=9222', '--remote-allow-origins=*', "--user-data-dir=$env:TEMP\redflagradar-chrome", 'about:blank') -WindowStyle Hidden
node .\tools\browser_demo_check.mjs
```

The script refreshes these captures and exits nonzero if a checked UI state fails.
