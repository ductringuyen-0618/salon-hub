-- SalonHub API - PostgreSQL Initial Schema
-- Migration: V1__create_initial_schema.sql
-- Description: Creates the complete database schema for SalonHub API
-- Target Database: PostgreSQL 13+
-- Created: Post MySQL migration cleanup

CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    note TEXT,
    guest BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employees (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    available BOOLEAN NOT NULL DEFAULT FALSE,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE service_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    estimated_duration_minutes INTEGER NOT NULL
);

CREATE TABLE appointments (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,
    appointment_time TIMESTAMP NOT NULL,
    start_time TIMESTAMP NOT NULL,
    actual_end_time TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE appointment_services (
    id BIGSERIAL PRIMARY KEY,
    appointment_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES service_types(id)
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_locked BOOLEAN NOT NULL DEFAULT TRUE,
    credentials_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    preferred_services TEXT,
    last_visit TIMESTAMP
);

CREATE TABLE queue (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    employee_id BIGINT,
    appointment_id BIGINT,
    queue_number INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'WAITING',
    estimated_wait_time INTEGER,
    position INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);

-- Create indexes for better performance
CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX idx_appointments_employee_id ON appointments(employee_id);
CREATE INDEX idx_appointments_time ON appointments(appointment_time);
CREATE INDEX idx_queue_customer_id ON queue(customer_id);
CREATE INDEX idx_queue_employee_id ON queue(employee_id);
CREATE INDEX idx_queue_status ON queue(status);
