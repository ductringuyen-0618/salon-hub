package com.salonhub.api.employee.service;

import com.salonhub.api.employee.model.Employee;
import com.salonhub.api.employee.model.Role;
import com.salonhub.api.employee.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository repository;

    @InjectMocks
    private EmployeeService service;

    private Employee testEmployee;

    @BeforeEach
    void setUp() {
        testEmployee = new Employee();
        testEmployee.setId(1L);
        testEmployee.setName("Alice Smith");
        testEmployee.setRole(Role.TECHNICIAN);
        testEmployee.setAvailable(true);
    }

    @Test
    void findAll_shouldReturnAllEmployees() {
        // Given
        Employee employee2 = new Employee();
        employee2.setId(2L);
        employee2.setName("Bob Jones");
        employee2.setRole(Role.MANAGER);
        List<Employee> employees = Arrays.asList(testEmployee, employee2);
        when(repository.findAll()).thenReturn(employees);

        // When
        List<Employee> result = service.findAll();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).containsExactlyInAnyOrder(testEmployee, employee2);
        verify(repository).findAll();
    }

    @Test
    void findById_whenEmployeeExists_shouldReturnEmployee() {
        // Given
        when(repository.findById(1L)).thenReturn(Optional.of(testEmployee));

        // When
        Optional<Employee> result = service.findById(1L);

        // Then
        assertThat(result).isPresent();
        assertThat(result.get()).isEqualTo(testEmployee);
        assertThat(result.get().getName()).isEqualTo("Alice Smith");
        verify(repository).findById(1L);
    }

    @Test
    void findById_whenEmployeeDoesNotExist_shouldReturnEmpty() {
        // Given
        when(repository.findById(999L)).thenReturn(Optional.empty());

        // When
        Optional<Employee> result = service.findById(999L);

        // Then
        assertThat(result).isEmpty();
        verify(repository).findById(999L);
    }

    @Test
    void create_shouldSaveAndReturnEmployee() {
        // Given
        Employee newEmployee = new Employee();
        newEmployee.setName("Charlie Brown");
        newEmployee.setRole(Role.FRONT_DESK);
        
        when(repository.save(newEmployee)).thenReturn(testEmployee);

        // When
        Employee result = service.create(newEmployee);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(repository).save(newEmployee);
    }

    @Test
    void update_whenEmployeeExists_shouldUpdateAndReturn() {
        // Given
        Employee updateData = new Employee();
        updateData.setName("Updated Name");
        updateData.setRole(Role.MANAGER);
        
        when(repository.findById(1L)).thenReturn(Optional.of(testEmployee));
        when(repository.save(any(Employee.class))).thenAnswer(i -> i.getArguments()[0]);

        // When
        Optional<Employee> result = service.update(1L, updateData);

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("Updated Name");
        assertThat(result.get().getRole()).isEqualTo(Role.MANAGER);
        verify(repository).findById(1L);
        verify(repository).save(testEmployee);
    }

    @Test
    void update_whenEmployeeDoesNotExist_shouldReturnEmpty() {
        // Given
        Employee updateData = new Employee();
        when(repository.findById(999L)).thenReturn(Optional.empty());

        // When
        Optional<Employee> result = service.update(999L, updateData);

        // Then
        assertThat(result).isEmpty();
        verify(repository).findById(999L);
        verify(repository, never()).save(any());
    }

    @Test
    void setAvailability_whenEmployeeExists_shouldUpdateAvailability() {
        // Given
        when(repository.findById(1L)).thenReturn(Optional.of(testEmployee));
        when(repository.save(any(Employee.class))).thenAnswer(i -> i.getArguments()[0]);

        // When
        Optional<Employee> result = service.setAvailability(1L, false);

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().isAvailable()).isFalse();
        verify(repository).findById(1L);
        verify(repository).save(testEmployee);
    }

    @Test
    void setAvailability_whenEmployeeDoesNotExist_shouldReturnEmpty() {
        // Given
        when(repository.findById(999L)).thenReturn(Optional.empty());

        // When
        Optional<Employee> result = service.setAvailability(999L, true);

        // Then
        assertThat(result).isEmpty();
        verify(repository).findById(999L);
        verify(repository, never()).save(any());
    }

    @Test
    void delete_shouldCallRepositoryDelete() {
        // Given
        doNothing().when(repository).deleteById(1L);

        // When
        service.delete(1L);

        // Then
        verify(repository).deleteById(1L);
    }
}
