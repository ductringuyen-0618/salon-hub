package com.salonhub.api.employee.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.salonhub.api.employee.model.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class EmployeeRequestDTO {

    @NotBlank(message = "Name must not be blank")
    private String name;

    @NotBlank(message = "Role must not be blank")
    private String role;   

    private Boolean available;
}