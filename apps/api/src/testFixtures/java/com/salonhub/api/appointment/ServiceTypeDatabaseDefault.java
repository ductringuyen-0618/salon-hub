package com.salonhub.api.appointment;

import java.math.BigDecimal;

/**
 * Database default values for ServiceType entities used in tests
 */
public class ServiceTypeDatabaseDefault {
    
    // Entity IDs
    public static final Long SIGNATURE_MANICURE_ID = 1L;
    public static final Long EXPRESS_MANICURE_ID = 2L;
    public static final Long DELUXE_PEDICURE_ID = 3L;
    
    // Entity names
    public static final String SIGNATURE_MANICURE_NAME = "Signature Manicure";
    public static final String EXPRESS_MANICURE_NAME = "Express Manicure";
    public static final String DELUXE_PEDICURE_NAME = "Deluxe Pedicure";
    
    // Categories
    public static final String MANICURE_CATEGORY = "Manicure Services";
    public static final String PEDICURE_CATEGORY = "Pedicure Services";
    
    // Durations (in minutes)
    public static final Integer SIGNATURE_MANICURE_DURATION = 60;
    public static final Integer EXPRESS_MANICURE_DURATION = 30;
    public static final Integer DELUXE_PEDICURE_DURATION = 75;
    
    // Prices
    public static final BigDecimal SIGNATURE_MANICURE_PRICE = new BigDecimal("45.00");
    public static final BigDecimal EXPRESS_MANICURE_PRICE = new BigDecimal("25.00");
    public static final BigDecimal DELUXE_PEDICURE_PRICE = new BigDecimal("65.00");
    
    // Descriptions
    public static final String SIGNATURE_MANICURE_DESCRIPTION = "Complete nail care with cuticle treatment, shaping, and luxury hand massage";
    public static final String EXPRESS_MANICURE_DESCRIPTION = "Quick nail shaping, cuticle care, and polish application";
    public static final String DELUXE_PEDICURE_DESCRIPTION = "Ultimate foot treatment with exfoliation, hot stone massage, and paraffin";
    
    // SQL insert statements for test data (with new columns)
    public static final String INSERT_SIGNATURE_MANICURE = 
        "INSERT INTO service_types (id, name, estimated_duration_minutes, price, description, category, popular, active) VALUES " +
        "(1, 'Signature Manicure', 60, 45.00, 'Complete nail care with cuticle treatment, shaping, and luxury hand massage', 'Manicure Services', true, true)";
        
    public static final String INSERT_EXPRESS_MANICURE = 
        "INSERT INTO service_types (id, name, estimated_duration_minutes, price, description, category, popular, active) VALUES " +
        "(2, 'Express Manicure', 30, 25.00, 'Quick nail shaping, cuticle care, and polish application', 'Manicure Services', false, true)";
    
    public static final String INSERT_DELUXE_PEDICURE = 
        "INSERT INTO service_types (id, name, estimated_duration_minutes, price, description, category, popular, active) VALUES " +
        "(3, 'Deluxe Pedicure', 75, 65.00, 'Ultimate foot treatment with exfoliation, hot stone massage, and paraffin', 'Pedicure Services', true, true)";
    
    // Legacy IDs for backward compatibility with existing tests
    public static final Long HAIRCUT_ID = SIGNATURE_MANICURE_ID;
    public static final Long HAIR_COLOR_ID = EXPRESS_MANICURE_ID;
    public static final Long MANICURE_ID = DELUXE_PEDICURE_ID;
    
    // Legacy names for backward compatibility
    public static final String HAIRCUT_NAME = SIGNATURE_MANICURE_NAME;
    public static final String HAIR_COLOR_NAME = EXPRESS_MANICURE_NAME;
    public static final String MANICURE_NAME = DELUXE_PEDICURE_NAME;
    
    // Legacy durations
    public static final Integer HAIRCUT_DURATION = SIGNATURE_MANICURE_DURATION;
    public static final Integer HAIR_COLOR_DURATION = EXPRESS_MANICURE_DURATION;
    public static final Integer MANICURE_DURATION = DELUXE_PEDICURE_DURATION;
    
    // Legacy prices
    public static final BigDecimal HAIRCUT_PRICE = SIGNATURE_MANICURE_PRICE;
    public static final BigDecimal HAIR_COLOR_PRICE = EXPRESS_MANICURE_PRICE;
    public static final BigDecimal MANICURE_PRICE = DELUXE_PEDICURE_PRICE;
    
    // Legacy insert statements (redirect to new ones)
    public static final String INSERT_HAIRCUT = INSERT_SIGNATURE_MANICURE;
    public static final String INSERT_HAIR_COLOR = INSERT_EXPRESS_MANICURE;
    public static final String INSERT_MANICURE = INSERT_DELUXE_PEDICURE;
    
    // Array of all inserts for batch operations
    public static final String[] ALL_INSERTS = {
        INSERT_SIGNATURE_MANICURE,
        INSERT_EXPRESS_MANICURE,
        INSERT_DELUXE_PEDICURE
    };
}
