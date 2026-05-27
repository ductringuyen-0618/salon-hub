package com.salonhub.api.auth.controller;

import com.salonhub.api.auth.dto.AuthenticationRequest;
import com.salonhub.api.auth.dto.AuthenticationResponse;
import com.salonhub.api.auth.dto.RegisterRequest;
import com.salonhub.api.auth.service.AuthenticationService;
import com.salonhub.api.common.dto.ErrorResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(
    name = "🔐 Authentication", 
    description = """
        User registration and authentication endpoints.
        
        **Public Endpoints**: No authentication required for these endpoints.
        
        **How to use JWT tokens:**
        1. Register a new account or login with existing credentials
        2. Copy the `token` from the response
        3. Use the token in the Authorization header: `Bearer your-jwt-token`
        4. Or use the 🔒 **Authorize** button in Swagger UI
        """
)
public class AuthenticationController {

    private final AuthenticationService service;

    @PostMapping("/register")
    @Operation(
        summary = "📝 Register New User",
        description = """
            Create a new user account in the system.
            
            **Public Endpoint**: No authentication required
            
            **Returns**: JWT token and user information for immediate login
            """,
        responses = {
            @ApiResponse(
                responseCode = "200", 
                description = "✅ Registration successful",
                content = @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(
                        value = """
                            {
                              "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                              "email": "user@example.com",
                              "role": "CUSTOMER",
                              "name": "John Doe"
                            }
                            """
                    )
                )
            ),
            @ApiResponse(responseCode = "400", description = "❌ Registration failed - Email already exists or invalid data",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class)
                )
            )
        }
    )
    public ResponseEntity<AuthenticationResponse> register(
            @RequestBody @Valid RegisterRequest request
    ) {
        // Let exceptions propagate to GlobalExceptionHandler for proper error messages
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/login")
    @Operation(
        summary = "🔓 User Login",
        description = """
            Authenticate user and receive JWT token for API access.
            
            **Public Endpoint**: No authentication required
            
            **Usage after login:**
            1. Copy the `token` from the response
            2. Include in requests: `Authorization: Bearer your-token`
            3. Or use 🔒 **Authorize** button in Swagger UI
            
            **Test Credentials** (for development):
            - Admin: `admin@salonhub.com` / `admin123`
            - Manager: `manager@salonhub.com` / `manager123`
            - Front Desk: `frontdesk@salonhub.com` / `frontdesk123`
            """,
        responses = {
            @ApiResponse(
                responseCode = "200", 
                description = "✅ Login successful - Copy the token for API access",
                content = @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(
                        value = """
                            {
                              "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                              "email": "admin@salonhub.com",
                              "role": "ADMIN",
                              "name": "Admin User"
                            }
                            """
                    )
                )
            ),
            @ApiResponse(responseCode = "400", description = "❌ Invalid credentials",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ErrorResponse.class)
                )
            )
        }
    )
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody @Valid AuthenticationRequest request
    ) {
        // Let exceptions propagate to GlobalExceptionHandler for proper error messages
        return ResponseEntity.ok(service.authenticate(request));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthenticationResponse> getCurrentUser() {
        // The authenticated principal is set by either the legacy
        // JwtAuthenticationFilter (returns a UserDetails) or the new
        // SupabaseJwtAuthenticationFilter (returns our User entity).
        var auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }

        Object principal = auth.getPrincipal();
        if (!(principal instanceof com.salonhub.api.auth.model.User u)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }

        // No access_token here — caller already has their own (Supabase or legacy).
        // /api/auth/me returns just the user record.
        AuthenticationResponse resp = new AuthenticationResponse(null, u);
        resp.setTokenType(null);
        return ResponseEntity.ok(resp);
    }
}
