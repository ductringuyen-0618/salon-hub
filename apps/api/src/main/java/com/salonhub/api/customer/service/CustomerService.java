package com.salonhub.api.customer.service;

import com.salonhub.api.customer.model.Customer;
import com.salonhub.api.customer.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    private final CustomerRepository repo;

    public CustomerService(CustomerRepository repo) {
        this.repo = repo;
    }

    public List<Customer> findAll() {
        return repo.findAll();
    }

    public Optional<Customer> findById(Long id) {
        return repo.findById(id);
    }

    public Optional<Customer> findByEmail(String email) {
        return Optional.ofNullable(repo.findByEmail(email));
    }

    public Customer create(Customer customer) {
        return repo.save(customer);
    }

    public Optional<Customer> update(Long id, Customer update) {
        return repo.findById(id)
            .map(existing -> {
                existing.setName(update.getName());
                existing.setPhoneNumber(update.getPhoneNumber());
                existing.setNote(update.getNote());
                return repo.save(existing);
            });
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
