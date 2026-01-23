package com.jobSpher.jobSpher.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobSpher.jobSpher.dto.AuthResponse;
import com.jobSpher.jobSpher.dto.LoginRequest;
import com.jobSpher.jobSpher.dto.RegisterRequest;
import com.jobSpher.jobSpher.service.AuthService;

import jakarta.validation.Valid;

/**
 * Authentication Controller
 * 
 * Handles user authentication endpoints including registration and login.
 * All endpoints in this controller are publicly accessible (no authentication required).
 * 
 * Base URL: /api/auth
 * 
 * @author JobSpher Team
 * @version 1.0
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    /**
     * Register a new user
     * 
     * Creates a new user account with the provided registration details.
     * The user's password will be hashed using BCrypt before storage.
     * Returns an authentication response containing JWT token and user details.
     * 
     * @param request RegisterRequest containing user registration details (email, password, firstName, lastName, role)
     * @return ResponseEntity containing AuthResponse with JWT token and user information
     * @throws RuntimeException if email already exists or validation fails
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * User login
     * 
     * Authenticates a user with email and password.
     * If credentials are valid, returns a JWT token that should be used for subsequent authenticated requests.
     * The token should be included in the Authorization header as "Bearer <token>"
     * 
     * @param request LoginRequest containing email and password
     * @return ResponseEntity containing AuthResponse with JWT token and user information
     * @throws RuntimeException if credentials are invalid
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}

