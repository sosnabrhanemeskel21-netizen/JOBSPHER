package com.jobSpher.jobSpher.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobSpher.jobSpher.dto.AuthResponse;
import com.jobSpher.jobSpher.dto.LoginRequest;
import com.jobSpher.jobSpher.dto.RegisterRequest;
import com.jobSpher.jobSpher.model.User;
import com.jobSpher.jobSpher.service.AuthService;
import com.jobSpher.jobSpher.service.CustomUserDetailsService;
import com.jobSpher.jobSpher.security.JwtTokenProvider;

@WebMvcTest(AuthController.class)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    // Need to mock these as they are likely loaded by SecurityConfig
    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
    }

    @Test
    void testRegisterEndpoint_Success() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("newuser@example.com");
        request.setPassword("password123");
        request.setFirstName("New");
        request.setLastName("User");
        request.setPhoneNumber("1234567890");
        request.setRole(User.Role.JOB_SEEKER);

        AuthResponse mockResponse = new AuthResponse("mock-jwt-token", new User());
        
        when(authService.register(any(RegisterRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-jwt-token"));
    }
    /*
     * HOW IT RUNS:
     * 1. Initializes the MVC environment focusing only on AuthController.
     * 2. Creates a mock RegisterRequest and the expected JSON response.
     * 3. Sends a POST request to "/api/auth/register" with the request body.
     * 4. Asserts that the HTTP status is 200 OK.
     * 5. Asserts that the response JSON contains the matching token.
     * 
     * WHAT IT DOES:
     * This test ensures that the backend API endpoint for registration is reachable, 
     * correctly parses the incoming JSON, calls the service layer, and returns the expected success response.
     */

    @Test
    void testLoginEndpoint_Success() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@example.com");
        request.setPassword("password123");

        AuthResponse mockResponse = new AuthResponse("mock-jwt-token", new User());

        when(authService.login(any(LoginRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-jwt-token"));
    }
    /*
     * HOW IT RUNS:
     * 1. Prepares a LoginRequest object.
     * 2. Mocks the AuthService.login() to return a success response object.
     * 3. Performs a POST request to "/api/auth/login" with the login JSON.
     * 4. Verifies the 200 OK status and the presence of the token in the response.
     * 
     * WHAT IT DOES:
     * This verify the API contract for the login endpoint, ensuring that clients sending 
     * valid credentials receive the correct structure in return.
     */
}
