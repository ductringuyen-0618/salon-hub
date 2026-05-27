package com.salonhub.api.customer.mapper;

import org.springframework.stereotype.Component;

import com.salonhub.api.customer.dto.CustomerRequestDTO;
import com.salonhub.api.customer.dto.CustomerResponseDTO;
import com.salonhub.api.customer.model.Customer;

@Component
public class CustomerMapper {

    public Customer toEntity(CustomerRequestDTO dto) {
        Customer customer = new Customer();
        customer.setEmail(dto.getEmail());
        customer.setName(dto.getName());
        customer.setPhoneNumber(dto.getPhoneNumber());
        customer.setNote(dto.getNote());
        return customer;
    }

    public CustomerResponseDTO toResponse(Customer customer) {
        CustomerResponseDTO dto = new CustomerResponseDTO();
        dto.setId(customer.getId());
        dto.setEmail(customer.getEmail());
        dto.setName(customer.getName());
        dto.setPhoneNumber(customer.getPhoneNumber());
        dto.setNote(customer.getNote());
        return dto;
    }

    public void updateEntity(CustomerRequestDTO dto, Customer customer) {
        customer.setEmail(dto.getEmail());
        customer.setName(dto.getName());
        customer.setPhoneNumber(dto.getPhoneNumber());
        customer.setNote(dto.getNote());
    }
}