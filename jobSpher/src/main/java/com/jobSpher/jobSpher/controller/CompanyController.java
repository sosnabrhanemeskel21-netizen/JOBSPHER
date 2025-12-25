package com.jobSpher.jobSpher.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobSpher.jobSpher.dto.CompanyRequest;
import com.jobSpher.jobSpher.model.Company;
import com.jobSpher.jobSpher.model.User;
import com.jobSpher.jobSpher.repository.UserRepository;
import com.jobSpher.jobSpher.service.CompanyService;

import jakarta.validation.Valid;

/**
 * Company Controller
 * 
 * Handles company profile management endpoints for employers.
 * Each employer can create, retrieve, and update their company profile.
 * Company registration is required before employers can post jobs.
 * 
 * Base URL: /api/companies
 * 
 * @author JobSpher Team
 * @version 1.0
 */
@RestController
@RequestMapping("/api/companies")
@CrossOrigin(origins = "http://localhost:3000") // CORS configuration - should be moved to SecurityConfig in production
public class CompanyController {
    
    @Autowired
    private CompanyService companyService;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Create a new company profile
     * 
     * Allows authenticated employers to register their company profile.
     * Company information includes name, description, industry, website, address, etc.
     * Each employer can only have one company profile.
     * 
     * Required Role: EMPLOYER
     * 
     * @param request CompanyRequest containing company details
     * @return ResponseEntity containing the created Company entity
     * @throws RuntimeException if employer already has a company registered
     */
    @PostMapping
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Company> createCompany(@Valid @RequestBody CompanyRequest request) {
        User employer = getCurrentUserFromContext();
        Company company = companyService.createCompany(employer, request);
        return ResponseEntity.ok(company);
    }
    
    /**
     * Get the current employer's company profile
     * 
     * Returns the company profile associated with the authenticated employer.
     * 
     * Required Role: EMPLOYER
     * 
     * @return ResponseEntity containing the Company entity
     * @throws RuntimeException if employer doesn't have a company registered
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Company> getMyCompany() {
        User employer = getCurrentUserFromContext();
        Company company = companyService.getCompanyByEmployer(employer);
        return ResponseEntity.ok(company);
    }
    
    /**
     * Update the current employer's company profile
     * 
     * Allows employers to update their company information.
     * All fields in the request will be updated.
     * 
     * Required Role: EMPLOYER
     * 
     * @param request CompanyRequest containing updated company details
     * @return ResponseEntity containing the updated Company entity
     * @throws RuntimeException if employer doesn't have a company registered
     */
    @PutMapping("/my")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Company> updateMyCompany(@Valid @RequestBody CompanyRequest request) {
        User employer = getCurrentUserFromContext();
        Company company = companyService.updateCompany(employer, request);
        return ResponseEntity.ok(company);
    }
    
    /**
     * Helper method to extract the currently authenticated user from Spring Security context
     * 
     * @return User entity of the authenticated user
     * @throws RuntimeException if user is not found in database
     */
    private User getCurrentUserFromContext() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}

