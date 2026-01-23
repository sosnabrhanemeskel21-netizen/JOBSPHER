package com.jobSpher.jobSpher.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ManualPayment entity for employer payment proof uploads
 */
@Entity
@Table(name = "manual_payments", indexes = {
    @Index(name = "idx_employer_id", columnList = "employer_id"),
    @Index(name = "idx_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManualPayment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
//    @Column(nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", nullable = false)
    private User employer;
    
    @Column(nullable = false)
    private String filePath;
    
    @Column(nullable = false)
    private String referenceNumber;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PaymentStatus status = PaymentStatus.PENDING_REVIEW;
    
    @Column(columnDefinition = "TEXT")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.LONGVARCHAR)
    private String adminNotes; // Admin can add notes when verifying
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy; // Admin who verified/rejected
    
    @Column(nullable = false)
    private LocalDateTime uploadDate;
    
    private LocalDateTime verifiedDate;
    
    @PrePersist
    protected void onCreate() {
        uploadDate = LocalDateTime.now();
    }
    
    public enum PaymentStatus {
        PENDING_REVIEW,
        VERIFIED,
        REJECTED
    }
}

