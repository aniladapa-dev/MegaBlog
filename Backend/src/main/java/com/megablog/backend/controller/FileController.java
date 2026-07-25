package com.megablog.backend.controller;

import com.megablog.backend.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@Tag(name = "File Management", description = "Endpoints for uploading, viewing, and deleting images/files")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class FileController {

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload an image file")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        String fileName = fileStorageService.storeFile(file);

        Map<String, String> response = new HashMap<>();
        response.put("$id", fileName);
        response.put("fileName", fileName);
        response.put("fileUrl", "/api/files/" + fileName);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{fileName:.+}")
    @Operation(summary = "Get/view an uploaded file")
    public ResponseEntity<Resource> getFile(@PathVariable String fileName, HttpServletRequest request) {
        // Load file as Resource
        Resource resource = fileStorageService.loadFileAsResource(fileName);

        // Try to determine file's content type
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            System.out.println("Could not determine file type.");
        }

        // Fallback to the default content type if type could not be determined
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{fileName:.+}")
    @Operation(summary = "Delete an uploaded file")
    public ResponseEntity<Map<String, Object>> deleteFile(@PathVariable String fileName) {
        fileStorageService.deleteFile(fileName);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "File deleted successfully");
        return ResponseEntity.ok(response);
    }
}
