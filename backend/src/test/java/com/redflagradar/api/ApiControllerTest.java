package com.redflagradar.api;

import com.redflagradar.dto.AnalysisResponse;
import com.redflagradar.config.FrontendCorsConfiguration;
import com.redflagradar.service.AnalysisService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ApiController.class)
@Import({ApiErrorHandler.class, FrontendCorsConfiguration.class})
class ApiControllerTest {
    @Autowired
    private MockMvc mvc;

    @MockBean
    private AnalysisService analysisService;

    @Test
    void healthReturnsOk() throws Exception {
        mvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"));
    }

    @Test
    void allowsTheLocalViteOrigin() throws Exception {
        mvc.perform(options("/api/analyze")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers
                        .header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }

    @Test
    void invalidModeIsRejectedWithoutEchoingSubmittedText() throws Exception {
        mvc.perform(post("/api/analyze").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"mode\":\"unknown\",\"message\":\"private message\"}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.detail").exists())
                .andExpect(jsonPath("$.detail").value(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("private message"))));
    }

    @Test
    void validRequestReturnsStructuredContract() throws Exception {
        when(analysisService.analyze(any())).thenReturn(new AnalysisResponse(
                0, "Low", "No strong warning signs found.", List.of(), List.of(), List.of(),
                List.of("Verify independently."), List.of()));
        mvc.perform(post("/api/analyze").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"mode\":\"single\",\"message\":\"Hello\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.riskScore").value(0))
                .andExpect(jsonPath("$.riskLevel").value("Low"))
                .andExpect(jsonPath("$.verificationChecklist").isArray());
    }
}
