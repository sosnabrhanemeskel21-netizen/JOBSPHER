package com.jobSpher.jobSpher.controller;

import com.jobSpher.jobSpher.dto.ApplicationRequest;
import com.jobSpher.jobSpher.dto.ApplicationStatusUpdateRequest;
import com.jobSpher.jobSpher.model.Application;
import com.jobSpher.jobSpher.model.Job;
import com.jobSpher.jobSpher.model.User;
import com.jobSpher.jobSpher.repository.UserRepository;
import com.jobSpher.jobSpher.service.ApplicationService;
import com.jobSpher.jobSpher.service.FileStorageService;
import com.jobSpher.jobSpher.service.JobService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Application Controller
 * 
 * Handles job application endpoints including creating applications, retrieving applications,
 * and updating application status. Supports role-based operations for both job seekers and employers.
 * 
 * Base URL: /api/applications
 * 
 * @author JobSpher Team
 * @version 1.0
 */
@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:3000") // CORS configuration - should be moved to SecurityConfig in production
public class ApplicationController {
    
    @Autowired
    private ApplicationService applicationService;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @Autowired
    private JobService jobService;
    
    @Autowired
    private UserRepository userRepository;
    
    // Allowed MIME types for resume uploads (PDF and Word documents)
    private static final String[] ALLOWED_RESUME_TYPES = {"application/pdf", "application/msword", 
                                                          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"};
    
    /**
     * Create a new job application
     * 
     * Allows job seekers to apply for a job by submitting a resume and optional cover letter.
     * If a resume file is provided, it will be uploaded and stored. Otherwise, the user's
     * existing resume (from their profile) will be used. If no resume exists, an error is thrown.
     * 
     * Required Role: JOB_SEEKER
     * 
     * @param jobId ID of the job to apply for
     * @param resume Optional MultipartFile containing the resume (PDF or DOC/DOCX)
     * @param coverLetter Optional cover letter text
     * @return ResponseEntity containing the created Application entity
     * @throws RuntimeException if resume is invalid/missing, file type is not allowed, or file storage fails
     */
    @PostMapping
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<Application> createApplication(
            @RequestParam("jobId") Long jobId,
            @RequestParam(value = "resume", required = false) MultipartFile resume,
            @RequestParam(value = "coverLetter", required = false) String coverLetter) {
        
        User jobSeeker = getCurrentUserFromContext();
        
        // Get resume path - either from upload or user's existing resume
        String resumePath;
        if (resume != null && !resume.isEmpty()) {
            // Validate file type before storing
            if (!fileStorageService.isValidFileType(resume, ALLOWED_RESUME_TYPES)) {
                throw new RuntimeException("Invalid resume file type. Only PDF and DOC/DOCX are allowed.");
            }
            try {
                resumePath = fileStorageService.storeFile(resume, "resumes");
            } catch (java.io.IOException e) {
                throw new RuntimeException("Failed to store resume: " + e.getMessage());
            }
        } else {
            // Use user's existing resume if available
            resumePath = jobSeeker.getResumePath();
            if (resumePath == null) {
                throw new RuntimeException("Resume is required");
            }
        }
        
        ApplicationRequest request = new ApplicationRequest();
        request.setJobId(jobId);
        request.setCoverLetter(coverLetter);
        
        Application application = applicationService.createApplication(jobSeeker, request, resumePath);
        return ResponseEntity.ok(application);
    }
    
    /**
     * Get all applications submitted by the current job seeker
     * 
     * Returns all job applications made by the authenticated job seeker,
     * regardless of application status.
     * 
     * Required Role: JOB_SEEKER
     * 
     * @return ResponseEntity containing a List of Application entities
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<List<Application>> getMyApplications() {
        User jobSeeker = getCurrentUserFromContext();
        List<Application> applications = applicationService.getApplicationsByJobSeeker(jobSeeker);
        return ResponseEntity.ok(applications);
    }
    
    /**
     * Get all applications for a specific job
     * 
     * Allows employers to view all applications received for a specific job posting.
     * Only the employer who owns the job can access this endpoint.
     * 
     * Required Role: EMPLOYER
     * 
     * @param jobId ID of the job
     * @return ResponseEntity containing a List of Application entities
     * @throws RuntimeException if job not found or employer doesn't own the job
     */
    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<List<Application>> getApplicationsByJob(@PathVariable Long jobId) {
        User employer = getCurrentUserFromContext();
        Job job = jobService.getJobById(jobId);
        
        // Verify employer owns the job (authorization check)
        if (!job.getCompany().getEmployer().getId().equals(employer.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        List<Application> applications = applicationService.getApplicationsByJob(job);
        return ResponseEntity.ok(applications);
    }
    
    /**
     * Update application status
     * 
     * Allows employers to update the status of an application (e.g., SUBMITTED, SHORTLISTED, REJECTED, HIRED).
     * Only the employer who owns the job can update applications for that job.
     * 
     * Required Role: EMPLOYER
     * 
     * @param id Application ID
     * @param request ApplicationStatusUpdateRequest containing the new status and optional notes
     * @return ResponseEntity containing the updated Application entity
     * @throws RuntimeException if application not found or employer doesn't own the job
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Application> updateApplicationStatus(
            @PathVariable Long id,
            @Valid @RequestBody ApplicationStatusUpdateRequest request) {
        User employer = getCurrentUserFromContext();
        Application application = applicationService.updateApplicationStatus(id, employer, request);
        return ResponseEntity.ok(application);
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

