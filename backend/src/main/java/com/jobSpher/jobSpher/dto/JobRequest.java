package com.jobSpher.jobSpher.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JobRequest {
    @NotBlank(message = "Job title is required")
    private String title;
    
    private String description;
    
    @NotBlank(message = "Category is required")
    private String category;
    
    @NotBlank(message = "Location is required")
    private String location;
    
    private String employmentType;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private String requirements;
    private String responsibilities;
}

