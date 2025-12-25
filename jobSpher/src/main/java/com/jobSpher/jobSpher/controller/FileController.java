package com.jobSpher.jobSpher.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.jobSpher.jobSpher.service.FileStorageService;

/**
 * File Controller
 * 
 * Handles file upload and download operations for various file types including:
 * - Resumes (PDF, DOC, DOCX)
 * - Payment verification documents (Images, PDF)
 * - Company logos (Images)
 * 
 * Files are stored in subdirectories based on their type for better organization.
 * 
 * Base URL: /api/files
 * 
 * @author JobSpher Team
 * @version 1.0
 */
@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "http://localhost:3000") // CORS configuration - should be moved to SecurityConfig in production
public class FileController {
    
    @Autowired
    private FileStorageService fileStorageService;
    
    /**
     * Upload a file
     * 
     * Uploads a file and stores it in the appropriate subdirectory based on file type.
     * File type validation is performed before storage to ensure only allowed file types
     * are accepted.
     * 
     * Supported file types:
     * - "resume": PDF, DOC, DOCX files → stored in "resumes" directory
     * - "payment": Images and PDF files → stored in "payments" directory
     * - "logo": Image files → stored in "logos" directory
     * 
     * @param file MultipartFile to upload
     * @param type File type (resume, payment, or logo)
     * @return ResponseEntity containing filePath and success message
     * @throws RuntimeException if file type is invalid, file type doesn't match allowed types, or storage fails
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type) {
        
        String[] allowedTypes;
        String subdirectory;
        
        // Configure allowed file types and storage directory based on file type
        switch (type.toLowerCase()) {
            case "resume":
                // Resumes: PDF and Word documents only
                allowedTypes = new String[]{"application/pdf", "application/msword", 
                                           "application/vnd.openxmlformats-officedocument.wordprocessingml.document"};
                subdirectory = "resumes";
                break;
            case "payment":
                // Payment proofs: Images and PDFs
                allowedTypes = new String[]{"image/", "application/pdf"};
                subdirectory = "payments";
                break;
            case "logo":
                // Company logos: Images only
                allowedTypes = new String[]{"image/"};
                subdirectory = "logos";
                break;
            default:
                throw new RuntimeException("Invalid file type");
        }
        
        // Validate file MIME type
        if (!fileStorageService.isValidFileType(file, allowedTypes)) {
            throw new RuntimeException("Invalid file type for " + type);
        }
        
        // Store file and get the file path
        String filePath;
        try {
            filePath = fileStorageService.storeFile(file, subdirectory);
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage());
        }
        
        Map<String, String> response = new HashMap<>();
        response.put("filePath", filePath);
        response.put("message", "File uploaded successfully");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Download a file
     * 
     * Public endpoint to download files by their file path.
     * The file path should be the relative path returned from the upload endpoint.
     * 
     * @param filePath Relative file path (e.g., "resumes/filename.pdf")
     * @return ResponseEntity containing file content as byte array with appropriate headers
     *         Returns 404 if file not found
     */
    @GetMapping("/download/{*filePath}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable String filePath) {
        try {
            byte[] fileContent = fileStorageService.loadFile(filePath);
            
            // Set response headers for file download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", filePath.substring(filePath.lastIndexOf("/") + 1));
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(fileContent);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}

