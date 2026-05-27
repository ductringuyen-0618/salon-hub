package com.salonhub.api.employee.service;

import com.salonhub.api.employee.model.Employee;
import com.salonhub.api.employee.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmployeeService {
    private final EmployeeRepository repo;

    public EmployeeService(EmployeeRepository repo) {
        this.repo = repo;
    }

    public List<Employee> findAll() {
        return repo.findAll();
    }

    public Optional<Employee> findById(Long id) {
        return repo.findById(id);
    }

    public Employee create(Employee e) {
        return repo.save(e);
    }

    public Optional<Employee> update(Long id, Employee e) {
        return repo.findById(id)
            .map(existing -> {
                existing.setName(e.getName());
                existing.setRole(e.getRole());
                return repo.save(existing);
            });
    }

    /** Toggle availability (e.g. call off sick or clock in/out) */
    public Optional<Employee> setAvailability(Long id, boolean available) {
        return repo.findById(id)
            .map(emp -> {
                emp.setAvailable(available);
                return repo.save(emp);
            });
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
