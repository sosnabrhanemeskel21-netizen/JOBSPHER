package com.jobSpher.jobSpher.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Job Entity
 * 
 * Represents a job posting created by employers. Jobs go through an approval workflow:
 * 1. Created by employer with status PENDING_APPROVAL
 * 2. Reviewed by admin
 * 3. Approved (status: ACTIVE) or Rejected (status: REJECTED)
 * 4. Active jobs are visible to job seekers
 * 5. Jobs can be closed by employer (status: CLOSED)
 * 
 * Indexed on frequently queried fields for performance:
 * - company_id: For employer job listings
 * - status: For filtering active/pending jobs
 * - title, category, location: For job search functionality
 * 
 * @author JobSpher Team
 * @version 1.0
 */
@Entity
@Table(name = "jobs", indexes = {
    @Index(name = "idx_company_id", columnList = "company_id"), // Fast lookup by company
    @Index(name = "idx_status", columnList = "status"),         // Fast filtering by status
    @Index(name = "idx_title", columnList = "title"),           // Fast title search
    @Index(name = "idx_category", columnList = "category"),     // Fast category filtering
    @Index(name = "idx_location", columnList = "location")      // Fast location filtering
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Job {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 255)
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.VARCHAR)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.LONGVARCHAR)
    private String description;
    
    @Column(nullable = false, length = 255)
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.VARCHAR)
    private String category;
    
    @Column(nullable = false, length = 255)
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.VARCHAR)
    private String location;
    
    private String employmentType; // Employment type: FULL_TIME, PART_TIME, CONTRACT, etc.
    
    private BigDecimal minSalary; // Minimum salary (optional)
    
    private BigDecimal maxSalary; // Maximum salary (optional)
    
    @Column(columnDefinition = "TEXT")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.LONGVARCHAR)
    private String requirements; 
    
    @Column(columnDefinition = "TEXT")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.LONGVARCHAR)
    private String responsibilities; 
    
    private String paymentProofPath;
    
    // Relationship to Company (many jobs belong to one company)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private JobStatus status = JobStatus.PENDING_APPROVAL; // Default status: pending admin approval
    
    // Relationship to User (admin who approved/rejected the job)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;
    
    private String rejectionReason; // Reason for rejection (if rejected by admin)
    
    @Column(nullable = false)
    private LocalDateTime createdAt; // Job creation timestamp
    
    private LocalDateTime updatedAt; // Last update timestamp
    
    private LocalDateTime publishedAt; // Timestamp when job was published (approved)
    
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
    
    /**
     * Job Status Enumeration
     * Represents the lifecycle states of a job posting
     */
    public enum JobStatus {
        PENDING_APPROVAL, // Initial state: waiting for admin approval
        ACTIVE,           // Approved and visible to job seekers
        REJECTED,         // Rejected by admin
        CLOSED            // Closed by employer (no longer accepting applications)
    }
}

