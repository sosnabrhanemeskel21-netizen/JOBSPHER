package com.jobSpher.jobSpher.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobSpher.jobSpher.dto.JobRequest;
import com.jobSpher.jobSpher.model.Company;
import com.jobSpher.jobSpher.model.Job;
import com.jobSpher.jobSpher.model.User;
import com.jobSpher.jobSpher.repository.JobRepository;

/**
 * Service for job management
 */
@Service
public class JobService {
    
    @Autowired
    private JobRepository jobRepository;
    
    @Autowired
    private CompanyService companyService;
    
    @Autowired
    private NotificationService notificationService;
    
    @Transactional
    public Job createJob(User employer, JobRequest request) {
        Company company = companyService.getCompanyByEmployer(employer);
        
        if (!company.getPaymentVerified()) {
            throw new RuntimeException("Company payment must be verified before posting jobs");
        }
        
        Job job = new Job();
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setCategory(request.getCategory());
        job.setLocation(request.getLocation());
        job.setEmploymentType(request.getEmploymentType());
        job.setMinSalary(request.getMinSalary());
        job.setMaxSalary(request.getMaxSalary());
        job.setRequirements(request.getRequirements());
        job.setResponsibilities(request.getResponsibilities());
        job.setCompany(company);
        job.setStatus(Job.JobStatus.PENDING_APPROVAL);
        
        return jobRepository.save(job);
    }
    
    @Transactional(readOnly = true)
    public Page<Job> searchJobs(String keyword, String category, String location, 
                                BigDecimal minSalary, BigDecimal maxSalary, Pageable pageable) {
        Page<Job> jobs = jobRepository.searchJobs(keyword, category, location, minSalary, maxSalary, pageable);
        // Relationships are eagerly fetched by EntityGraph, but ensure nested company.employer is loaded
        jobs.getContent().forEach(job -> {
            if (job.getCompany() != null) {
                job.getCompany().getName(); // Initialize company
                // Initialize nested employer relationship
                if (job.getCompany().getEmployer() != null) {
                    job.getCompany().getEmployer().getEmail();
                }
            }
            if (job.getApprovedBy() != null) {
                job.getApprovedBy().getEmail(); // Initialize approvedBy
            }
        });
        return jobs;
    }
    
    public Job getJobById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
    }
    
    public List<Job> getJobsByCompany(Company company) {
        return jobRepository.findByCompany(company);
    }
    
    @Transactional(readOnly = true)
    public List<Job> getPendingJobs() {
        // Use custom query to fetch all relationships including nested company.employer
        List<Job> jobs = jobRepository.findPendingJobsWithRelations(Job.JobStatus.PENDING_APPROVAL);
        // All relationships should be eagerly fetched by the query
        return jobs != null ? jobs : java.util.Collections.emptyList();
    }
    
    @Transactional
    public Job approveJob(Long jobId, User admin) {
        Job job = getJobById(jobId);
        
        // Check if job is already processed
        if (job.getStatus() != Job.JobStatus.PENDING_APPROVAL) {
            throw new RuntimeException("Job has already been processed. Current status: " + job.getStatus());
        }
        
        job.setStatus(Job.JobStatus.ACTIVE);
        job.setApprovedBy(admin);
        job.setPublishedAt(LocalDateTime.now());
        
        Job savedJob = jobRepository.save(job);
        
        // Notify employer
        notificationService.createNotification(
            job.getCompany().getEmployer(),
            "Job Approved",
            "Your job posting '" + job.getTitle() + "' has been approved and is now live.",
            "JOB_APPROVED",
            "/jobs/" + savedJob.getId()
        );
        
        return savedJob;
    }
    
    @Transactional
    public Job rejectJob(Long jobId, User admin, String reason) {
        Job job = getJobById(jobId);
        
        // Check if job is already processed
        if (job.getStatus() != Job.JobStatus.PENDING_APPROVAL) {
            throw new RuntimeException("Job has already been processed. Current status: " + job.getStatus());
        }
        
        // Validate rejection reason
        if (reason == null || reason.trim().isEmpty()) {
            throw new RuntimeException("Rejection reason is required");
        }
        
        job.setStatus(Job.JobStatus.REJECTED);
        job.setApprovedBy(admin);
        job.setRejectionReason(reason);
        
        Job savedJob = jobRepository.save(job);
        
        // Notify employer
        notificationService.createNotification(
            job.getCompany().getEmployer(),
            "Job Rejected",
            "Your job posting '" + job.getTitle() + "' has been rejected. Reason: " + reason,
            "JOB_REJECTED",
            "/jobs/" + savedJob.getId()
        );
        
        return savedJob;
    }
}

