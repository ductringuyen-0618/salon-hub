package com.salonhub.api.customer.dto;

import lombok.Data;

@Data
public class CustomerResponseDTO {

    private Long id;
    private String email;
    private String name;
    private String phoneNumber;
    private String note;
}