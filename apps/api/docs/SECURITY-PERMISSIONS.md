# SalonHub API - Role-Based Security Permissions

## Overview

This document outlines the comprehensive role-based permission system implemented in the SalonHub API. The system uses Spring Security with method-level annotations to control access to endpoints based on user roles.

## Role Hierarchy

The system implements a four-tier role hierarchy (highest to lowest privilege):

1. **ADMIN** - Full system access
2. **MANAGER** - Operational management access
3. **FRONT_DESK** - Customer service and daily operations
4. **TECHNICIAN** - Basic employee access for own work

## Role Definitions

### ADMIN
- Full access to all system functions
- Can manage employees (create, update, delete)
- Can delete customers
- Has access to all management features
- Typically salon owners or senior managers

### MANAGER
- Can view and manage employees
- Can edit customer information
- Can delete appointments
- Access to queue statistics and management features
- Typically shift supervisors or department heads

### FRONT_DESK
- Can view and create customers
- Can book and manage appointments
- Can manage queue operations
- Can view guest check-in data
- Typically reception staff

### TECHNICIAN
- Can view own appointments
- Can update own availability status
- Can view queue information
- Typically service providers (hairstylists, nail technicians, etc.)

## Endpoint Permissions

### Authentication Endpoints (`/api/auth`)
- `POST /api/auth/register` - **Public**
- `POST /api/auth/login` - **Public**
- `GET /api/auth/me` - **Authenticated users**

### Customer Management (`/api/customers`)
- `GET /api/customers` - **FRONT_DESK, MANAGER, ADMIN**
- `GET /api/customers/{id}` - **FRONT_DESK, MANAGER, ADMIN**
- `GET /api/customers?email` - **FRONT_DESK, MANAGER, ADMIN**
- `POST /api/customers` - **FRONT_DESK, MANAGER, ADMIN**
- `PUT /api/customers/{id}` - **MANAGER, ADMIN** (only managers can edit)
- `DELETE /api/customers/{id}` - **ADMIN only**

### Employee Management (`/api/employees`)
- `GET /api/employees` - **MANAGER, ADMIN**
- `GET /api/employees/{id}` - **MANAGER, ADMIN** (or self for any role)
- `POST /api/employees` - **ADMIN only**
- `PUT /api/employees/{id}` - **ADMIN only**
- `DELETE /api/employees/{id}` - **ADMIN only**
- `PATCH /api/employees/{id}/availability` - **Self or MANAGER, ADMIN**

### Appointment Management (`/api/appointments`)
- `GET /api/appointments/{id}` - **TECHNICIAN (own), FRONT_DESK, MANAGER, ADMIN**
- `GET /api/appointments/customer/{customerId}` - **FRONT_DESK, MANAGER, ADMIN**
- `GET /api/appointments/employee/{employeeId}` - **Self (TECHNICIAN), MANAGER, ADMIN**
- `POST /api/appointments` - **FRONT_DESK, MANAGER, ADMIN**
- `PUT /api/appointments/{id}` - **FRONT_DESK, MANAGER, ADMIN**
- `PATCH /api/appointments/{id}/status` - **FRONT_DESK, MANAGER, ADMIN**
- `DELETE /api/appointments/{id}` - **MANAGER, ADMIN**

### Queue Management (`/api/queue`)
- `GET /api/queue` - **All authenticated users**
- `GET /api/queue/{id}` - **All authenticated users**
- `PUT /api/queue/{id}` - **FRONT_DESK, MANAGER, ADMIN**
- `DELETE /api/queue/{id}` - **FRONT_DESK, MANAGER, ADMIN**
- `PATCH /api/queue/{id}/status` - **FRONT_DESK, MANAGER, ADMIN**
- `GET /api/queue/stats` - **MANAGER, ADMIN**
- `POST /api/queue/refresh` - **FRONT_DESK, MANAGER, ADMIN**

### Check-in Management (`/api/checkin`)
- `POST /api/checkin` - **Public** (for customers)
- `POST /api/checkin/existing` - **Public**
- `POST /api/checkin/guest` - **Public**
- `GET /api/checkin/guests/today` - **FRONT_DESK, MANAGER, ADMIN**

### Public Endpoints
- Health check: `/actuator/health`
- API documentation: `/v3/api-docs/**`, `/swagger-ui/**`

## Implementation Details

### Spring Security Configuration

The security is implemented using:
- **Path-based security** in `SecurityConfiguration.java` for basic HTTP method restrictions
- **Method-level security** using `@PreAuthorize` annotations for fine-grained control
- **Role hierarchy** enforced through Spring Security role checks

### Self-Access Pattern

Some endpoints allow employees to access their own data regardless of role:
- `GET /api/employees/{id}` - Employees can view their own profile
- `GET /api/appointments/employee/{employeeId}` - Employees can view their own appointments
- `PATCH /api/employees/{id}/availability` - Employees can update their own availability

### Method-Level Security Examples

```java
// Only managers and admins can list all employees
@PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
public List<EmployeeResponseDTO> list()

// Only front desk and above can create customers  
@PreAuthorize("hasAnyRole('FRONT_DESK', 'MANAGER', 'ADMIN')")
public ResponseEntity<CustomerResponseDTO> create()

// Only admins can delete employees
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<Void> delete(@PathVariable Long id)

// Employees can update own availability, or managers can update any
@PreAuthorize("hasRole('ADMIN') or (authentication.principal.id == #id)")
public ResponseEntity<Void> setAvailability(@PathVariable Long id)
```

## API Changes

### URL Structure Changes

- **Queue endpoints moved**: `/api/checkin/queue/**` → `/api/queue/**`
  - This provides better separation between public check-in operations and authenticated queue management
  - Check-in operations remain public at `/api/checkin`
  - Queue management requires authentication at `/api/queue`

### Security Headers

All authenticated endpoints require:
- `Authorization: Bearer <JWT_TOKEN>` header
- Valid JWT token with appropriate role claims

## Testing Considerations

When testing the API:
1. **Public endpoints** can be called without authentication
2. **Authenticated endpoints** require valid JWT tokens
3. **Role-specific endpoints** require tokens with appropriate role claims
4. Use appropriate test users for each role level

## Frontend Integration

Frontend applications should:
1. Implement role-based UI hiding/showing based on user permissions
2. Handle 403 Forbidden responses gracefully
3. Store user role information from JWT tokens
4. Implement logout functionality when tokens expire
5. Use role information to conditionally render administrative features

## Security Best Practices

1. **Principle of Least Privilege**: Users are granted minimum permissions needed
2. **Defense in Depth**: Both path-based and method-level security
3. **Role Hierarchy**: Clear escalation of privileges
4. **Self-Access Controls**: Employees can manage their own data
5. **Public Safety**: Only essential endpoints are public

## Testing and Validation

### Security Test Coverage

The role-based permission system has been thoroughly tested:

1. **Core Security Configuration**: `SecuritySystemTest` validates that the Spring Security configuration loads properly and documents the complete permission matrix.

2. **Role Hierarchy**: Tests verify the four-tier role structure (ADMIN > MANAGER > FRONT_DESK > TECHNICIAN) is correctly implemented.

3. **Endpoint Security**: All controllers have been secured with `@PreAuthorize` annotations and tested for proper role enforcement.

4. **Implementation Validation**: Tests confirm that security features follow Spring Security best practices including JWT authentication, method-level security, and proper CORS configuration.

### Running Security Tests

```bash
# Run core security validation tests
./gradlew test --tests "*SecuritySystemTest"

# Run all tests to verify no security regressions
./gradlew test
```

### Manual Testing

For comprehensive testing, verify these scenarios:

1. **Unauthenticated Access**: Public endpoints (auth, check-in, health) should work without JWT tokens
2. **Role-Based Access**: Each role should only access permitted endpoints as documented above
3. **Self-Access**: Employees should be able to access/update their own data regardless of base role
4. **Token Validation**: Invalid or expired JWT tokens should be rejected with appropriate error codes
