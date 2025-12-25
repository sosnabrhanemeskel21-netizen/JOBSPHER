package com.jobSpher.jobSpher.security;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Spring Security Configuration
 * 
 * Configures Spring Security for the application including:
 * - JWT-based authentication
 * - CORS configuration for cross-origin requests
 * - Authorization rules for different endpoints
 * - Password encoding (BCrypt)
 * - Stateless session management
 * 
 * Security features:
 * - CSRF protection disabled (stateless API with JWT)
 * - Public endpoints: /api/auth/**, Swagger UI, file downloads
 * - Protected endpoints: All other /api/** endpoints require authentication
 * - Role-based access: /api/admin/** requires ADMIN role
 * - JWT authentication filter processes all requests
 * 
 * @author JobSpher Team
 * @version 1.0
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Enables @PreAuthorize and other method-level security annotations
public class SecurityConfig {
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthFilter;
    
    @Autowired
    private UserDetailsService userDetailsService;
    
    /**
     * Configures the security filter chain
     * 
     * Defines authentication and authorization rules:
     * - CSRF disabled (stateless JWT API doesn't need CSRF protection)
     * - CORS enabled for frontend integration
     * - Public endpoints: auth, Swagger docs, file downloads
     * - Admin endpoints require ADMIN role
     * - All other endpoints require authentication
     * - Stateless session (no server-side session storage)
     * - JWT authentication filter processes all requests
     * 
     * @param http HttpSecurity object to configure
     * @return Configured SecurityFilterChain
     * @throws Exception if configuration fails
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF protection (stateless API with JWT doesn't need it)
            .csrf(csrf -> csrf.disable())
            // Enable CORS with custom configuration
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // Configure authorization rules
            .authorizeHttpRequests(auth -> auth
                // Public endpoints (no authentication required)
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                // Allow public access to job search and details endpoints
                .requestMatchers("/api/jobs/**").permitAll()
                .requestMatchers("/api/files/download/**").permitAll()
                // Admin endpoints require ADMIN role
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // All other endpoints require authentication
                .anyRequest().authenticated()
            )
            // Stateless session management (no HTTP session storage)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            // Use custom authentication provider
            .authenticationProvider(authenticationProvider())
            // Add JWT authentication filter before username/password filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    /**
     * CORS Configuration Source
     * 
     * Configures Cross-Origin Resource Sharing (CORS) to allow requests from the frontend.
     * Currently configured for localhost:3000 (development). In production, update
     * allowed origins to the actual frontend domain.
     * 
     * @return CorsConfigurationSource with CORS settings
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow development origins (wildcard patterns allowed)
        configuration.setAllowedOriginPatterns(List.of("*"));
        // Allowed HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // Allow all headers
        configuration.setAllowedHeaders(List.of("*"));
        // Expose Authorization header to client
        configuration.setExposedHeaders(List.of("Authorization"));
        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    
    /**
     * Authentication Provider Bean
     * 
     * Configures the authentication provider to use UserDetailsService
     * for loading user details and BCrypt for password encoding/verification.
     * 
     * @return Configured DaoAuthenticationProvider
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
    
    /**
     * Authentication Manager Bean
     * 
     * Provides the AuthenticationManager used for authentication operations.
     * 
     * @param config AuthenticationConfiguration
     * @return AuthenticationManager instance
     * @throws Exception if configuration fails
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    
    /**
     * Password Encoder Bean
     * 
     * Configures BCrypt password encoder for hashing and verifying passwords.
     * BCrypt automatically handles salt generation and hashing.
     * 
     * @return BCryptPasswordEncoder instance
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

