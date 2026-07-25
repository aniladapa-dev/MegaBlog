package com.megablog.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;
    private final Cloudinary cloudinary;

    public FileStorageService(
            @Value("${file.upload-dir:uploads}") String uploadDir,
            @Value("${cloudinary.cloud-name:}") String cloudName,
            @Value("${cloudinary.api-key:}") String apiKey,
            @Value("${cloudinary.api-secret:}") String apiSecret) {
        
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }

        String cloudinaryUrl = System.getenv("CLOUDINARY_URL");
        if (cloudinaryUrl != null && !cloudinaryUrl.isEmpty()) {
            this.cloudinary = new Cloudinary(cloudinaryUrl);
        } else if (cloudName != null && !cloudName.isEmpty() && apiKey != null && !apiKey.isEmpty() && apiSecret != null && !apiSecret.isEmpty()) {
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret,
                    "secure", true
            ));
        } else {
            this.cloudinary = null;
        }
    }

    public String storeFile(MultipartFile file) {
        if (this.cloudinary != null) {
            try {
                Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
                return (String) uploadResult.get("secure_url");
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload file to Cloudinary", e);
            }
        }

        // Fallback to local storage
        String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String fileExtension = "";
        
        int lastDotIndex = originalFileName.lastIndexOf('.');
        if (lastDotIndex != -1) {
            fileExtension = originalFileName.substring(lastDotIndex);
        }
        
        String fileName = UUID.randomUUID().toString() + fileExtension;

        try {
            if (fileName.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + fileName);
            }

            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found " + fileName, ex);
        }
    }

    public void deleteFile(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            return;
        }

        if (this.cloudinary != null && (fileName.startsWith("http://") || fileName.startsWith("https://"))) {
            try {
                String publicId = extractPublicId(fileName);
                if (publicId != null && !publicId.isEmpty()) {
                    cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                }
            } catch (IOException e) {
                System.err.println("Could not delete file from Cloudinary: " + e.getMessage());
            }
            return;
        }

        // Local storage delete
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            System.err.println("Could not delete file " + fileName + ": " + ex.getMessage());
        }
    }

    private String extractPublicId(String fileUrl) {
        if (fileUrl == null || !fileUrl.contains("/image/upload/")) {
            return null;
        }
        String parts = fileUrl.split("/image/upload/")[1];
        if (parts.startsWith("v")) {
            int slashIndex = parts.indexOf('/');
            if (slashIndex != -1) {
                parts = parts.substring(slashIndex + 1);
            }
        }
        int dotIndex = parts.lastIndexOf('.');
        if (dotIndex != -1) {
            parts = parts.substring(0, dotIndex);
        }
        return parts;
    }
}
