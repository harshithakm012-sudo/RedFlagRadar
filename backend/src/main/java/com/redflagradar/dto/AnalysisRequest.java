package com.redflagradar.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record AnalysisRequest(
        @NotBlank
        @Pattern(regexp = "single|conversation|url", message = "mode must be single, conversation, or url")
        String mode,
        @Size(max = 10000, message = "message is too long")
        String message,
        @Size(max = 20, message = "conversation cannot exceed 20 messages")
        List<@Valid MessageInput> messages,
        @Size(max = 10000, message = "url is too long")
        String url) {
}
