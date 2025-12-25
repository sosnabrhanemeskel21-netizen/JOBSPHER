package com.jobSpher.jobSpher.dto;

import com.jobSpher.jobSpher.model.User;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private User.Role role;
    private Long userId;
    private String firstName;
    private String lastName;
}

