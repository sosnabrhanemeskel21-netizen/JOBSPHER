package com.jobSpher.jobSpher.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CompanyRequest {
    @NotBlank(message = "Company name is required")
    private String name;
    
    private String description;
    private String industry;
    private String website;
    @NotBlank(message = "Address is required")
    private String address;
    private String phoneNumber;
}

