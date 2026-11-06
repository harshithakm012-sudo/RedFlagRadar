package com.redflagradar.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MessageInput(
        @NotBlank(message = "text is required")
        @Size(max = 10000, message = "text is too long")
        String text,
        @Size(max = 80, message = "timestamp is too long")
        String timestamp) {
}
