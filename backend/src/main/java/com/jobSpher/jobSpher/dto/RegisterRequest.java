package com.jobSpher.jobSpher.dto;

import com.jobSpher.jobSpher.model.User;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    @NotBlank(message = "First name is required")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    private String lastName;
    
    @NotNull(message = "Role is required")
    private User.Role role;
    
    @NotBlank(message = "Phone number is required")
    @jakarta.validation.constraints.Pattern(regexp = "^\\+?[0-9\\s-]{10,15}$", message = "Phone number must be valid (10-15 digits)")
    private String phoneNumber;
    
    private String address;
}

