package com.salonhub.api.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.salonhub.api.auth.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {

    @JsonProperty("access_token")
    private String accessToken;

    @JsonProperty("token_type")
    private String tokenType = "Bearer";

    // User information for frontend
    private String name;
    private String email;
    private String phoneNumber;
    private User.Role role;
    private LocalDateTime lastVisit;
    private List<String> preferredServices;

    // Constructor that takes User object
    public AuthenticationResponse(String accessToken, User user) {
        this.accessToken = accessToken;
        this.name = user.getName();
        this.email = user.getEmail();
        this.phoneNumber = user.getPhoneNumber();
        this.role = user.getRole();
        this.lastVisit = user.getLastVisit();
        // Parse preferred services from JSON string if needed
        this.preferredServices = user.getPreferredServices() != null ? 
            List.of(user.getPreferredServices().split(",")) : List.of();
    }

    public static AuthenticationResponseBuilder builder() {
        return new AuthenticationResponseBuilder();
    }

    public static class AuthenticationResponseBuilder {
        private String accessToken;
        private String tokenType = "Bearer";
        private User user;

        public AuthenticationResponseBuilder accessToken(String accessToken) {
            this.accessToken = accessToken;
            return this;
        }

        public AuthenticationResponseBuilder user(User user) {
            this.user = user;
            return this;
        }

        public AuthenticationResponse build() {
            return new AuthenticationResponse(accessToken, user);
        }
    }
}
