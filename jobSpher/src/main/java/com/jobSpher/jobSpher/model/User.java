package com.jobSpher.jobSpher.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * User Entity
 * 
 * Represents a user account in the system. All users (Admin, Employer, Job Seeker)
 * are stored in this single table with role-based differentiation.
 * 
 * Implements Spring Security's UserDetails interface for authentication and authorization.
 * 
 * User roles:
 * - ADMIN: System administrators who approve jobs and verify payments
 * - EMPLOYER: Company owners who post jobs and manage applications
 * - JOB_SEEKER: Users who search and apply for jobs
 * 
 * @author JobSpher Team
 * @version 1.0
 */
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_email", columnList = "email", unique = true) // Index for fast email lookups
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String firstName;
    
    @Column(nullable = false)
    private String lastName;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role;
    
    private String phoneNumber; // Optional phone number
    private String address; // Optional address
    private String resumePath; // Path to resume file (used by job seekers)
    
    @Column(nullable = false)
    private LocalDateTime createdAt; // Account creation timestamp
    
    private LocalDateTime updatedAt; // Last update timestamp
    
    @Column(nullable = false)
    private Boolean enabled = true; // Account enabled/disabled status
    
    /**
     * JPA lifecycle callback - executed before entity is persisted
     * Sets creation and update timestamps
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    /**
     * JPA lifecycle callback - executed before entity is updated
     * Updates the update timestamp
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // ========== UserDetails Implementation ==========
    
    /**
     * Get user authorities (roles) for Spring Security
     * 
     * @return Collection of GrantedAuthority objects (roles)
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }
    
    /**
     * Get username for authentication (uses email)
     * 
     * @return Email address as username
     */
    @Override
    public String getUsername() {
        return email;
    }
    
    /**
     * Check if account is non-expired
     * Currently always returns true (no expiration implemented)
     * 
     * @return true (account never expires)
     */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    /**
     * Check if account is non-locked
     * Currently always returns true (no account locking implemented)
     * 
     * @return true (account is never locked)
     */
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    /**
     * Check if credentials are non-expired
     * Currently always returns true (no credential expiration implemented)
     * 
     * @return true (credentials never expire)
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    /**
     * Check if account is enabled
     * 
     * @return enabled field value
     */
    @Override
    public boolean isEnabled() {
        return enabled;
    }
    
    /**
     * User Role Enumeration
     * Defines the three user roles in the system
     */
    public enum Role {
        ADMIN,       // System administrator
        EMPLOYER,    // Company owner/employer
        JOB_SEEKER   // Job applicant
    }
}

