# Setup and 3-minute demo plan

## Clean setup on Windows

Install Python 3.11+, Java 17, Apache Maven 3.9+, and Node.js 20.19+ (Node 24 is verified). Reopen PowerShell after installation so updated PATH entries take effect. If `python` opens the Microsoft Store alias, install Python from the official Windows installer with **Add python.exe to PATH** enabled, or use its full executable path. Do not select the embeddable package.

From the `RedFlagRadar` folder, open three terminals and run the following commands.

**Terminal 1 — Python service and tests**

```powershell
cd .\detection-service
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\.venv\Scripts\python.exe -m unittest discover -s ..\tests -v
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 — Java API and tests**

```powershell
cd .\backend
$env:DETECTION_SERVICE_URL = 'http://127.0.0.1:8000'
$env:FRONTEND_ORIGIN = 'http://localhost:5173'
mvn "-Dmaven.repo.local=$env:TEMP\redflagradar-m2\repository" test
mvn "-Dmaven.repo.local=$env:TEMP\redflagradar-m2\repository" spring-boot:run
```

**Terminal 3 — UI**

```powershell
cd .\frontend
npm install
npm run dev -- --host localhost
```

Open **http://localhost:5173**. Confirm `http://127.0.0.1:8000/health` and `http://localhost:8080/api/health` each return `{"status":"ok"}`. The first Maven test run downloads dependencies; a temporary Maven repository avoids OneDrive sync locks.

## Three-minute presentation

### 0:00–0:25 — The problem

“Scam messages often combine a believable story with pressure, unexpected payment, or a request for sensitive information. People need to see why something feels wrong and what to check next.”

### 0:25–0:45 — What the app does

“Red Flag Radar reviews one message, a conversation in order, or URL text. It returns explainable heuristic signals and a checklist. It does not open links, verify senders, or store submissions.”

### 0:45–1:25 — Single message

Choose **Analyze a message**, click **Try an example**, then analyze. Point to the score label, highlighted phrases, evidence explanations, and the distinction between a signal score and a probability.

### 1:25–2:05 — Conversation storyline

Choose **Analyze a conversation**, load its example, then analyze. Show the message timeline, where the payment request appears, and the increasing-urgency pattern. Explain that order adds context to otherwise ordinary lines.

### 2:05–2:35 — URL and verification checklist

Choose **URL pattern** and enter `http://192.0.2.1/login/verify`. Explain the HTTP and numeric-IP signals, and state clearly that the app has not visited the URL. Check a few verification items and point out that completion is only personal progress.

### 2:35–3:00 — Close and limitations

“The goal is to help someone pause, inspect evidence, and verify independently. A low score cannot prove safety, and a completed checklist cannot prove legitimacy. The current detector is a transparent rule-based prototype.”

## Recovery if a live service fails

- If the UI shows it cannot reach the API, confirm Python is running on port 8000 and Java on port 8080. Restart Java after setting `DETECTION_SERVICE_URL`.
- If the browser reports a cross-origin error, open the UI at `http://localhost:5173` and set `FRONTEND_ORIGIN` to that exact origin before starting Java.
- Use the saved JSON in [samples](samples) to show the request and response without pasting real personal data. The screenshot set includes the message, conversation, URL, loading, error, and completed-checklist states.
- Never demo with a real person’s message, account details, OTP, credentials, or active suspicious link.
