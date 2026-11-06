# Spring Boot API

The Java service exposes `/api/health` and `/api/analyze`, validates requests, and defines the shared JSON response types. The analysis endpoint forwards requests to the Python service and maps connection failures to HTTP 503 and malformed upstream responses to HTTP 502.

## Requirements

- Java 17 or newer
- Apache Maven 3.6.3 or newer

Spring Boot 3.5.16 is used because it supports Java 17. Maven was not available in the initial environment check, so build and test results are currently unverified.

## Run and test

From this directory:

```powershell
mvn test
mvn spring-boot:run
```

The default port is 8080. Set `SERVER_PORT` to change it. The Python service URL is configured by `DETECTION_SERVICE_URL` and defaults to `http://127.0.0.1:8000`. Configure `DETECTION_SERVICE_CONNECT_TIMEOUT` and `DETECTION_SERVICE_READ_TIMEOUT` to change the 2-second connection and 15-second response timeouts.

The local Vite origin `http://localhost:5173` is allowed by default. Set `FRONTEND_ORIGIN` if the frontend is served from a different origin.

