package com.jobSpher.jobSpher.dto;

import com.jobSpher.jobSpher.model.Application;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApplicationStatusUpdateRequest {
    @NotNull(message = "Status is required")
    private Application.ApplicationStatus status;
    
    private String employerNotes;
}

