package com.jobSpher.jobSpher.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.transaction.annotation.Transactional;

import com.jobSpher.jobSpher.dto.JobRequest;
import com.jobSpher.jobSpher.model.Company;
import com.jobSpher.jobSpher.model.Job;
import com.jobSpher.jobSpher.model.User;
import com.jobSpher.jobSpher.repository.UserRepository;
import com.jobSpher.jobSpher.service.CompanyService;
import com.jobSpher.jobSpher.service.JobService;
import com.jobSpher.jobSpher.service.FileStorageService;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import jakarta.validation.Valid;

/**
 * Job Controller
 * 
 * Handles all job-related endpoints including job creation, search, retrieval, and management.
 * Supports role-based access control where employers can create and manage jobs,
 * while all users (including anonymous) can search and view job details.
 * 
 * Base URL: /api/jobs
 * 
 * @author JobSpher Team
 * @version 1.0
 */
@RestController
@RequestMapping("/api/jobs")
public class JobController {
    
    @Autowired
    private JobService jobService;
    
    @Autowired
    private CompanyService companyService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    /**
     * Create a new job posting
     * 
     * Allows authenticated employers to create job postings.
     * The job will be created with status PENDING_APPROVAL and requires admin approval
     * before it becomes visible to job seekers.
     * 
     * Required Role: EMPLOYER
     * 
     * @param request JobRequest containing job details (title, description, category, location, salary, etc.)
     * @return ResponseEntity containing the created Job entity
     * @throws RuntimeException if employer doesn't have a company registered
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Job> createJob(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam("location") String location,
            @RequestParam(value = "employmentType", required = false) String employmentType,
            @RequestParam(value = "minSalary", required = false) BigDecimal minSalary,
            @RequestParam(value = "maxSalary", required = false) BigDecimal maxSalary,
            @RequestParam(value = "requirements", required = false) String requirements,
            @RequestParam(value = "responsibilities", required = false) String responsibilities,
            @RequestParam("paymentProof") MultipartFile paymentProof) {
        
        // Store payment proof
        if (!fileStorageService.isValidFileType(paymentProof, new String[]{"image/", "application/pdf"})) {
            throw new RuntimeException("Invalid file type. Only images and PDFs allowed.");
        }
        
        String proofPath;
        try {
            proofPath = fileStorageService.storeFile(paymentProof, "payments");
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to store payment proof: " + e.getMessage());
        }

        JobRequest request = new JobRequest();
        request.setTitle(title);
        request.setDescription(description);
        request.setCategory(category);
        request.setLocation(location);
        request.setEmploymentType(employmentType);
        request.setMinSalary(minSalary);
        request.setMaxSalary(maxSalary);
        request.setRequirements(requirements);
        request.setResponsibilities(responsibilities);

        User employer = getCurrentUserFromContext();
        Job job = jobService.createJob(employer, request, proofPath);
        return ResponseEntity.ok(job);
    }
    
    /**
     * Search and filter jobs
     * 
     * Public endpoint that allows searching and filtering jobs by various criteria.
     * Returns paginated results. Only jobs with status ACTIVE are returned.
     * 
     * Query Parameters:
     * - keyword: Search term for job title or description
     * - category: Filter by job category
     * - location: Filter by job location
     * - minSalary: Minimum salary filter
     * - maxSalary: Maximum salary filter
     * - page: Page number (default: 0)
     * - size: Number of results per page (default: 10)
     * 
     * @param keyword Optional search keyword
     * @param category Optional category filter
     * @param location Optional location filter
     * @param minSalary Optional minimum salary filter
     * @param maxSalary Optional maximum salary filter
     * @param page Page number (0-indexed)
     * @param size Page size
     * @return ResponseEntity containing a Page of Job entities
     */
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<Page<Job>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) BigDecimal minSalary,
            @RequestParam(required = false) BigDecimal maxSalary,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            // Validate pagination parameters
            if (page < 0) {
                throw new RuntimeException("Page number must be >= 0");
            }
            if (size <= 0 || size > 100) {
                throw new RuntimeException("Page size must be between 1 and 100");
            }
            
            Pageable pageable = PageRequest.of(page, size);
            Page<Job> jobs = jobService.searchJobs(keyword, category, location, minSalary, maxSalary, pageable);
            return ResponseEntity.ok(jobs);
        } catch (Exception e) {
            e.printStackTrace(); // Log the full stack trace
            throw new RuntimeException("Failed to search jobs: " + e.getMessage(), e);
        }
    }
    
    /**
     * Get job details by ID
     * 
     * Public endpoint to retrieve detailed information about a specific job.
     * 
     * @param id Job ID
     * @return ResponseEntity containing the Job entity
     * @throws RuntimeException if job not found
     */
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<Job> getJobById(@PathVariable Long id) {
        Job job = jobService.getJobById(id);
        return ResponseEntity.ok(job);
    }
    
    /**
     * Get all jobs posted by the current employer
     * 
     * Returns all jobs (regardless of status) posted by the authenticated employer.
     * 
     * Required Role: EMPLOYER
     * 
     * @return ResponseEntity containing a List of Job entities
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<List<Job>> getMyJobs() {
        User employer = getCurrentUserFromContext();
        Company company = companyService.getCompanyByEmployer(employer);
        List<Job> jobs = jobService.getJobsByCompany(company);
        return ResponseEntity.ok(jobs);
    }
    
    /**
     * Update an existing job posting
     * 
     * Allows employers to update their own job postings.
     * 
     * Required Role: EMPLOYER
     * 
     * @param id Job ID
     * @param request JobRequest containing updated job details
     * @return ResponseEntity containing the updated Job entity
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Job> updateJob(@PathVariable Long id, @Valid @RequestBody JobRequest request) {
        User employer = getCurrentUserFromContext();
        Job job = jobService.updateJob(id, employer, request);
        return ResponseEntity.ok(job);
    }
    
    /**
     * Close a job posting
     * 
     * Allows employers to close their own job postings (soft delete/close).
     * Closed jobs are no longer visible in general searches.
     * 
     * Required Role: EMPLOYER
     * 
     * @param id Job ID
     * @return ResponseEntity containing the updated Job entity with status CLOSED
     */
    @PutMapping("/{id}/close")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Job> closeJob(@PathVariable Long id) {
        User employer = getCurrentUserFromContext();
        Job job = jobService.closeJob(id, employer);
        return ResponseEntity.ok(job);
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

