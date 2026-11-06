<<<<<<< HEAD
# Red Flag Radar

**Spot the Signs. Stop the Scams.**

Red Flag Radar is a local-first, explainable scam-warning prototype. It reviews messages, ordered conversations, and URL text, then offers independent verification steps. Its **Next Move Coach** turns detected signals into an optional safe response, or a safer action for suspicious links. Scores are heuristic signals, not probabilities or proof of fraud.

## How it works

```text
React + Vite browser UI → Java Spring Boot REST API → Python FastAPI rule engine
```

The browser calls Java; Java forwards requests to Python. The detector does not visit URLs. Submitted content is not persisted by the application. The retained root `analyzer.py` is an earlier experiment and is not used by the service.

See [the architecture](docs/architecture.md), [API contract](docs/api-contract.md), [demo inputs and outputs](docs/demo-inputs-and-outputs.md), [setup and demo plan](docs/demo-plan.md), and [hackathon presentation outline](docs/hackathon-presentation.md).

For a complete technical and non-technical overview, see the [HTML project report](docs/project-report.html).

## Prerequisites

- Python 3.11 or newer
- Java 17
- Apache Maven 3.9 or newer
- Node.js 20.19 or newer (Node 24 was used for the verified frontend build)

On Windows, choose the **Windows installer (64-bit)** from python.org on a typical Intel/AMD PC. In the installer, enable **Add python.exe to PATH**, then reopen PowerShell. If `python` still opens the Microsoft Store alias, use the actual `python.exe` path or turn off the Python app execution aliases in Windows Settings. Avoid the embeddable Python package.

## Windows quick start

Open three PowerShell terminals in the `RedFlagRadar` folder.

### 1. Python detection service

```powershell
cd .\detection-service
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\.venv\Scripts\python.exe -m unittest discover -s ..\tests -v
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

If the `python` command is unavailable but Python is installed, create the virtual environment using its full path, for example:

```powershell
& "$env:LOCALAPPDATA\Programs\Python\Python314\python.exe" -m venv .venv
```

Use the installed version’s folder instead of `Python314` if it differs. Once `.venv` exists, always use `.\.venv\Scripts\python.exe` for this project’s commands.

### 2. Java API

In another terminal, from the project root:

```powershell
cd .\backend
$env:DETECTION_SERVICE_URL = 'http://127.0.0.1:8000'
$env:FRONTEND_ORIGIN = 'http://localhost:5173'
$mvn = '..\.tools\apache-maven-3.10.0\bin\mvn.cmd'
& $mvn "-Dmaven.repo.local=$env:TEMP\redflagradar-m2\repository" test
& $mvn "-Dmaven.repo.local=$env:TEMP\redflagradar-m2\repository" spring-boot:run
```

The current checkout has Maven 3.10.0 under `.tools`. For a fresh clone without that ignored local folder, install Apache Maven and add its `bin` directory to PATH, then use `mvn` in the same commands. On a OneDrive-synced workspace, keeping Maven’s dependency cache under `$env:TEMP` avoids file-locking problems with synced JAR files.

### 3. Browser UI

In a third terminal, from the project root:

```powershell
cd .\frontend
npm install
npm run dev -- --host localhost
```

Open **http://localhost:5173**. Keep all three service terminals running. The Python health route is `http://127.0.0.1:8000/health`; the Java health route is `http://localhost:8080/api/health`.

## Run checks

From `detection-service`:

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s ..\tests -v
```

From `backend`:

```powershell
$mvn = '..\.tools\apache-maven-3.10.0\bin\mvn.cmd'
& $mvn "-Dmaven.repo.local=$env:TEMP\redflagradar-m2\repository" test
```

From `frontend`:

```powershell
npm run build
```

## Demo materials

Screenshots live in [docs/screenshots](docs/screenshots). Sample requests and live sample responses are in [docs/samples](docs/samples). For a short 3-minute walkthrough, use the [demo plan](docs/demo-plan.md) and [presentation outline](docs/hackathon-presentation.md).

## Scope and limitations

The service applies transparent, rule-based heuristics. It does not authenticate a sender, check a real company or job listing, crawl a URL, or determine whether a message is definitively fraudulent. A low score is not a safety guarantee. Checklist completion is local UI progress and is not sent as proof of legitimacy. Avoid pasting passwords, one-time codes, or payment credentials.
=======
# RedFlagRadar
A web app that analyzes suspicious messages and links, explains potential scam warning signs, and suggests safer next steps.
>>>>>>> 2f9e451e863134200ffa2fa208241e6a683df638
