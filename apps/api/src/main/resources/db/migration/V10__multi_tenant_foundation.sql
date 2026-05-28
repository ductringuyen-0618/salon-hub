-- V10: Multi-tenant SaaS foundation.
--
-- Adds a `tenants` table and stamps every multi-tenant entity with a
-- nullable `tenant_id` FK. Existing rows get backfilled to a seeded
-- "default" tenant (id=1) so the single-tenant flow continues to work
-- while we layer in tenant resolution per request.
--
-- After this migration, the application's TenantContext + Hibernate filter
-- will WHERE tenant_id = :currentTenantId on every read; the
-- TenantEntityListener will stamp tenant_id on every write.

-- ---------- 1. Create tenants table ----------------------------------

CREATE TABLE tenants (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(60) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed the default tenant. All pre-V10 rows belong to this tenant.
INSERT INTO tenants (id, slug, name) VALUES (1, 'default', 'Default Salon');
-- Reserve id=1 for the default tenant, advance sequence past it.
SELECT setval('tenants_id_seq', GREATEST(1, (SELECT MAX(id) FROM tenants)));

-- ---------- 2. Add tenant_id to each multi-tenant table --------------
-- Pattern per table: add nullable column, backfill to 1, set NOT NULL,
-- add FK + supporting index.

ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS tenant_id BIGINT;
UPDATE business_settings SET tenant_id = 1 WHERE tenant_id IS NULL;
ALTER TABLE business_settings ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE business_settings
    DROP CONSTRAINT IF EXISTS business_settings_single_row;
-- Replace single-row constraint with one-row-per-tenant:
ALTER TABLE business_settings
    ADD CONSTRAINT business_settings_tenant_unique UNIQUE (tenant_id);
ALTER TABLE business_settings
    ADD CONSTRAINT fk_business_settings_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- id column was manually set in V9 (single row, id=1). Now that we'll add
-- one row per tenant, give it an auto-generating sequence so new tenant
-- settings rows get unique IDs without the application having to allocate.
CREATE SEQUENCE IF NOT EXISTS business_settings_id_seq;
SELECT setval('business_settings_id_seq', GREATEST(1, (SELECT MAX(id) FROM business_settings)));
ALTER TABLE business_settings ALTER COLUMN id SET DEFAULT nextval('business_settings_id_seq');
ALTER SEQUENCE business_settings_id_seq OWNED BY business_settings.id;

ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id BIGINT;
UPDATE users SET tenant_id = 1 WHERE tenant_id IS NULL;
ALTER TABLE users ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE users
    ADD CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);

-- Email is currently UNIQUE globally; for multi-tenancy email should be
-- unique PER tenant (Lisa's salon can have admin@lisa.com, Bob's can have
-- admin@bob.com). Drop the global unique and add a composite.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE users
    ADD CONSTRAINT users_tenant_email_unique UNIQUE (tenant_id, email);

ALTER TABLE employees ADD COLUMN IF NOT EXISTS tenant_id BIGINT;
UPDATE employees SET tenant_id = 1 WHERE tenant_id IS NULL;
ALTER TABLE employees ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE employees
    ADD CONSTRAINT fk_employees_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_employees_tenant ON employees(tenant_id);

ALTER TABLE customers ADD COLUMN IF NOT EXISTS tenant_id BIGINT;
UPDATE customers SET tenant_id = 1 WHERE tenant_id IS NULL;
ALTER TABLE customers ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE customers
    ADD CONSTRAINT fk_customers_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);

-- Customer email was globally unique; relax to per-tenant.
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_email_key;
ALTER TABLE customers
    ADD CONSTRAINT customers_tenant_email_unique UNIQUE (tenant_id, email);

ALTER TABLE service_types ADD COLUMN IF NOT EXISTS tenant_id BIGINT;
UPDATE service_types SET tenant_id = 1 WHERE tenant_id IS NULL;
ALTER TABLE service_types ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE service_types
    ADD CONSTRAINT fk_service_types_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_service_types_tenant ON service_types(tenant_id);
-- Name was globally unique; scope to per-tenant.
ALTER TABLE service_types DROP CONSTRAINT IF EXISTS service_types_name_key;
ALTER TABLE service_types
    ADD CONSTRAINT service_types_tenant_name_unique UNIQUE (tenant_id, name);

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS tenant_id BIGINT;
UPDATE appointments SET tenant_id = 1 WHERE tenant_id IS NULL;
ALTER TABLE appointments ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE appointments
    ADD CONSTRAINT fk_appointments_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_appointments_tenant ON appointments(tenant_id);

ALTER TABLE queue ADD COLUMN IF NOT EXISTS tenant_id BIGINT;
UPDATE queue SET tenant_id = 1 WHERE tenant_id IS NULL;
ALTER TABLE queue ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE queue
    ADD CONSTRAINT fk_queue_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_queue_tenant ON queue(tenant_id);
