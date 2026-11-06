package com.redflagradar.service;

import com.redflagradar.dto.AnalysisRequest;
import com.redflagradar.dto.AnalysisResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;

@Service
public class PythonAnalysisService implements AnalysisService {
    private final RestClient detectionClient;

    public PythonAnalysisService(RestClient detectionRestClient) {
        this.detectionClient = detectionRestClient;
    }

    @Override
    public AnalysisResponse analyze(AnalysisRequest request) {
        try {
            AnalysisResponse response = detectionClient.post()
                    .uri("/analyze")
                    .body(request)
                    .retrieve()
                    .body(AnalysisResponse.class);
            if (!isWellFormed(response)) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Detection service returned an invalid response");
            }
            return response;
        } catch (RestClientResponseException exception) {
            int status = exception.getStatusCode().value();
            if (status == 422) {
                throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Detection service rejected the analysis request");
            }
            if (status >= 500) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Detection service is temporarily unavailable");
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Detection service returned an unexpected error");
        } catch (ResourceAccessException exception) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Detection service could not be reached");
        } catch (RestClientException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Detection service returned an invalid response");
        }
    }

    private boolean isWellFormed(AnalysisResponse response) {
        return response != null
                && response.riskScore() != null
                && response.riskScore() >= 0
                && response.riskScore() <= 100
                && response.riskLevel() != null
                && Set.of("Low", "Medium", "High").contains(response.riskLevel())
                && response.summary() != null
                && response.evidence() != null
                && response.messageFindings() != null
                && response.patterns() != null
                && response.recommendations() != null
                && response.verificationChecklist() != null;
    }
}
