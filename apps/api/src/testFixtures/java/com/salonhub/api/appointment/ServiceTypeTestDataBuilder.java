package com.salonhub.api.appointment;

import com.salonhub.api.appointment.dto.ServiceTypeRequestDTO;
import com.salonhub.api.appointment.model.ServiceType;

import java.math.BigDecimal;

/**
 * Builder pattern for creating ServiceType test data
 */
public class ServiceTypeTestDataBuilder {
    
    private Long id;
    private String name;
    private Integer estimatedDurationMinutes;
    private BigDecimal price;
    private String description;
    private String category;
    private Boolean popular = false;
    private Boolean active = true;
    
    public static ServiceTypeTestDataBuilder aServiceType() {
        return new ServiceTypeTestDataBuilder()
                .withId(1L)
                .withName("Test Service")
                .withEstimatedDurationMinutes(30)
                .withPrice(new BigDecimal("25.00"))
                .withDescription("Test service description")
                .withCategory("Test Category")
                .withPopular(false)
                .withActive(true);
    }
    
    public static ServiceTypeTestDataBuilder aSignatureManicure() {
        return new ServiceTypeTestDataBuilder()
                .withId(ServiceTypeDatabaseDefault.SIGNATURE_MANICURE_ID)
                .withName(ServiceTypeDatabaseDefault.SIGNATURE_MANICURE_NAME)
                .withEstimatedDurationMinutes(ServiceTypeDatabaseDefault.SIGNATURE_MANICURE_DURATION)
                .withPrice(ServiceTypeDatabaseDefault.SIGNATURE_MANICURE_PRICE)
                .withDescription(ServiceTypeDatabaseDefault.SIGNATURE_MANICURE_DESCRIPTION)
                .withCategory(ServiceTypeDatabaseDefault.MANICURE_CATEGORY)
                .withPopular(true)
                .withActive(true);
    }
    
    public static ServiceTypeTestDataBuilder anExpressManicure() {
        return new ServiceTypeTestDataBuilder()
                .withId(ServiceTypeDatabaseDefault.EXPRESS_MANICURE_ID)
                .withName(ServiceTypeDatabaseDefault.EXPRESS_MANICURE_NAME)
                .withEstimatedDurationMinutes(ServiceTypeDatabaseDefault.EXPRESS_MANICURE_DURATION)
                .withPrice(ServiceTypeDatabaseDefault.EXPRESS_MANICURE_PRICE)
                .withDescription(ServiceTypeDatabaseDefault.EXPRESS_MANICURE_DESCRIPTION)
                .withCategory(ServiceTypeDatabaseDefault.MANICURE_CATEGORY)
                .withPopular(false)
                .withActive(true);
    }
    
    public static ServiceTypeTestDataBuilder aDeluxePedicure() {
        return new ServiceTypeTestDataBuilder()
                .withId(ServiceTypeDatabaseDefault.DELUXE_PEDICURE_ID)
                .withName(ServiceTypeDatabaseDefault.DELUXE_PEDICURE_NAME)
                .withEstimatedDurationMinutes(ServiceTypeDatabaseDefault.DELUXE_PEDICURE_DURATION)
                .withPrice(ServiceTypeDatabaseDefault.DELUXE_PEDICURE_PRICE)
                .withDescription(ServiceTypeDatabaseDefault.DELUXE_PEDICURE_DESCRIPTION)
                .withCategory(ServiceTypeDatabaseDefault.PEDICURE_CATEGORY)
                .withPopular(true)
                .withActive(true);
    }
    
    // Legacy methods for backward compatibility
    public static ServiceTypeTestDataBuilder aHaircut() {
        return aSignatureManicure();
    }
    
    public static ServiceTypeTestDataBuilder aHairColor() {
        return anExpressManicure();
    }
    
    public static ServiceTypeTestDataBuilder aManicure() {
        return aDeluxePedicure();
    }
    
    public ServiceTypeTestDataBuilder withId(Long id) {
        this.id = id;
        return this;
    }
    
    public ServiceTypeTestDataBuilder withName(String name) {
        this.name = name;
        return this;
    }
    
    public ServiceTypeTestDataBuilder withEstimatedDurationMinutes(Integer estimatedDurationMinutes) {
        this.estimatedDurationMinutes = estimatedDurationMinutes;
        return this;
    }
    
    public ServiceTypeTestDataBuilder withPrice(BigDecimal price) {
        this.price = price;
        return this;
    }
    
    public ServiceTypeTestDataBuilder withDescription(String description) {
        this.description = description;
        return this;
    }
    
    public ServiceTypeTestDataBuilder withCategory(String category) {
        this.category = category;
        return this;
    }
    
    public ServiceTypeTestDataBuilder withPopular(Boolean popular) {
        this.popular = popular;
        return this;
    }
    
    public ServiceTypeTestDataBuilder withActive(Boolean active) {
        this.active = active;
        return this;
    }
    
    public ServiceType build() {
        ServiceType serviceType = new ServiceType();
        serviceType.setId(id);
        serviceType.setName(name);
        serviceType.setEstimatedDurationMinutes(estimatedDurationMinutes);
        serviceType.setPrice(price);
        serviceType.setDescription(description);
        serviceType.setCategory(category);
        serviceType.setPopular(popular);
        serviceType.setActive(active);
        return serviceType;
    }
    
    public ServiceTypeRequestDTO buildRequestDTO() {
        return ServiceTypeRequestDTO.builder()
                .name(name)
                .estimatedDurationMinutes(estimatedDurationMinutes)
                .price(price)
                .description(description)
                .category(category)
                .popular(popular)
                .active(active)
                .build();
    }
}
