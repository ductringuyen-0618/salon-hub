-- V6: Reconcile the appointments table with the current JPA entity model.
--
-- Two legacy NOT NULL columns were preventing the booking flow from
-- inserting rows:
--
--   1. appointment_time TIMESTAMP NOT NULL  — duplicate of start_time. The
--      Appointment entity only persists start_time; appointment_time stayed
--      NULL on every INSERT and triggered a not-null violation in prod.
--
--   2. employee_id BIGINT NOT NULL  — the public-booking flow now allows
--      "any available staff" (employee_id null) when the customer doesn't
--      pick a specific technician. The NOT NULL constraint blocked those.
--
-- Drop the orphan column and relax the FK. The FK constraint on employee_id
-- itself is preserved (still references employees(id)) so dangling values
-- still fail; only the NOT NULL requirement is removed.

-- Drop the dependent index from V1 first; CASCADE not strictly required
-- with explicit ordering but kept for safety.
DROP INDEX IF EXISTS idx_appointments_time;

ALTER TABLE appointments
    DROP COLUMN IF EXISTS appointment_time;

ALTER TABLE appointments
    ALTER COLUMN employee_id DROP NOT NULL;
