# Shared API contract (planned)

This document is the shared contract for the frontend, Java API, and Python service. The Java API exposes `/api/health` and `/api/analyze`; Python exposes `/health` and `/analyze`. Java forwards the analysis JSON to Python and returns its structured result. Both services use JSON, return HTTP 422 for invalid analysis input, and avoid echoing submitted content in validation errors. Java maps an unreachable Python service to HTTP 503 and an invalid Python response to HTTP 502.

## Analysis request

`POST /api/analyze` (Java) or `POST /analyze` (Python)

```json
{
  "mode": "conversation",
  "message": null,
  "messages": [
    {"text": "You have been selected for an internship.", "timestamp": null},
    {"text": "Pay a registration fee today to reserve your place.", "timestamp": null}
  ],
  "url": null
}
```

`mode` is `single`, `conversation`, or `url`. Use `message` for `single`, an ordered non-empty `messages` array for `conversation`, and `url` for `url`. Message order is the array order; optional timestamps (up to 80 characters) are descriptive and do not trigger network access. Unused mode fields should be null or omitted. Implemented limits are 10,000 characters per message or URL and 20 conversation entries. The URL analyzer parses the submitted text but does not visit it.

## Analysis response

```json
{
  "riskScore": 58,
  "riskLevel": "Medium",
  "summary": "A payment request follows an internship selection message.",
  "evidence": [
    {
      "code": "unexpected_payment",
      "messageIndex": 1,
      "text": "Requests a registration fee.",
      "explanation": "Unexpected upfront fees are a warning sign and should be independently checked."
    }
  ],
  "messageFindings": [
    {"messageIndex": 0, "riskScore": 10, "riskLevel": "Low", "evidence": []},
    {"messageIndex": 1, "riskScore": 58, "riskLevel": "Medium", "evidence": []}
  ],
  "patterns": [
    {"code": "payment_after_selection", "message": "A payment request follows an offer or selection claim."}
  ],
  "recommendations": ["Verify the offer using contact details found independently."],
  "verificationChecklist": [
    {
      "id": "official_careers_page",
      "title": "Find the organization's careers page independently",
      "why": "A genuine opening should be confirmable through an official channel.",
      "completed": false
    }
  ]
}
```

`riskScore` is an integer from 0 to 100 and is a heuristic estimate, not a probability. `riskLevel` is `Low`, `Medium`, or `High`. `evidence.messageIndex` is zero-based and refers to the submitted order; it may be null for conversation-wide evidence. Checklist completion is client progress and cannot prove legitimacy. Responses must not imply that a company, sender, or URL has been verified.

## Health responses

Both health routes return JSON such as `{"status":"ok"}`. Health checks must not include user-submitted content.

