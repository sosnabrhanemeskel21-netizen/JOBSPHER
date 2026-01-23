package com.jobSpher.jobSpher.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.jobSpher.jobSpher.model.ManualPayment;
import com.jobSpher.jobSpher.model.User;
import com.jobSpher.jobSpher.repository.UserRepository;
import com.jobSpher.jobSpher.service.FileStorageService;
import com.jobSpher.jobSpher.service.PaymentService;

/**
 * Payment Controller
 * 
 * Handles payment verification document uploads for employers.
 * Employers must upload payment proof documents to verify their payment status
 * before they can post jobs. Admin users review and verify these payments.
 * 
 * Base URL: /api/payments
 * 
 * @author JobSpher Team
 * @version 1.0
 */
@RestController
@RequestMapping("/api/payments")
@org.springframework.web.bind.annotation.CrossOrigin
public class PaymentController {
    
    @Autowired
    private PaymentService paymentService;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @Autowired
    private UserRepository userRepository;
    
    // Allowed file types for payment proof documents (images and PDFs)
    private static final String[] ALLOWED_TYPES = {"image/", "application/pdf"};
    
    /**
     * Upload payment verification document
     * 
     * Allows employers to upload payment proof documents (receipts, invoices, etc.)
     * along with a reference number. The payment will be created with status PENDING_REVIEW
     * and requires admin verification before the employer's company payment status is updated.
     * 
     * Required Role: EMPLOYER
     * 
     * @param file MultipartFile containing the payment proof document (image or PDF)
     * @param referenceNumber Payment reference number from the payment provider
     * @return ResponseEntity containing payment ID, status, and success message
     * @throws RuntimeException if file type is invalid or file storage fails
     */
    @PostMapping(path = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Map<String, Object>> uploadPayment(
            @RequestParam("file") MultipartFile file,
            @RequestParam("referenceNumber") String referenceNumber) {
        
        User employer = getCurrentUserFromContext();
        
        // Validate file type before processing
        if (!fileStorageService.isValidFileType(file, ALLOWED_TYPES)) {
            throw new RuntimeException("Invalid file type. Only images and PDFs are allowed.");
        }
        
        // Store the payment proof file
        String filePath;
        try {
            filePath = fileStorageService.storeFile(file, "payments");
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage());
        }
        
        // Create payment record
        ManualPayment payment = paymentService.uploadPayment(employer, filePath, referenceNumber);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Payment proof uploaded successfully. Admin will verify within 24-48 hours.");
        response.put("paymentId", payment.getId());
        response.put("status", payment.getStatus());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get payment verification status
     * 
     * Returns the status of the latest payment verification submission for the employer.
     * Useful for displaying payment status in the employer dashboard.
     * 
     * Required Role: EMPLOYER
     * 
     * @return ResponseEntity containing payment status, upload date, and admin notes (if any)
     */
    @GetMapping("/status")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Map<String, Object>> getPaymentStatus() {
        User employer = getCurrentUserFromContext();
        ManualPayment latestPayment = paymentService.getLatestPaymentByEmployer(employer);
        
        Map<String, Object> response = new HashMap<>();
        if (latestPayment != null) {
            response.put("status", latestPayment.getStatus());
            response.put("uploadDate", latestPayment.getUploadDate());
            response.put("adminNotes", latestPayment.getAdminNotes());
            response.put("filePath", latestPayment.getFilePath());
            response.put("referenceNumber", latestPayment.getReferenceNumber());
        } else {
            response.put("status", "NO_PAYMENT");
            response.put("message", "No payment proof uploaded yet");
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all payment submissions for current employer
     * 
     * Returns a list of all payment verification submissions made by the employer,
     * including their status and history.
     * 
     * Required Role: EMPLOYER
     * 
     * @return ResponseEntity containing a List of ManualPayment entities
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<List<ManualPayment>> getMyPayments() {
        User employer = getCurrentUserFromContext();
        List<ManualPayment> payments = paymentService.getPaymentsByEmployer(employer);
        return ResponseEntity.ok(payments);
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

