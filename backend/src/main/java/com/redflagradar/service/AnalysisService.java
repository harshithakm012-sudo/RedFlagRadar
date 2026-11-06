package com.redflagradar.service;

import com.redflagradar.dto.AnalysisRequest;
import com.redflagradar.dto.AnalysisResponse;

public interface AnalysisService {
    AnalysisResponse analyze(AnalysisRequest request);
}
