package com.megablog.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;

    @JsonProperty("$id")
    private String appwriteId; // To remain compatible with React client checking userData.$id

    private String name;
    
    private String email;
    
    private String role;
    
    private String provider;
}
