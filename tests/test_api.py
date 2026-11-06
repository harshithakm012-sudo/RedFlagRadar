"""HTTP-level smoke tests for the FastAPI boundary."""

import unittest

from fastapi.testclient import TestClient

from app.main import app


class ApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health_is_content_free(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_single_analysis_has_contract_fields(self):
        response = self.client.post("/analyze", json={"mode": "single", "message": "Please pay a registration fee today."})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["riskLevel"], "Medium")
        self.assertIn("verificationChecklist", response.json())

    def test_conversation_preserves_order(self):
        response = self.client.post("/analyze", json={"mode": "conversation", "messages": [
            {"text": "You have been selected for an internship."},
            {"text": "Pay a registration fee now."},
        ]})
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["messageIndex"] for item in response.json()["messageFindings"]], [0, 1])
        self.assertEqual(response.json()["patterns"][0]["code"], "payment_after_offer")

    def test_invalid_request_gets_422_without_echoing_content(self):
        private_sample = "secret sample"
        response = self.client.post("/analyze", json={"mode": "single", "message": private_sample * 1000})
        self.assertEqual(response.status_code, 422)
        self.assertNotIn(private_sample, response.text)


if __name__ == "__main__":
    unittest.main()
