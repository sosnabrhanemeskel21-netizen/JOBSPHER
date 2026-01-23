package com.jobSpher.jobSpher.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;

import com.jobSpher.jobSpher.dto.PaymentVerificationRequest;
import com.jobSpher.jobSpher.model.Job;
import com.jobSpher.jobSpher.model.ManualPayment;
import com.jobSpher.jobSpher.model.User;
import com.jobSpher.jobSpher.model.User.Role;
import com.jobSpher.jobSpher.repository.UserRepository;
import com.jobSpher.jobSpher.repository.JobRepository;
import com.jobSpher.jobSpher.repository.ApplicationRepository;
import com.jobSpher.jobSpher.repository.CompanyRepository;
import com.jobSpher.jobSpher.service.JobService;
import com.jobSpher.jobSpher.service.PaymentService;
import java.util.Map;
import java.util.HashMap;

import jakarta.validation.Valid;

/**
 * Admin Controller
 * 
 * Handles administrative operations including job approval/rejection and payment verification.
 * All endpoints in this controller require ADMIN role. These operations are critical for
 * maintaining the quality and integrity of job postings on the platform.
 * 
 * Base URL: /api/admin
 * 
 * @author JobSpher Team
 * @version 1.0
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {
    
    @Autowired
    private PaymentService paymentService;
    
    @Autowired
    private JobService jobService;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private CompanyRepository companyRepository;
    
    /**
     * Get all pending payment verifications
     * 
     * Returns a list of all payment verification requests that are pending review.
     * Employers upload payment proof documents which need admin verification before
     * they can post jobs.
     * 
     * Required Role: ADMIN
     * 
     * @return ResponseEntity containing a List of ManualPayment entities with status PENDING_REVIEW
     */
    @GetMapping("/payments")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ManualPayment>> getPendingPayments() {
        try {
            List<ManualPayment> payments = paymentService.getPendingPayments();
            // Initialize lazy-loaded relationships to avoid serialization issues
            payments.forEach(payment -> {
                if (payment.getEmployer() != null) {
                    payment.getEmployer().getEmail(); // Trigger lazy loading
                }
                if (payment.getVerifiedBy() != null) {
                    payment.getVerifiedBy().getEmail(); // Trigger lazy loading
                }
            });
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve pending payments: " + e.getMessage(), e);
        }
    }
    
    /**
     * Get payment verification details by ID
     * 
     * Retrieves detailed information about a specific payment verification request.
     * 
     * Required Role: ADMIN
     * 
     * @param id Payment verification ID
     * @return ResponseEntity containing the ManualPayment entity
     * @throws RuntimeException if payment not found
     */
    @GetMapping("/payments/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ManualPayment> getPaymentById(@PathVariable Long id) {
        ManualPayment payment = paymentService.getPaymentById(id);
        return ResponseEntity.ok(payment);
    }
    
    /**
     * Verify or reject a payment
     * 
     * Allows admins to verify or reject payment verification requests.
     * When verified, the employer's company payment status is updated to verified,
     * allowing them to post jobs. If rejected, admin can provide notes explaining the reason.
     * 
     * Required Role: ADMIN
     * 
     * @param id Payment verification ID
     * @param request PaymentVerificationRequest containing verification status and optional admin notes
     * @return ResponseEntity containing the updated ManualPayment entity
     * @throws RuntimeException if payment not found or already processed
     */
    @PutMapping("/payments/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<ManualPayment> verifyPayment(
            @PathVariable Long id,
            @Valid @RequestBody PaymentVerificationRequest request) {
        try {
            User admin = getCurrentUserFromContext();
            ManualPayment payment = paymentService.verifyPayment(id, admin, request);
            // Initialize lazy-loaded relationships
            if (payment.getEmployer() != null) {
                payment.getEmployer().getEmail();
            }
            if (payment.getVerifiedBy() != null) {
                payment.getVerifiedBy().getEmail();
            }
            return ResponseEntity.ok(payment);
        } catch (RuntimeException e) {
            throw new RuntimeException("Failed to verify payment: " + e.getMessage(), e);
        }
    }
    
    /**
     * Get all pending job approvals
     * 
     * Returns a list of all jobs that are pending admin approval.
     * New jobs created by employers start with status PENDING_APPROVAL and must be
     * approved by an admin before becoming visible to job seekers.
     * 
     * Required Role: ADMIN
     * 
     * @return ResponseEntity containing a List of Job entities with status PENDING_APPROVAL
     */
    @GetMapping("/jobs/pending")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Job>> getPendingJobs() {
        try {
            List<Job> jobs = jobService.getPendingJobs();
            // Relationships are already eagerly fetched by the custom query
            // Ensure all relationships are initialized for JSON serialization
            if (jobs != null) {
                jobs.forEach(job -> {
                    // Access nested relationships to ensure they're loaded
                    if (job.getCompany() != null) {
                        job.getCompany().getName();
                        if (job.getCompany().getEmployer() != null) {
                            job.getCompany().getEmployer().getEmail();
                        }
                    }
                });
            }
            return ResponseEntity.ok(jobs != null ? jobs : java.util.Collections.emptyList());
        } catch (Exception e) {
            e.printStackTrace(); // Log the full stack trace
            throw new RuntimeException("Failed to retrieve pending jobs: " + e.getMessage(), e);
        }
    }
    
    /**
     * Approve a job posting
     * 
     * Approves a pending job posting, changing its status to ACTIVE and making it
     * visible to job seekers. The admin who approved the job is recorded.
     * 
     * Required Role: ADMIN
     * 
     * @param id Job ID
     * @return ResponseEntity containing the updated Job entity with status ACTIVE
     * @throws RuntimeException if job not found or already processed
     */
    @PutMapping("/jobs/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<Job> approveJob(@PathVariable Long id) {
        try {
            User admin = getCurrentUserFromContext();
            Job job = jobService.approveJob(id, admin);
            // Initialize lazy-loaded relationships
            if (job.getCompany() != null) {
                job.getCompany().getName();
                if (job.getCompany().getEmployer() != null) {
                    job.getCompany().getEmployer().getEmail();
                }
            }
            if (job.getApprovedBy() != null) {
                job.getApprovedBy().getEmail();
            }
            return ResponseEntity.ok(job);
        } catch (RuntimeException e) {
            throw new RuntimeException("Failed to approve job: " + e.getMessage(), e);
        }
    }
    
    /**
     * Reject a job posting
     * 
     * Rejects a pending job posting, changing its status to REJECTED.
     * A rejection reason must be provided, which will be visible to the employer.
     * 
     * Required Role: ADMIN
     * 
     * @param id Job ID
     * @param reason Reason for rejection (required)
     * @return ResponseEntity containing the updated Job entity with status REJECTED
     * @throws RuntimeException if job not found or already processed
     */
    @PutMapping("/jobs/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<Job> rejectJob(
            @PathVariable Long id,
            @RequestParam String reason) {
        try {
            if (reason == null || reason.trim().isEmpty()) {
                throw new RuntimeException("Rejection reason is required");
            }
            User admin = getCurrentUserFromContext();
            Job job = jobService.rejectJob(id, admin, reason);
            // Initialize lazy-loaded relationships
            if (job.getCompany() != null) {
                job.getCompany().getName();
                if (job.getCompany().getEmployer() != null) {
                    job.getCompany().getEmployer().getEmail();
                }
            }
            if (job.getApprovedBy() != null) {
                job.getApprovedBy().getEmail();
            }
            return ResponseEntity.ok(job);
        } catch (RuntimeException e) {
            throw new RuntimeException("Failed to reject job: " + e.getMessage(), e);
        }
    }
    
    /**
     * Get all users by role
     * 
     * Returns a list of all users with the specified role (EMPLOYER or JOB_SEEKER).
     * Useful for admin to manage and verify user accounts.
     * 
     * Required Role: ADMIN
     * 
     * @param role User role (EMPLOYER or JOB_SEEKER)
     * @return ResponseEntity containing a List of User entities with the specified role
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<User>> getUsersByRole(@RequestParam Role role) {
        List<User> users = userRepository.findByRole(role);
        return ResponseEntity.ok(users);
    }
    
    /**
     * Get user by ID
     * 
     * Retrieves detailed information about a specific user.
     * 
     * Required Role: ADMIN
     * 
     * @param id User ID
     * @return ResponseEntity containing the User entity
     * @throws RuntimeException if user not found
     */
    @GetMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }
    
    /**
     * Activate or deactivate a user account
     * 
     * Allows admins to enable or disable user accounts. When disabled, users cannot
     * log in or perform actions on the platform.
     * 
     * Required Role: ADMIN
     * 
     * @param id User ID
     * @param enabled true to activate, false to deactivate
     * @return ResponseEntity containing the updated User entity
     * @throws RuntimeException if user not found
     */
    @PutMapping("/users/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUserStatus(
            @PathVariable Long id,
            @RequestParam Boolean enabled) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(enabled);
        user = userRepository.save(user);
        return ResponseEntity.ok(user);
    }
    
    /**
     * Get system-wide statistics
     * 
     * Returns counts of users, jobs, applications, and companies for the admin dashboard.
     * 
     * Required Role: ADMIN
     * 
     * @return ResponseEntity containing a Map of statistic categories and their counts
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // User counts
        stats.put("totalUsers", userRepository.count());
        stats.put("totalEmployers", userRepository.findByRole(User.Role.EMPLOYER).size());
        stats.put("totalJobSeekers", userRepository.findByRole(User.Role.JOB_SEEKER).size());
        
        // Job counts
        stats.put("totalJobs", jobRepository.count());
        stats.put("activeJobs", jobRepository.countByStatus(Job.JobStatus.ACTIVE));
        stats.put("pendingJobs", jobRepository.countByStatus(Job.JobStatus.PENDING_APPROVAL));
        
        // Other counts
        stats.put("totalApplications", applicationRepository.count());
        stats.put("totalCompanies", companyRepository.count());
        
        return ResponseEntity.ok(stats);
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

