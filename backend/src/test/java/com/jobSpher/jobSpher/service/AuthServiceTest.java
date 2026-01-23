package com.jobSpher.jobSpher.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.jobSpher.jobSpher.dto.AuthResponse;
import com.jobSpher.jobSpher.dto.LoginRequest;
import com.jobSpher.jobSpher.dto.RegisterRequest;
import com.jobSpher.jobSpher.model.User;
import com.jobSpher.jobSpher.repository.UserRepository;
import com.jobSpher.jobSpher.security.JwtTokenProvider;

class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRegister_Success() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setRole(User.Role.JOB_SEEKER);
        request.setPhoneNumber("1234567890");

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setEmail(request.getEmail());
        savedUser.setRole(request.getRole());

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(tokenProvider.generateToken(any(User.class))).thenReturn("jwt-token");

        // Act
        AuthResponse response = authService.register(request);

        // Assert
        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals("test@example.com", response.getUser().getEmail());
        verify(userRepository, times(1)).save(any(User.class));
    }
    /*
     * HOW IT RUNS:
     * 1. The test initializes mocks for UserRepository, PasswordEncoder, and JwtTokenProvider.
     * 2. It sets up a RegisterRequest object with valid user data.
     * 3. It mocks the repository to return false for existing email check.
     * 4. It mocks the save method to return a created User object.
     * 5. It calls the register method of AuthService.
     * 
     * WHAT IT DOES:
     * This test verifies that the register method correctly creates a new user, saves it to the database,
     * and returns an AuthResponse containing a JWT token when provided with valid registration data.
     */

    @Test
    void testLogin_Success() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");

        User user = new User();
        user.setId(1L);
        user.setEmail(request.getEmail());
        user.setPassword("encodedPassword"); // In DB, password is encoded
        user.setRole(User.Role.JOB_SEEKER);

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), user.getPassword())).thenReturn(true);
        when(tokenProvider.generateToken(user)).thenReturn("jwt-token");

        // Act
        AuthResponse response = authService.login(request);

        // Assert
        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
    }
    /*
     * HOW IT RUNS:
     * 1. The test creates a LoginRequest with email and password.
     * 2. It mocks the UserRepository to return a User object when searched by email.
     * 3. It mocks the PasswordEncoder to return true when comparing the raw password with the encoded one.
     * 4. It mocks the token generation.
     * 5. It calls the login method.
     * 
     * WHAT IT DOES:
     * This test ensures that a user can successfully log in with correct credentials. 
     * It checks if the service validates the password and returns a valid JWT token.
     */
    
    @Test
    void testRegister_EmailAlreadyExists() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("existing@example.com");

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            authService.register(request);
        });
    }
    /*
     * HOW IT RUNS:
     * 1. It sets up a RegisterRequest with an email address.
     * 2. It mocks the UserRepository to return 'true' when checking if that email exists.
     * 3. It calls the register method within an assertThrows block.
     * 
     * WHAT IT DOES:
     * This test verifies that the registration process throws a RuntimeException if the user attempts 
     * to register with an email address that is already found in the database.
     */
}
