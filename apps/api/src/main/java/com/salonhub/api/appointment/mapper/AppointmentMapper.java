package com.salonhub.api.appointment.mapper;

import com.salonhub.api.appointment.dto.AppointmentRequestDTO;
import com.salonhub.api.appointment.dto.AppointmentResponseDTO;
import com.salonhub.api.appointment.model.Appointment;
import com.salonhub.api.appointment.dto.ServiceTypeDTO;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

@Component
public class AppointmentMapper {

    /**
     * Map from Entity → Response DTO
     */
    public AppointmentResponseDTO toResponse(Appointment appt) {
        if (appt == null) return null;
        AppointmentResponseDTO resp = new AppointmentResponseDTO();
        resp.setId(appt.getId());
        resp.setCustomerId(appt.getCustomer().getId());
        resp.setEmployeeId(appt.getEmployee() != null ? appt.getEmployee().getId() : null);

        // Map services to DTOs
        List<ServiceTypeDTO> services = appt.getServices().stream()
            .map(s -> new ServiceTypeDTO(s.getId(), s.getName(), s.getEstimatedDurationMinutes()))
            .collect(Collectors.toList());
        resp.setServices(services);

        // Compute total estimated duration
        int totalEstimate = services.stream()
            .mapToInt(ServiceTypeDTO::getEstimatedDurationMinutes)
            .sum();
        resp.setTotalEstimatedDuration(totalEstimate);

        resp.setStartTime(appt.getStartTime());
        resp.setActualEndTime(appt.getActualEndTime());
        resp.setStatus(appt.getStatus());
        return resp;
    }

    /**
     * Map from Request DTO → Entity (for create)
     */
    public Appointment toEntity(AppointmentRequestDTO dto) {
        Appointment appt = new Appointment();
        appt.setStartTime(dto.getStartTime());
        appt.setStatus(null); // to be set by service
        // services and customer/employee set in service layer
        return appt;
    }

    /**
     * Apply updates from DTO onto an existing Entity
     */
    public void updateEntity(AppointmentRequestDTO dto, Appointment existing) {
        if (dto.getStartTime() != null) {
            existing.setStartTime(dto.getStartTime());
        }
        if (dto.getEmployeeId() != null) {
            // assume service sets employee reference subsequently
        }
        if (dto.getServiceIds() != null && !dto.getServiceIds().isEmpty()) {
            // assume service sets services list afterwards
        }
    }
}