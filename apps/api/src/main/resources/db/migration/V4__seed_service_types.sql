-- V4: Seed initial service types for nail salon demo
-- Uses INSERT ... ON CONFLICT for PostgreSQL compatibility

-- Manicure Services
INSERT INTO service_types (name, estimated_duration_minutes, price, description, category, popular, active)
VALUES ('Signature Manicure', 60, 45.00, 'Complete nail care with cuticle treatment, shaping, and luxury hand massage', 'Manicure Services', true, true)
ON CONFLICT (name) DO UPDATE SET 
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    popular = EXCLUDED.popular,
    active = EXCLUDED.active;

INSERT INTO service_types (name, estimated_duration_minutes, price, description, category, popular, active)
VALUES ('Express Manicure', 30, 25.00, 'Quick nail shaping, cuticle care, and polish application', 'Manicure Services', false, true)
ON CONFLICT (name) DO UPDATE SET 
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    popular = EXCLUDED.popular,
    active = EXCLUDED.active;

INSERT INTO service_types (name, estimated_duration_minutes, price, description, category, popular, active)
VALUES ('Gel Manicure', 45, 35.00, 'Long-lasting gel polish with chip-resistant finish', 'Manicure Services', false, true)
ON CONFLICT (name) DO UPDATE SET 
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    popular = EXCLUDED.popular,
    active = EXCLUDED.active;

INSERT INTO service_types (name, estimated_duration_minutes, price, description, category, popular, active)
VALUES ('French Manicure', 50, 40.00, 'Classic French tips with precision and elegance', 'Manicure Services', false, true)
ON CONFLICT (name) DO UPDATE SET 
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    popular = EXCLUDED.popular,
    active = EXCLUDED.active;

-- Pedicure Services
INSERT INTO service_types (name, estimated_duration_minutes, price, description, category, popular, active)
VALUES ('Deluxe Pedicure', 75, 65.00, 'Ultimate foot treatment with exfoliation, hot stone massage, and paraffin', 'Pedicure Services', true, true)
ON CONFLICT (name) DO UPDATE SET 
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    popular = EXCLUDED.popular,
    active = EXCLUDED.active;

INSERT INTO service_types (name, estimated_duration_minutes, price, description, category, popular, active)
VALUES ('Classic Pedicure', 45, 35.00, 'Essential foot care with nail trimming, shaping, and polish', 'Pedicure Services', false, true)
ON CONFLICT (name) DO UPDATE SET 
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    popular = EXCLUDED.popular,
    active = EXCLUDED.active;

INSERT INTO service_types (name, estimated_duration_minutes, price, description, category, popular, active)
VALUES ('Spa Pedicure', 60, 50.00, 'Relaxing treatment with callus removal and foot massage', 'Pedicure Services', false, true)
ON CONFLICT (name) DO UPDATE SET 
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    popular = EXCLUDED.popular,
    active = EXCLUDED.active;

INSERT INTO service_types (name, estimated_duration_minutes, price, description, category, popular, active)
VALUES ('Medical Pedicure', 60, 70.00, 'Therapeutic treatment for foot health and nail care', 'Pedicure Services', false, true)
ON CONFLICT (name) DO UPDATE SET 
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    popular = EXCLUDED.popular,
    active = EXCLUDED.active;

-- Nail Enhancements
INSERT INTO service_types (name, estimated_duration_minutes, price, description, category, popular, active)
VALUES ('Acrylic Full Set', 90, 55.00, 'Complete acrylic nail application with custom shaping and length', 'Nail Enhancements', false, true)
ON CONFLICT (name) DO UPDATE SET 
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    popular = EXCLUDED.popular,
    active = EXCLUDED.active;

INSERT INTO service_types (name, estimated_duration_minutes, price, description, category, popular, active)
VALUES ('Gel Extensions', 90, 60.00, 'Natural-looking gel extensions with superior durability', 'Nail Enhancements', false, true)
ON CONFLICT (name) DO UPDATE SET 
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    popular = EXCLUDED.popular,
    active = EXCLUDED.active;

INSERT INTO service_types (name, estimated_duration_minutes, price, description, category, popular, active)
VALUES ('Dip Powder', 60, 45.00, 'Healthy nail strengthening with beautiful color finish', 'Nail Enhancements', false, true)
ON CONFLICT (name) DO UPDATE SET 
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    popular = EXCLUDED.popular,
    active = EXCLUDED.active;

INSERT INTO service_types (name, estimated_duration_minutes, price, description, category, popular, active)
VALUES ('Fill & Maintenance', 45, 35.00, 'Professional maintenance for existing nail enhancements', 'Nail Enhancements', false, true)
ON CONFLICT (name) DO UPDATE SET 
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    popular = EXCLUDED.popular,
    active = EXCLUDED.active;

-- Nail Art & Design
INSERT INTO service_types (name, estimated_duration_minutes, price, description, category, popular, active)
VALUES ('Custom Nail Art', 30, 15.00, 'Per nail artistic design created by our talented artists', 'Nail Art & Design', true, true)
ON CONFLICT (name) DO UPDATE SET 
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    popular = EXCLUDED.popular,
    active = EXCLUDED.active;

INSERT INTO service_types (name, estimated_duration_minutes, price, description, category, popular, active)
VALUES ('3D Nail Art', 45, 25.00, 'Dimensional artwork with gems, charms, and textures', 'Nail Art & Design', false, true)
ON CONFLICT (name) DO UPDATE SET 
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    popular = EXCLUDED.popular,
    active = EXCLUDED.active;

INSERT INTO service_types (name, estimated_duration_minutes, price, description, category, popular, active)
VALUES ('Seasonal Designs', 35, 20.00, 'Trendy seasonal themes and holiday-inspired art', 'Nail Art & Design', false, true)
ON CONFLICT (name) DO UPDATE SET 
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    popular = EXCLUDED.popular,
    active = EXCLUDED.active;

INSERT INTO service_types (name, estimated_duration_minutes, price, description, category, popular, active)
VALUES ('Bridal Package', 120, 150.00, 'Complete bridal nail service with trial and wedding day application', 'Nail Art & Design', false, true)
ON CONFLICT (name) DO UPDATE SET 
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    popular = EXCLUDED.popular,
    active = EXCLUDED.active;

-- Add-On Services
INSERT INTO service_types (name, estimated_duration_minutes, price, description, category, popular, active)
VALUES ('Cuticle Oil Treatment', 10, 5.00, 'Nourishing treatment for healthy cuticles', 'Add-On Services', false, true)
ON CONFLICT (name) DO UPDATE SET 
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    popular = EXCLUDED.popular,
    active = EXCLUDED.active;

INSERT INTO service_types (name, estimated_duration_minutes, price, description, category, popular, active)
VALUES ('Hand Mask', 15, 10.00, 'Moisturizing mask for soft, smooth hands', 'Add-On Services', false, true)
ON CONFLICT (name) DO UPDATE SET 
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    popular = EXCLUDED.popular,
    active = EXCLUDED.active;

INSERT INTO service_types (name, estimated_duration_minutes, price, description, category, popular, active)
VALUES ('Paraffin Treatment', 20, 15.00, 'Therapeutic wax treatment for deep moisturizing', 'Add-On Services', false, true)
ON CONFLICT (name) DO UPDATE SET 
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    popular = EXCLUDED.popular,
    active = EXCLUDED.active;

INSERT INTO service_types (name, estimated_duration_minutes, price, description, category, popular, active)
VALUES ('Hot Stone Massage', 25, 20.00, 'Relaxing hot stone therapy for hands and arms', 'Add-On Services', false, true)
ON CONFLICT (name) DO UPDATE SET 
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    popular = EXCLUDED.popular,
    active = EXCLUDED.active;

-- Combo Packages
INSERT INTO service_types (name, estimated_duration_minutes, price, description, category, popular, active)
VALUES ('Mani-Pedi Combo', 90, 75.00, 'Complete manicure and pedicure package at a special price', 'Combo Packages', true, true)
ON CONFLICT (name) DO UPDATE SET 
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    popular = EXCLUDED.popular,
    active = EXCLUDED.active;

INSERT INTO service_types (name, estimated_duration_minutes, price, description, category, popular, active)
VALUES ('Spa Day Package', 150, 120.00, 'Deluxe manicure, deluxe pedicure, and relaxation treatments', 'Combo Packages', false, true)
ON CONFLICT (name) DO UPDATE SET 
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    popular = EXCLUDED.popular,
    active = EXCLUDED.active;
