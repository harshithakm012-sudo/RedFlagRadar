package com.redflagradar.api;

import com.redflagradar.dto.AnalysisRequest;
import com.redflagradar.dto.AnalysisResponse;
import com.redflagradar.service.AnalysisService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class ApiController {
    private final AnalysisService analysisService;

    public ApiController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @GetMapping("/health")
    public HealthResponse health() {
        return new HealthResponse("ok");
    }

    @PostMapping("/analyze")
    @ResponseStatus(HttpStatus.OK)
    public AnalysisResponse analyze(@Valid @RequestBody AnalysisRequest request) {
        validateModeFields(request);
        return analysisService.analyze(request);
    }

    private void validateModeFields(AnalysisRequest request) {
        switch (request.mode()) {
            case "single" -> {
                if (request.message() == null || request.message().isBlank()) {
                    throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "message is required for single mode");
                }
            }
            case "conversation" -> {
                if (request.messages() == null || request.messages().isEmpty()) {
                    throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "messages must be a non-empty ordered list");
                }
            }
            case "url" -> {
                if (request.url() == null || request.url().isBlank()) {
                    throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "url is required for url mode");
                }
            }
            default -> throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "unsupported mode");
        }
    }

    public record HealthResponse(String status) { }
}
