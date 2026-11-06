# React frontend

The interface calls the Java API only. It does not call Python directly, store submitted text beyond the current browser session, load third-party fonts, or open links. Set `VITE_API_BASE_URL` if the Java API is not at `http://localhost:8080`.

## Run locally

Use Node.js 20.19 or newer. From this directory:

```powershell
npm.cmd install
npm.cmd run dev
```

Open the local address printed by Vite. The Java API and Python service must also be running for analysis. To create a production bundle, run `npm.cmd run build`.

