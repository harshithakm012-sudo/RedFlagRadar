"""Synthetic examples for the rule engine. Run: python -m unittest discover -s tests"""

import unittest

from app.engine import MAX_MESSAGES, MAX_TEXT_LENGTH, analyze, analyze_conversation, analyze_single, analyze_url


class SingleMessageTests(unittest.TestCase):
    def test_ordinary_message_has_low_score(self):
        result = analyze_single("The library meeting is at 3 pm in room 4.")
        self.assertEqual(result["riskLevel"], "Low")
        self.assertEqual(result["riskScore"], 0)

    def test_unexpected_payment_is_explained(self):
        result = analyze_single("Pay a registration fee to reserve your internship position.")
        self.assertIn("payment_request", [item["code"] for item in result["evidence"]])
        self.assertGreater(result["riskScore"], 0)

    def test_urgency_and_threat_are_separate_evidence(self):
        result = analyze_single("Pay immediately or your offer will be cancelled.")
        codes = {item["code"] for item in result["evidence"]}
        self.assertIn("urgency", codes)
        self.assertIn("pressure_or_threat", codes)

    def test_sensitive_credential_request_is_flagged(self):
        result = analyze_single("Reply with your OTP and password to confirm your account.")
        self.assertIn("sensitive_information", [item["code"] for item in result["evidence"]])

    def test_safe_warning_about_otp_is_not_misread_as_a_request(self):
        result = analyze_single("Never share your OTP or password with anyone.")
        self.assertNotIn("sensitive_information", [item["code"] for item in result["evidence"]])

    def test_denial_of_fee_is_not_scored_as_payment_request(self):
        result = analyze_single("There is no fee to apply for this program.")
        self.assertNotIn("payment_request", [item["code"] for item in result["evidence"]])


class ConversationTests(unittest.TestCase):
    def test_ordered_payment_after_selection_adds_storyline_pattern(self):
        result = analyze_conversation([
            "Congratulations, you have been selected for an internship.",
            "Pay a registration fee today to reserve your place.",
        ])
        self.assertEqual([item["messageIndex"] for item in result["messageFindings"]], [0, 1])
        self.assertIn("payment_after_offer", [item["code"] for item in result["patterns"]])
        self.assertEqual(result["evidence"][-1]["messageIndex"], None)

    def test_reversed_order_does_not_claim_payment_after_offer(self):
        result = analyze_conversation([
            "Pay a registration fee today.",
            "Congratulations, you have been selected for an internship.",
        ])
        self.assertNotIn("payment_after_offer", [item["code"] for item in result["patterns"]])

    def test_later_pressure_is_reported_without_declaring_fraud(self):
        result = analyze_conversation(["Your application has been received.", "Act immediately or your offer will be cancelled."])
        self.assertIn("increasing_urgency", [item["code"] for item in result["patterns"]])
        self.assertNotIn("fraud", result["summary"].lower())

    def test_mixed_conversation_keeps_each_message_separate(self):
        result = analyze_conversation(["Thanks for applying; we will reply next week.", "Pay a fee today to guarantee selection."])
        self.assertEqual(result["messageFindings"][0]["riskScore"], 0)
        self.assertGreater(result["messageFindings"][1]["riskScore"], 0)


class UrlTests(unittest.TestCase):
    def test_http_url_pattern_is_reported_without_visiting_site(self):
        result = analyze_url("http://example.org/apply")
        self.assertIn("unencrypted_http", [item["code"] for item in result["evidence"]])
        self.assertIn("did not visit", result["recommendations"][0])

    def test_https_url_with_normal_host_has_no_pattern_warning(self):
        result = analyze_url("https://example.org/careers")
        self.assertEqual(result["riskScore"], 0)

    def test_malformed_or_non_http_urls_are_rejected(self):
        for value in ("", "example.org", "javascript:alert(1)", "https://[broken", "https://bad host.org", "https://example.org:bad"):
            with self.subTest(value=value), self.assertRaises(ValueError):
                analyze_url(value)


class ValidationAndContractTests(unittest.TestCase):
    def test_empty_and_oversized_inputs_are_rejected(self):
        with self.assertRaises(ValueError):
            analyze_single("  ")
        with self.assertRaises(ValueError):
            analyze_single("x" * (MAX_TEXT_LENGTH + 1))
        with self.assertRaises(ValueError):
            analyze_conversation([])
        with self.assertRaises(ValueError):
            analyze_conversation(["hello"] * (MAX_MESSAGES + 1))

    def test_documented_request_shape_dispatches_and_has_checklist(self):
        result = analyze({"mode": "single", "message": "Check this internship offer."})
        self.assertIn("verificationChecklist", result)
        self.assertTrue(all(item["completed"] is False for item in result["verificationChecklist"]))
        self.assertTrue(any("does not establish" in item.lower() for item in result["recommendations"]))

    def test_checklist_completion_is_not_a_verdict(self):
        result = analyze_single("An internship opportunity is open.")
        for item in result["verificationChecklist"]:
            item["completed"] = True
        self.assertTrue(all(item["completed"] for item in result["verificationChecklist"]))
        self.assertIn("does not establish", result["recommendations"][-1].lower())


if __name__ == "__main__":
    unittest.main()
