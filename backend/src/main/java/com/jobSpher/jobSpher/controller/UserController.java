package com.jobSpher.jobSpher.controller;

import com.jobSpher.jobSpher.model.User;
import com.jobSpher.jobSpher.repository.UserRepository;
import com.jobSpher.jobSpher.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * User Controller
 * 
 * Handles user profile management and notification endpoints.
 * All endpoints require authentication and operate on the currently authenticated user.
 * 
 * Base URL: /api/users
 * 
 * @author JobSpher Team
 * @version 1.0
 */
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * Get current user profile
     * 
     * Returns the profile information of the currently authenticated user.
     * 
     * @return ResponseEntity containing the User entity
     */
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        User user = getCurrentUserFromContext();
        return ResponseEntity.ok(user);
    }
    
    /**
     * Update current user profile
     * 
     * Updates the profile information of the currently authenticated user.
     * Only allows updating firstName, lastName, phoneNumber, and address.
     * Email, password, and role cannot be changed through this endpoint.
     * 
     * @param userUpdate User object containing updated fields
     * @return ResponseEntity containing the updated User entity
     */
    @PutMapping("/me")
    public ResponseEntity<User> updateCurrentUser(@Valid @RequestBody User userUpdate) {
        User user = getCurrentUserFromContext();
        // Update only allowed fields
        user.setFirstName(userUpdate.getFirstName());
        user.setLastName(userUpdate.getLastName());
        user.setPhoneNumber(userUpdate.getPhoneNumber());
        user.setAddress(userUpdate.getAddress());
        user.setResumePath(userUpdate.getResumePath());
        user = userRepository.save(user);
        return ResponseEntity.ok(user);
    }
    
    /**
     * Get user notifications
     * 
     * Returns paginated list of notifications for the currently authenticated user.
     * Notifications include job application updates, job approvals, payment verifications, etc.
     * 
     * @param pageable Pageable object for pagination (page number, page size, sorting)
     * @return ResponseEntity containing a Page of Notification entities
     */
    @GetMapping("/notifications")
    public ResponseEntity<Page<com.jobSpher.jobSpher.model.Notification>> getNotifications(Pageable pageable) {
        User user = getCurrentUserFromContext();
        Page<com.jobSpher.jobSpher.model.Notification> notifications = 
            notificationService.getUserNotifications(user, pageable);
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * Get unread notification count
     * 
     * Returns the count of unread notifications for the currently authenticated user.
     * Useful for displaying notification badges in the UI.
     * 
     * @return ResponseEntity containing a map with "count" key and unread count value
     */
    @GetMapping("/notifications/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        User user = getCurrentUserFromContext();
        long count = notificationService.getUnreadCount(user);
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Mark notification as read
     * 
     * Marks a specific notification as read for the currently authenticated user.
     * Only the owner of the notification can mark it as read.
     * 
     * @param id Notification ID
     * @return ResponseEntity containing the updated Notification entity
     * @throws RuntimeException if notification not found or user doesn't own the notification
     */
    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<com.jobSpher.jobSpher.model.Notification> markAsRead(@PathVariable Long id) {
        User user = getCurrentUserFromContext();
        com.jobSpher.jobSpher.model.Notification notification = notificationService.markAsRead(id, user);
        return ResponseEntity.ok(notification);
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

