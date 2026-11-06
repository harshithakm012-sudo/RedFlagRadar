"""Small, explicit text rules. These indicate warning signs, not proof of fraud."""

import re

PAYMENT = re.compile(r"\b(pay|payment|fee|deposit|wire|transfer|send money)\b", re.I)
URGENCY = re.compile(r"\b(urgent|immediately|right now|today|within \d+ hours?|last chance|final notice)\b", re.I)
THREAT = re.compile(r"\b(cancel(?:led|ed)?|lose your (?:offer|account)|legal action|report you|terminated)\b", re.I)
SENSITIVE = re.compile(r"\b(password|passcode|one.time code|\botp\b|bank details|card number|\bssn\b|social security number)\b", re.I)
SENSITIVE_REQUEST = re.compile(r"\b(send|share|provide|give|reply with|enter|submit|tell us|need your|required)\b", re.I)
SELECTION = re.compile(r"\b(selected|selection|offer|congratulations|internship|job offer)\b", re.I)
PAYMENT_CONTEXT = re.compile(r"\b(pay|payment|fee|deposit|wire|transfer|send money)\b", re.I)


def inspect_message(text: str, index: int = 0) -> list[dict]:
    """Return explainable indicators found in one message."""
    findings = []

    def add(code: str, points: int, explanation: str) -> None:
        findings.append({"code": code, "messageIndex": index, "text": explanation, "explanation": explanation, "points": points})

    # Avoid treating an explicit denial as a request, e.g. "there is no fee".
    if PAYMENT_CONTEXT.search(text) and not re.search(r"\b(no|never|without|not required)\b.{0,24}\b(fee|payment|pay)\b", text, re.I):
        add("payment_request", 25, "The message mentions a payment, fee, or money transfer. Check whether it is unexpected and independently documented.")
    if SENSITIVE.search(text) and SENSITIVE_REQUEST.search(text) and not re.search(r"\b(do not|don't|never|avoid)\b.{0,32}\b(send|share|provide|give|enter|submit)\b", text, re.I):
        add("sensitive_information", 35, "The message mentions credentials or sensitive financial/identity information. Do not share passwords or one-time codes.")
    if URGENCY.search(text):
        add("urgency", 12, "The message uses time pressure. Verify the deadline through an independently found official channel.")
    if THREAT.search(text):
        add("pressure_or_threat", 12, "The message threatens a negative consequence. Pressure can make it harder to check a claim carefully.")
    if re.search(r"\b(guaranteed|no experience required|easy money|risk.free)\b", text, re.I):
        add("unusually_attractive_claim", 10, "The message makes an unusually attractive promise. Check the details and source independently.")
    return findings

