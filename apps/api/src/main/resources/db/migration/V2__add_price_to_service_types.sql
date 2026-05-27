-- Add price column to service_types table
ALTER TABLE service_types 
ADD COLUMN price DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
