package com.jobSpher.jobSpher.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * JWT Service
 * 
 * Service for generating and validating JSON Web Tokens (JWT) used for authentication.
 * Handles token creation, extraction of claims, and token validation.
 * 
 * JWT tokens contain:
 * - Subject (username/email)
 * - Issued at timestamp
 * - Expiration timestamp
 * - User claims (roles, etc.)
 * 
 * Tokens are signed using HMAC-SHA algorithm with a secret key.
 * 
 * @author JobSpher Team
 * @version 1.0
 */
@Service
public class JwtService {
    
    // JWT secret key for signing tokens (should be at least 256 bits in production)
    @Value("${jwt.secret:your-secret-key-change-this-in-production-min-256-bits}")
    private String secret;
    
    // Token expiration time in milliseconds (default: 24 hours)
    @Value("${jwt.expiration:86400000}") // 24 hours default
    private Long expiration;
    
    /**
     * Get the signing key for JWT tokens
     * 
     * Converts the secret string to a SecretKey using HMAC-SHA algorithm.
     * 
     * @return SecretKey for signing JWT tokens
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
    
    /**
     * Extract username (email) from JWT token
     * 
     * @param token JWT token string
     * @return Username (email) from token subject
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    
    /**
     * Extract expiration date from JWT token
     * 
     * @param token JWT token string
     * @return Expiration date
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    /**
     * Extract a specific claim from JWT token
     * 
     * Generic method to extract any claim from the token using a claims resolver function.
     * 
     * @param token JWT token string
     * @param claimsResolver Function to extract specific claim from Claims object
     * @param <T> Type of the claim value
     * @return Claim value
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    
    /**
     * Extract all claims from JWT token
     * 
     * Parses and verifies the token signature, then extracts all claims.
     * 
     * @param token JWT token string
     * @return Claims object containing all token claims
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    
    /**
     * Check if JWT token is expired
     * 
     * @param token JWT token string
     * @return true if token is expired, false otherwise
     */
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    
    /**
     * Generate JWT token for user
     * 
     * Creates a JWT token with user's username as subject and default expiration.
     * 
     * @param userDetails UserDetails containing user information
     * @return JWT token string
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }
    
    /**
     * Generate JWT token with extra claims
     * 
     * Creates a JWT token with additional custom claims (e.g., roles, permissions).
     * 
     * @param userDetails UserDetails containing user information
     * @param extraClaims Additional claims to include in the token
     * @return JWT token string
     */
    public String generateToken(UserDetails userDetails, Map<String, Object> extraClaims) {
        Map<String, Object> claims = new HashMap<>(extraClaims);
        return createToken(claims, userDetails.getUsername());
    }
    
    /**
     * Create JWT token
     * 
     * Internal method that builds the JWT token with specified claims, subject,
     * issued time, expiration time, and signature.
     * 
     * @param claims Additional claims to include in the token
     * @param subject Token subject (usually username/email)
     * @return JWT token string
     */
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }
    
    /**
     * Validate JWT token
     * 
     * Validates that:
     * 1. The token's username matches the user's username
     * 2. The token is not expired
     * 
     * @param token JWT token string
     * @param userDetails UserDetails to validate against
     * @return true if token is valid, false otherwise
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}

