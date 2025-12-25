
package com.jobSpher.jobSpher.exception;

import java.io.FileNotFoundException;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Global Exception Handler
 * 
 * Centralized exception handling for the REST API. This handler intercepts
 * exceptions
 * thrown by controllers and converts them to appropriate HTTP responses.
 * 
 * Handles:
 * - RuntimeException: Business logic exceptions and validation failures
 * - MethodArgumentNotValidException: Request validation errors (Jakarta
 * Validation)
 * - Exception: Catch-all for unexpected errors
 * 
 * Note: In production, consider:
 * - More specific exception types (NotFoundException, UnauthorizedException,
 * etc.)
 * - Proper logging of exceptions
 * - Not exposing internal error details to clients
 * - Structured error response format
 * 
 * @author JobSpher Team
 * @version 1.0
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle RuntimeExceptions
     * 
     * Catches runtime exceptions thrown in controllers/services and returns
     * a 400 Bad Request response with the error message.
     * 
     * Note: This is quite broad and may catch unexpected exceptions.
     * Consider using more specific exception types in the future.
     * 
     * @param ex RuntimeException that was thrown
     * @return ResponseEntity with error message and 400 status code
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle validation exceptions
     * 
     * Catches validation errors from @Valid annotations on request DTOs.
     * Returns a map of field names to validation error messages.
     * 
     * @param ex MethodArgumentNotValidException from request validation
     * @return ResponseEntity with field-level error messages and 400 status code
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();

        // Extract field-level validation errors
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    /**
     * Handle generic exceptions
     * 
     * Catch-all handler for any unhandled exceptions.
     * Returns a 500 Internal Server Error response.
     * 
     * Note: In production, avoid exposing detailed error messages to clients.
     * Log the full exception details server-side instead.
     * 
     * @param ex Exception that was thrown
     * @return ResponseEntity with generic error message and 500 status code
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "An unexpected error occurred: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(FileNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleFileNotFoundException(FileNotFoundException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
}
