# Detection service

This service exposes the pure rule engine through FastAPI. It does not visit URLs, persist requests, or call external AI services.

## Setup and run

Use Python 3.9 or newer. From this directory, create and activate a virtual environment, then install the service dependencies:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

If the `py` launcher is unavailable but `python` works, use `python -m venv .venv` instead. The health endpoint is `http://127.0.0.1:8000/health`; the interactive API description is at `/docs` while the service is running.

To run the detector and API tests, install the test client and run them from this directory:

```powershell
python -m pip install -r requirements-dev.txt
python -m unittest discover -s ..\tests
```

The shared request and response schema is documented in `../docs/api-contract.md`. Invalid requests return HTTP 422. No submitted content is included in health responses or application error messages.

