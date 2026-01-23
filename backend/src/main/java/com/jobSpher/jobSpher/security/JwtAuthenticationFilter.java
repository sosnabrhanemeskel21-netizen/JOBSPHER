package com.jobSpher.jobSpher.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * JWT Authentication Filter
 * 
 * Spring Security filter that intercepts HTTP requests to validate JWT tokens.
 * This filter runs before the security filter chain and extracts JWT tokens from
 * the Authorization header, validates them, and sets the authentication context.
 * 
 * The filter:
 * 1. Checks for "Bearer <token>" in the Authorization header
 * 2. Extracts and validates the JWT token
 * 3. Loads user details and sets Spring Security authentication context
 * 4. Allows the request to proceed through the filter chain
 * 
 * If no token is present or token is invalid, the request proceeds without authentication,
 * and Spring Security will handle authorization based on the endpoint's security configuration.
 * 
 * @author JobSpher Team
 * @version 1.0
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private UserDetailsService userDetailsService;
    
    /**
     * Filter method that processes each HTTP request to extract and validate JWT tokens
     * 
     * @param request HTTP servlet request
     * @param response HTTP servlet response
     * @param filterChain Filter chain to continue processing
     * @throws ServletException if servlet error occurs
     * @throws IOException if I/O error occurs
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        // Extract Authorization header
        final String authHeader = request.getHeader("Authorization");
        
        // If no Authorization header or doesn't start with "Bearer ", skip JWT processing
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            // Extract JWT token (remove "Bearer " prefix)
            final String jwt = authHeader.substring(7);
            
            // Extract username (email) from JWT token
            final String userEmail = jwtService.extractUsername(jwt);
            
            // If username extracted and no authentication exists yet, proceed with authentication
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Load user details from database
                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
                
                // Validate JWT token against user details
                if (jwtService.validateToken(jwt, userDetails)) {
                    // Create authentication token with user details and authorities
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null, // credentials (not needed for JWT)
                            userDetails.getAuthorities() // user roles/permissions
                    );
                    
                    // Set additional authentication details (IP address, session ID, etc.)
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // Set authentication in Spring Security context
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Log error but don't fail the request - let Spring Security handle unauthorized access
            logger.error("Cannot set user authentication", e);
        }
        
        // Continue with the filter chain
        filterChain.doFilter(request, response);
    }
}

