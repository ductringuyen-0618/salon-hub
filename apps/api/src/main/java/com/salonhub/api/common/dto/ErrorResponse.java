package com.salonhub.api.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Standard error response DTO for consistent API error messages.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
    private List<FieldError> fieldErrors;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldError {
        private String field;
        private String message;
        private Object rejectedValue;
    }
    
    public static ErrorResponse of(int status, String error, String message) {
        return ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status)
                .error(error)
                .message(message)
                .build();
    }
    
    public static ErrorResponse of(int status, String error, String message, String path) {
        return ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status)
                .error(error)
                .message(message)
                .path(path)
                .build();
    }
    
    public static ErrorResponse badRequest(String message) {
        return of(400, "Bad Request", message);
    }
    
    public static ErrorResponse unauthorized(String message) {
        return of(401, "Unauthorized", message);
    }
    
    public static ErrorResponse forbidden(String message) {
        return of(403, "Forbidden", message);
    }
    
    public static ErrorResponse notFound(String message) {
        return of(404, "Not Found", message);
    }
    
    public static ErrorResponse conflict(String message) {
        return of(409, "Conflict", message);
    }
    
    public static ErrorResponse internalError(String message) {
        return of(500, "Internal Server Error", message);
    }
}
