package com.salonhub.api.config;

import org.springframework.http.ResponseEntity;

import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.validation.ConstraintViolationException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class ValidationExceptionHandler {

  /** Handle @Valid failures on @RequestBody DTOs */
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, List<String>>> handleBindingErrors(
      MethodArgumentNotValidException ex) {
    List<String> errors = ex.getBindingResult()
        .getFieldErrors()
        .stream()
        .map(err -> err.getField() + ": " + err.getDefaultMessage())
        .collect(Collectors.toList());
    return ResponseEntity
        .badRequest()
        .body(Map.of("errors", errors));
  }

  /** Handle @Positive, @NotNull, etc. on @PathVariable and @RequestParam */
  @ExceptionHandler(ConstraintViolationException.class)
  public ResponseEntity<Map<String, List<String>>> handleConstraintViolations(
      ConstraintViolationException ex) {
    List<String> errors = ex.getConstraintViolations()
        .stream()
        .map(cv -> {
            String path = cv.getPropertyPath().toString();
            return path + ": " + cv.getMessage();
        })
        .collect(Collectors.toList());
    return ResponseEntity
        .badRequest()
        .body(Map.of("errors", errors));
  }

  /** Handle type‐mismatch (e.g. non‐boolean for a Boolean param) */
  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  public ResponseEntity<Map<String, String>> handleTypeMismatch(
      MethodArgumentTypeMismatchException ex) {
    String message = ex.getName() + " should be of type " +
                     ex.getRequiredType().getSimpleName();
    return ResponseEntity
        .badRequest()
        .body(Map.of("error", message));
  }

  /** Handle invalid enum values (e.g. invalid Role) */
  @ExceptionHandler(InvalidFormatException.class)
  public ResponseEntity<Map<String, String>> handleInvalidFormatException(InvalidFormatException ex) {
    if (ex.getTargetType().isEnum()) {
      // Dynamically get all allowed enum values
      String allowedValues = 
      java.util.Arrays.stream(ex.getTargetType().getEnumConstants())
          .map(Object::toString)   // Convert each enum constant to String
          .collect(Collectors.joining(", "));

      String message = "Invalid value for field. Allowed values are: " + allowedValues;
      return ResponseEntity
          .badRequest()
          .body(Map.of("error", message));
    }

    // fallback if not an enum
    return ResponseEntity
        .badRequest()
        .body(Map.of("error", "Invalid request format."));
  }
}
