package com.jobSpher.jobSpher.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobSpher.jobSpher.dto.PaymentVerificationRequest;
import com.jobSpher.jobSpher.model.Company;
import com.jobSpher.jobSpher.model.ManualPayment;
import com.jobSpher.jobSpher.model.User;
import com.jobSpher.jobSpher.repository.ManualPaymentRepository;

/**
 * Service for manual payment management
 */
@Service
public class PaymentService {
    
    @Autowired
    private ManualPaymentRepository paymentRepository;
    
    @Autowired
    private CompanyService companyService;
    
    @Autowired
    private NotificationService notificationService;
    
    @Transactional
    public ManualPayment uploadPayment(User employer, String filePath, String referenceNumber) {
        ManualPayment payment = new ManualPayment();
        payment.setEmployer(employer);
        payment.setFilePath(filePath);
        payment.setReferenceNumber(referenceNumber);
        payment.setStatus(ManualPayment.PaymentStatus.PENDING_REVIEW);
        
        ManualPayment saved = paymentRepository.save(payment);
        
        // Notify Admins
        List<User> admins = companyService.getAdmins(); // Assuming we add this helper or use userRepository
        for (User admin : admins) {
            notificationService.createNotification(
                admin,
                "New Payment Proof",
                "Employer " + employer.getEmail() + " uploaded payment proof for verification.",
                "NEW_PAYMENT",
                "/admin/payments"
            );
        }
        
        return saved;
    }
    
    public List<ManualPayment> getPaymentsByEmployer(User employer) {
        return paymentRepository.findByEmployer(employer);
    }
    
    public ManualPayment getLatestPaymentByEmployer(User employer) {
        return paymentRepository.findFirstByEmployerOrderByUploadDateDesc(employer)
                .orElse(null);
    }
    
    public List<ManualPayment> getPendingPayments() {
        return paymentRepository.findByStatus(ManualPayment.PaymentStatus.PENDING_REVIEW);
    }
    
    public ManualPayment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }
    
    @Transactional
    public ManualPayment verifyPayment(Long paymentId, User admin, PaymentVerificationRequest request) {
        ManualPayment payment = getPaymentById(paymentId);
        
        // Check if payment is already processed
        if (payment.getStatus() != ManualPayment.PaymentStatus.PENDING_REVIEW) {
            throw new RuntimeException("Payment has already been processed. Current status: " + payment.getStatus());
        }
        
        // Validate status
        if (request.getStatus() == null) {
            throw new RuntimeException("Payment status is required");
        }
        
        // Validate rejection reason if rejecting
        if (request.getStatus() == ManualPayment.PaymentStatus.REJECTED && 
            (request.getAdminNotes() == null || request.getAdminNotes().trim().isEmpty())) {
            throw new RuntimeException("Rejection reason is required when rejecting a payment");
        }
        
        payment.setStatus(request.getStatus());
        payment.setAdminNotes(request.getAdminNotes());
        payment.setVerifiedBy(admin);
        payment.setVerifiedDate(java.time.LocalDateTime.now());
        
        ManualPayment savedPayment = paymentRepository.save(payment);
        
        // Update company payment verified status
        if (request.getStatus() == ManualPayment.PaymentStatus.VERIFIED) {
            Company company = companyService.getCompanyByEmployer(payment.getEmployer());
            companyService.setPaymentVerified(
                company.getId(),
                true
            );
            
            // Notify employer
            notificationService.createNotification(
                payment.getEmployer(),
                "Payment Verified",
                "Your payment proof has been verified. You can now post jobs.",
                "PAYMENT_VERIFIED",
                "/payments/status"
            );
        } else if (request.getStatus() == ManualPayment.PaymentStatus.REJECTED) {
            notificationService.createNotification(
                payment.getEmployer(),
                "Payment Rejected",
                "Your payment proof has been rejected. " + (request.getAdminNotes() != null ? request.getAdminNotes() : ""),
                "PAYMENT_REJECTED",
                "/payments/status"
            );
        }
        
        return savedPayment;
    }
}

