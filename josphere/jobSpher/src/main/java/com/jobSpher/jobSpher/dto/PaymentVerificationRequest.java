package com.jobSpher.jobSpher.dto;

import com.jobSpher.jobSpher.model.ManualPayment;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentVerificationRequest {
    @NotNull(message = "Status is required")
    private ManualPayment.PaymentStatus status;
    
    private String adminNotes;
}

