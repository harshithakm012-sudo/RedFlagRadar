"""Pure analysis functions; no network, persistence, or external AI calls."""

from urllib.parse import urlsplit
import ipaddress
import re

from .rules import PAYMENT, SELECTION, URGENCY, inspect_message
from .scoring import level_for, score_findings

MAX_TEXT_LENGTH = 10_000
MAX_MESSAGES = 20


def _validate_text(text: str, label: str = "message") -> None:
    if not isinstance(text, str) or not text.strip():
        raise ValueError(f"{label} must not be empty")
    if len(text) > MAX_TEXT_LENGTH:
        raise ValueError(f"{label} exceeds {MAX_TEXT_LENGTH} characters")


def _checklist(category: str) -> list[dict]:
    items = [
        ("independent_source", "Find the organization's official website independently", "A link or contact supplied in a suspicious message may lead to an impersonator."),
        ("official_opening", "Check the offer on an official careers, program, or announcements page", "An independently located official listing can help confirm the claim."),
        ("sender_domain", "Compare the sender's address with the organization's official domain", "Lookalike or unrelated domains can indicate impersonation; matching domains alone are not proof."),
        ("payment_request", "Investigate any unexpected fee or payment request before paying", "Upfront fees deserve careful checking through official channels."),
        ("sensitive_data", "Do not provide passwords, one-time codes, or unnecessary financial details", "Legitimate organizations should not need your password or OTP."),
    ]
    if category == "scholarship":
        items[1] = ("official_program", "Check the scholarship on the institution or sponsor's official page", "Confirm award terms and application dates from a source you find yourself.")
    elif category == "payment":
        items[1] = ("known_contact", "Confirm the request using a known, independently found contact method", "A familiar channel can help establish whether the request is expected.")
    return [{"id": key, "title": title, "why": why, "completed": False} for key, title, why in items]


def _summary(findings: list[dict], patterns: list[dict], score: int) -> str:
    if not findings and not patterns:
        return "No strong warning signs were found by these basic rules. This does not establish that the message is genuine."
    if score >= 60:
        return "Several warning signs were found. Pause and verify the claims through independently located channels."
    return "Some warning signs were found. Review the evidence and verify important claims independently."


def _result(findings: list[dict], message_findings: list[dict], patterns: list[dict], category: str) -> dict:
    score = score_findings(findings)
    recommendations = ["Do not share passwords or one-time codes.", "Verify claims using contact details you find independently.", "Completing a checklist does not establish that an offer is genuine, and a low score does not prove a message is safe."]
    if any(item["code"] == "payment_request" for item in findings):
        recommendations.insert(0, "Pause before paying any unexpected fee; confirm it through an independently found official channel.")
    return {
        "riskScore": score,
        "riskLevel": level_for(score),
        "summary": _summary(findings, patterns, score),
        "evidence": [{k: v for k, v in item.items() if k != "points"} for item in findings],
        "messageFindings": message_findings,
        "patterns": patterns,
        "recommendations": recommendations,
        "verificationChecklist": _checklist(category),
    }


def _public_findings(findings: list[dict]) -> list[dict]:
    return [{key: value for key, value in finding.items() if key != "points"} for finding in findings]


def analyze_single(message: str) -> dict:
    _validate_text(message)
    findings = inspect_message(message)
    per_message = [{"messageIndex": 0, "riskScore": score_findings(findings), "riskLevel": level_for(score_findings(findings)), "evidence": _public_findings(findings)}]
    category = "scholarship" if re.search(r"\b(scholarship|grant|bursary)\b", message, re.I) else "job" if re.search(r"\b(job|internship|employment|career)\b", message, re.I) else "payment" if PAYMENT.search(message) else "general"
    return _result(findings, per_message, [], category)


def analyze_conversation(messages: list[str]) -> dict:
    if not isinstance(messages, list) or not messages:
        raise ValueError("messages must be a non-empty ordered list")
    if len(messages) > MAX_MESSAGES:
        raise ValueError(f"conversation exceeds {MAX_MESSAGES} messages")
    for i, message in enumerate(messages):
        _validate_text(message, f"message {i + 1}")

    per_message = []
    all_findings = []
    for index, message in enumerate(messages):
        findings = inspect_message(message, index)
        all_findings.extend(findings)
        per_message.append({"messageIndex": index, "riskScore": score_findings(findings), "riskLevel": level_for(score_findings(findings)), "evidence": _public_findings(findings)})

    patterns = []
    payment_indices = [i for i, message in enumerate(messages) if PAYMENT.search(message)]
    offer_indices = [i for i, message in enumerate(messages) if SELECTION.search(message)]
    if payment_indices and offer_indices and min(offer_indices) < min(payment_indices):
        patterns.append({"code": "payment_after_offer", "message": "A payment request follows an offer or selection claim."})
        all_findings.append({"code": "payment_after_offer", "messageIndex": None, "text": patterns[-1]["message"], "explanation": "The sequence is a warning sign to check, but does not by itself establish fraud.", "points": 15})
    urgency_indices = [i for i, message in enumerate(messages) if URGENCY.search(message)]
    if len(messages) > 1 and urgency_indices and urgency_indices[-1] > 0 and any(not URGENCY.search(message) for message in messages[:urgency_indices[-1]]):
        patterns.append({"code": "increasing_urgency", "message": "Time pressure appears later in the conversation."})
        all_findings.append({"code": "increasing_urgency", "messageIndex": None, "text": patterns[-1]["message"], "explanation": "Later time pressure can compound earlier warning signs; consider the full context.", "points": 10})

    combined = " ".join(messages)
    category = "scholarship" if re.search(r"\b(scholarship|grant|bursary)\b", combined, re.I) else "job" if re.search(r"\b(job|internship|employment|career)\b", combined, re.I) else "payment" if PAYMENT.search(combined) else "general"
    return _result(all_findings, per_message, patterns, category)


def analyze_url(value: str) -> dict:
    _validate_text(value, "url")
    candidate = value.strip()
    if any(character.isspace() or ord(character) < 32 or ord(character) == 127 for character in candidate):
        raise ValueError("url must not contain whitespace or control characters")
    try:
        parsed = urlsplit(candidate)
        hostname = parsed.hostname
        parsed.port  # Accessing this property validates that the port is numeric and in range.
    except ValueError:
        raise ValueError("url contains a malformed host or port") from None
    if parsed.scheme.lower() not in ("http", "https") or not hostname:
        raise ValueError("url must be an absolute HTTP or HTTPS URL")
    if "\\" in parsed.netloc:
        raise ValueError("url host must not contain backslashes")

    # Validate DNS labels after IDNA conversion while still permitting IPv4 and IPv6 literals.
    try:
        ipaddress.ip_address(hostname)
        normalized_host = hostname.lower()
    except ValueError:
        try:
            normalized_host = hostname.rstrip(".").encode("idna").decode("ascii").lower()
        except UnicodeError:
            raise ValueError("url contains an invalid host name") from None
        labels = normalized_host.split(".")
        label_pattern = re.compile(r"^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$")
        if not normalized_host or any(not label_pattern.fullmatch(label) for label in labels):
            raise ValueError("url contains an invalid host name")
    findings = []

    def add(code: str, points: int, explanation: str) -> None:
        findings.append({"code": code, "messageIndex": None, "text": explanation, "explanation": explanation, "points": points})

    if parsed.scheme == "http":
        add("unencrypted_http", 15, "The URL uses HTTP rather than HTTPS. This does not establish whether the site is malicious.")
    if parsed.username or parsed.password:
        add("embedded_credentials", 25, "The URL contains user information before the host, which can obscure the destination.")
    try:
        ipaddress.ip_address(hostname)
        add("ip_host", 15, "The URL uses a numeric IP address as its host. Check the destination carefully.")
    except ValueError:
        pass
    if "xn--" in normalized_host:
        add("punycode_host", 20, "The host contains an internationalized punycode label; check for lookalike characters.")
    if re.search(r"\.(zip|mov|top|click|work)$", normalized_host, re.I):
        add("uncommon_host_suffix", 8, "The host uses a suffix that may deserve extra scrutiny. A suffix alone is not proof of risk.")

    score = score_findings(findings)
    return _result(findings, [], [], "general") | {
        "summary": _summary(findings, [], score) if findings else "No URL pattern warning was found. The site has not been opened or verified.",
        "recommendations": ["This analyzer did not visit the URL. Do not open it unless you trust the source.", "Navigate to an organization's website by typing an independently found address."],
    }


def analyze(request: dict) -> dict:
    """Dispatch a contract-shaped request; raises ValueError for invalid input."""
    if not isinstance(request, dict):
        raise ValueError("request must be a JSON object")
    mode = request.get("mode")
    if mode == "single":
        return analyze_single(request.get("message"))
    if mode == "conversation":
        raw = request.get("messages")
        if isinstance(raw, list):
            raw = [item.get("text") if isinstance(item, dict) else item for item in raw]
        return analyze_conversation(raw)
    if mode == "url":
        return analyze_url(request.get("url"))
    raise ValueError("mode must be single, conversation, or url")
