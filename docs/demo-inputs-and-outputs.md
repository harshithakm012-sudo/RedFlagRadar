# Demo inputs and outputs

All examples use fabricated text, reserved example domains, and documentation-only IP addresses. The URL analyzer inspects the string and never opens the address. Responses were captured from the local Java-to-Python service flow; the saved JSON files are complete API responses.

## 1. Message review

Input: [message-request.json](samples/message-request.json)  
Output: [message-response.json](samples/message-response.json)

Expected live result: **37 / 100, Medium**, with two evidence items and five suggested checks. The key demo moment is that the score comes with the observed signals and their explanations.

## 2. Conversation review

Input: [conversation-request.json](samples/conversation-request.json)  
Output: [conversation-response.json](samples/conversation-response.json)

Expected live result: **74 / 100, High**, with seven evidence items, two conversation patterns, and five suggested checks. The timeline attributes evidence to message positions and calls out payment after selection and increasing urgency.

## 3. URL text review

Input: [url-request.json](samples/url-request.json)  
Output: [url-response.json](samples/url-response.json)

Expected live result: **30 / 100, Medium**, with HTTP and numeric-IP indicators. This is a URL-shape assessment, not a reputation lookup or a verdict on the destination.

## 4. Validation and UI states

- An empty input leaves **Analyze safely** disabled.
- An `ftp://` value displays a client-side validation error; only full HTTP or HTTPS URLs can be submitted.
- While the API request is pending, the button is disabled and the UI displays an “Analyzing” label and progress note.
- Checklist items can be checked locally. Completing all five shows a reminder that this does not prove the offer or sender is genuine.
- The captured screens are in the [screenshot gallery](screenshots/README.md). The repeatable headless browser check is [browser_demo_check.mjs](../tools/browser_demo_check.mjs).
