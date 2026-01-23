package com.jobSpher.jobSpher.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import java.io.FileNotFoundException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service for handling file uploads and storage
 */
@Service
public class FileStorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    public String storeFile(MultipartFile file, String subdirectory) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("The uploaded file is empty.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds the 50MB limit.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new RuntimeException("Could not determine the original filename.");
        }

        String extension = getFileExtension(originalFilename);
        String filename = UUID.randomUUID().toString() + extension;

        // Resolve absolute path to avoid Windows relative path issues
        Path uploadPath = Paths.get(uploadDir, subdirectory).toAbsolutePath().normalize();
        
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Still return a relative path for DB storage and retrieval
        return subdirectory + "/" + filename;
    }

    public byte[] loadFile(String filePath) throws IOException {
        Path path = Paths.get(uploadDir, filePath).toAbsolutePath().normalize();
        if (!Files.exists(path)) {
            throw new FileNotFoundException("File not found: " + filePath);
        }
        return Files.readAllBytes(path);
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex);
    }

    public boolean isValidFileType(MultipartFile file, String[] allowedTypes) {
        String contentType = file.getContentType();
        if (contentType == null) {
            return false;
        }
        for (String allowedType : allowedTypes) {
            if (contentType.startsWith(allowedType)) {
                return true;
            }
        }
        return false;
    }
}
