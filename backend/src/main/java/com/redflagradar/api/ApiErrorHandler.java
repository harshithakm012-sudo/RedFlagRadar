package com.redflagradar.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiErrorHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> invalidFields() {
        return ResponseEntity.unprocessableEntity().body(new ApiError("Invalid request. Check the mode, content, and input sizes."));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> unreadableBody() {
        return ResponseEntity.badRequest().body(new ApiError("Request body must be valid JSON."));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> statusError(ResponseStatusException exception) {
        HttpStatus status = HttpStatus.valueOf(exception.getStatusCode().value());
        String message = exception.getReason() == null ? "Request could not be completed." : exception.getReason();
        return ResponseEntity.status(status).body(new ApiError(message));
    }

    public record ApiError(String detail) { }
}
