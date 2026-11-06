package com.redflagradar.service;

import com.redflagradar.dto.AnalysisRequest;
import com.redflagradar.dto.AnalysisResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class PythonAnalysisServiceTest {
    private static final String BASE_URL = "http://127.0.0.1:8000";
    private static final String VALID_RESPONSE = """
            {
              "riskScore": 25,
              "riskLevel": "Low",
              "summary": "A warning sign was found.",
              "evidence": [],
              "messageFindings": [],
              "patterns": [],
              "recommendations": ["Verify independently."],
              "verificationChecklist": []
            }
            """;

    @Test
    void postsContractRequestToConfiguredDetectionService() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        PythonAnalysisService service = new PythonAnalysisService(builder.baseUrl(BASE_URL).build());
        server.expect(requestTo(BASE_URL + "/analyze"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().json("{\"mode\":\"single\",\"message\":\"hello\"}"))
                .andRespond(withSuccess(VALID_RESPONSE, MediaType.APPLICATION_JSON));

        AnalysisResponse response = service.analyze(new AnalysisRequest("single", "hello", null, null));

        assertEquals(25, response.riskScore());
        assertEquals("Low", response.riskLevel());
        server.verify();
    }

    @Test
    void mapsPythonServerFailureToServiceUnavailable() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        PythonAnalysisService service = new PythonAnalysisService(builder.baseUrl(BASE_URL).build());
        server.expect(requestTo(BASE_URL + "/analyze")).andRespond(withServerError());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.analyze(new AnalysisRequest("single", "hello", null, null)));

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, exception.getStatusCode());
        server.verify();
    }

    @Test
    void mapsMalformedPythonResponseToBadGateway() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        PythonAnalysisService service = new PythonAnalysisService(builder.baseUrl(BASE_URL).build());
        server.expect(requestTo(BASE_URL + "/analyze"))
                .andRespond(withSuccess("not-json", MediaType.APPLICATION_JSON));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.analyze(new AnalysisRequest("single", "hello", null, null)));

        assertEquals(HttpStatus.BAD_GATEWAY, exception.getStatusCode());
        server.verify();
    }
}
