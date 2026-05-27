// src/main/java/com/salonhub/api/employee/dto/EmployeeResponse.java
package com.salonhub.api.employee.dto;

import com.salonhub.api.employee.model.Role;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class EmployeeResponseDTO {
    private Long id;
    private String name;
    private boolean available;
    private Role role;
}
