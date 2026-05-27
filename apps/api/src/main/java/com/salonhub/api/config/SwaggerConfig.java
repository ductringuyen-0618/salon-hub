package com.salonhub.api.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "SalonHub API",
        version = "3.0.0",
        description = """
            # SalonHub API Documentation
            
            This API provides comprehensive salon management functionality including:
            - **Customer Management**: Register and manage customers (guest and registered)
            - **Queue Management**: Real-time queue with online check-in system
            - **Appointment Scheduling**: Book and manage appointments with services
            - **Employee Management**: Staff roles, availability, and assignments
            - **Service Types**: Manage services with pricing and duration
            - **Authentication**: JWT-based security with role-based access control
            
            ## Authentication
            
            ### How to authenticate:
            1. **Login**: Use `/api/auth/login` endpoint with your credentials
            2. **Get JWT Token**: Copy the `token` from the response
            3. **Authorize**: Click the **🔒 Authorize** button above
            4. **Enter Token**: Paste token in format: `Bearer your-jwt-token-here`
            
            ### Test Credentials (Development Only):
            - **Admin**: `admin@salonhub.com` / `admin123`
            - **Manager**: `manager@salonhub.com` / `manager123`
            - **Front Desk**: `frontdesk@salonhub.com` / `frontdesk123`
            - **Customer**: `customer@salonhub.com` / `customer123`
            
            ## Role-Based Access Control
            - **ADMIN**: Full system access
            - **MANAGER**: Customer/appointment operations, employee management
            - **FRONT_DESK**: Customer operations, appointment scheduling
            - **TECHNICIAN**: Read-only access to assigned appointments
            
            ## Public Endpoints (No Auth Required)
            - Authentication endpoints (`/api/auth/*`)
            - Customer check-in (`/api/checkin`)
            - Health check (`/actuator/health`)
            - API documentation (`/v3/api-docs`, `/swagger-ui/*`)
            """,
        contact = @Contact(
            name = "SalonHub Development Team",
            email = "dev@salonhub.com"
        ),
        license = @License(
            name = "MIT License",
            url = "https://opensource.org/licenses/MIT"
        )
    ),
    servers = {
        @Server(
            url = "http://localhost:8082",
            description = "Local Development Server"
        ),
        @Server(
            url = "https://api.salonhub.com",
            description = "Production Server"
        )
    }
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    description = """
        JWT Authorization header using the Bearer scheme.
        
        Enter your token in the text input below.
        Example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        """
)
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}
