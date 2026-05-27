package com.salonhub.api.employee.mapper;

import org.springframework.stereotype.Component;

import com.salonhub.api.employee.dto.EmployeeRequestDTO;
import com.salonhub.api.employee.dto.EmployeeResponseDTO;
import com.salonhub.api.employee.model.Employee;
import com.salonhub.api.employee.model.Role;

@Component
public class EmployeeMapper {

    /** Map from Entity → Response DTO */
    public EmployeeResponseDTO toResponse(Employee e) {
        if (e == null) return null;
        EmployeeResponseDTO resp = new EmployeeResponseDTO();
        resp.setId(e.getId());
        resp.setName(e.getName());
        resp.setAvailable(e.isAvailable());
        resp.setRole(e.getRole());
        return resp;
    }

    /** Map from Request DTO → Entity (for create/update) */
    public Employee toEntity(EmployeeRequestDTO dto) {
        return new Employee(
            dto.getName(),
            Role.valueOf(dto.getRole()),  // convert String to Enum manually
            dto.getAvailable() != null ? dto.getAvailable() : false
        );
    }

    /** Apply updates from DTO onto an existing Entity */
    public void updateEntity(EmployeeRequestDTO dto, Employee existing) {
        if (dto.getName() != null) {
            existing.setName(dto.getName());
        }
        if (dto.getAvailable() != null) {
            existing.setAvailable(dto.getAvailable());
        }
        if (dto.getRole() != null) {
            existing.setRole(Role.valueOf(dto.getRole()));
        }
    }
}