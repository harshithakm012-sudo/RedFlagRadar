# analyzer.py
# Simple scam detection rules for single messages

def analyze_message(message: str) -> dict:
    suspicious_phrases = [
        "congratulations",
        "selected",
        "registration fee",
        "pay immediately",
        "bank details",
        "otp",
        "password",
        "urgent",
        "limited time"
    ]

    evidence = []
    score = 0

    # Rule 1: Check suspicious phrases
    for phrase in suspicious_phrases:
        if phrase.lower() in message.lower():
            evidence.append(f"Suspicious phrase detected: '{phrase}'")
            score += 15

    # Rule 2: Check for money requests
    if "pay" in message.lower() or "fee" in message.lower():
        evidence.append("Message requests payment.")
        score += 20

    # Rule 3: Check for urgency
    if "immediately" in message.lower() or "urgent" in message.lower():
        evidence.append("Message creates urgency.")
        score += 10

    # Cap score at 100
    score = min(score, 100)

    # Risk level
    if score < 30:
        risk = "Low"
    elif score < 60:
        risk = "Medium"
    else:
        risk = "High"

    return {
        "message": message,
        "risk_score": score,
        "risk_level": risk,
        "evidence": evidence,
        "recommendation": "Be cautious. Verify before you trust."
    }


# Example test
if __name__ == "__main__":
    test_message = "Congratulations! You have been selected. Pay a registration fee immediately."
    result = analyze_message(test_message)
    print(result)

