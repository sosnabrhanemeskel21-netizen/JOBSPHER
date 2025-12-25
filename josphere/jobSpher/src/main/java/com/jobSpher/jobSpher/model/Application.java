package com.jobSpher.jobSpher.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Application entity representing job applications from job seekers
 */
@Entity
@Table(name = "applications", indexes = {
    @Index(name = "idx_job_id", columnList = "job_id"),
    @Index(name = "idx_job_seeker_id", columnList = "job_seeker_id"),
    @Index(name = "idx_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Application {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
//    @Column(nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;
    
//    @Column(nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_seeker_id", nullable = false)
    private User jobSeeker;
    
    @Column(nullable = false)
    private String resumePath;
    
    @Column(columnDefinition = "TEXT")
    private String coverLetter;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ApplicationStatus status = ApplicationStatus.SUBMITTED;
    
    @Column(columnDefinition = "TEXT")
    private String employerNotes;
    
    @Column(nullable = false)
    private LocalDateTime appliedAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        appliedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum ApplicationStatus {
        SUBMITTED,
        SHORTLISTED,
        REJECTED,
        HIRED
    }
}

