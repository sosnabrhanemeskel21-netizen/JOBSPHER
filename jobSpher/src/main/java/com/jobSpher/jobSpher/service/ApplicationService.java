package com.jobSpher.jobSpher.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobSpher.jobSpher.dto.ApplicationRequest;
import com.jobSpher.jobSpher.dto.ApplicationStatusUpdateRequest;
import com.jobSpher.jobSpher.model.Application;
import com.jobSpher.jobSpher.model.Job;
import com.jobSpher.jobSpher.model.User;
import com.jobSpher.jobSpher.repository.ApplicationRepository;

/**
 * Service for job application management
 */
@Service
public class ApplicationService {
    
    @Autowired
    private ApplicationRepository applicationRepository;
    
    @Autowired
    private JobService jobService;
    
    @Autowired
    private NotificationService notificationService;
    
    @Transactional
    public Application createApplication(User jobSeeker, ApplicationRequest request, String resumePath) {
        Job job = jobService.getJobById(request.getJobId());
        
        if (job.getStatus() != Job.JobStatus.ACTIVE) {
            throw new RuntimeException("Cannot apply to a job that is not approved");
        }
        
        if (applicationRepository.existsByJobAndJobSeeker(job, jobSeeker)) {
            throw new RuntimeException("You have already applied to this job");
        }
        
        Application application = new Application();
        application.setJob(job);
        application.setJobSeeker(jobSeeker);
        application.setResumePath(resumePath);
        application.setCoverLetter(request.getCoverLetter());
        application.setStatus(Application.ApplicationStatus.SUBMITTED);
        
        Application savedApplication = applicationRepository.save(application);
        
        // Notify employer
        notificationService.createNotification(
            job.getCompany().getEmployer(),
            "New Application",
            jobSeeker.getFirstName() + " " + jobSeeker.getLastName() + " applied to '" + job.getTitle() + "'",
            "NEW_APPLICATION",
            "/applications/" + savedApplication.getId()
        );
        
        return savedApplication;
    }
    
    public List<Application> getApplicationsByJobSeeker(User jobSeeker) {
        return applicationRepository.findByJobSeeker(jobSeeker);
    }
    
    public List<Application> getApplicationsByJob(Job job) {
        return applicationRepository.findByJob(job);
    }
    
    public Application getApplicationById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
    }
    
    @Transactional
    public Application updateApplicationStatus(Long applicationId, User employer, ApplicationStatusUpdateRequest request) {
        Application application = getApplicationById(applicationId);
        
        // Verify employer owns the job
        if (!application.getJob().getCompany().getEmployer().getId().equals(employer.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        application.setStatus(request.getStatus());
        application.setEmployerNotes(request.getEmployerNotes());
        
        Application savedApplication = applicationRepository.save(application);
        
        // Notify job seeker
        String statusMessage = getStatusMessage(request.getStatus());
        notificationService.createNotification(
            application.getJobSeeker(),
            "Application Status Updated",
            "Your application for '" + application.getJob().getTitle() + "' has been " + statusMessage.toLowerCase(),
            "APPLICATION_STATUS_UPDATED",
            "/applications/" + savedApplication.getId()
        );
        
        return savedApplication;
    }
    
    private String getStatusMessage(Application.ApplicationStatus status) {
        return switch (status) {
            case SHORTLISTED -> "Shortlisted";
            case REJECTED -> "Rejected";
            case HIRED -> "Hired";
            default -> "Updated";
        };
    }
}

