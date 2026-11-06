# Hackathon presentation outline

## Slide 1 — Red Flag Radar

**Spot the Signs. Stop the Scams.**  
An explainable local-first assistant for reviewing suspicious messages, conversations, and URL text.

## Slide 2 — The user problem

- Pressure and payment requests can hide inside plausible offers.
- A simple “scam / safe” label does not help someone judge the evidence.
- Conversation order and escalating urgency can change the meaning of a request.

## Slide 3 — Product flow

```text
Paste text → See heuristic signals and context → Verify through independent channels
```

The app reviews single messages, ordered conversations, and URL text. It explains each signal, maps it to practical checks, and offers a **Next Move Coach** with an optional copyable response or safe link-handling action.

## Slide 4 — Architecture

```text
React + Vite → Java Spring Boot API → Python FastAPI rules
```

The browser talks to Java; Java calls the Python detector. The UI does not persist submissions. URL strings are parsed without visiting destinations.

## Slide 5 — Live demo

Show a payment-after-selection message, then the conversation timeline and urgency pattern. Demonstrate the context-aware Next Move Coach, then review a URL with an HTTP/numeric-IP signal. Finish by checking checklist items and showing the disclaimer.

## Slide 6 — What we validated

- Python unit/API suite: 20 tests passed.
- Java controller/service suite: 7 tests passed.
- Frontend production build succeeded.
- Headless browser flow passed for message, conversation, URL, input validation, loading, and checklist completion.

## Slide 7 — Limits and next steps

Scores are heuristics, not probabilities. The project does not identify senders, verify companies, fetch URLs, or prove that something is safe. Next: broaden adversarial and multilingual evaluation, add accessibility and browser automation to CI, and test with privacy-safe consented examples.

## 30-second pitch

“Red Flag Radar helps people pause before they pay or share sensitive information. Instead of returning a black-box verdict, it points to the wording and conversation patterns that raised concern, then offers independent checks. It covers messages, conversations, and URL text without opening links or storing submissions. The current rules are a transparent prototype, so the score is a prompt to investigate, never proof of fraud or safety.”
