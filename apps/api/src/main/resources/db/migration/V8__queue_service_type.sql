-- V8: Link queue entries to a requested service so the wait-time scheduler
-- can use the real per-service duration instead of a 30-minute default.
--
-- service_type_id is optional — guests who don't pick a service still get
-- queued; the scheduler falls back to the default duration for them.

ALTER TABLE queue
    ADD COLUMN IF NOT EXISTS service_type_id BIGINT;

ALTER TABLE queue
    ADD CONSTRAINT fk_queue_service_type
    FOREIGN KEY (service_type_id) REFERENCES service_types(id);

CREATE INDEX IF NOT EXISTS idx_queue_service_type_id ON queue(service_type_id);
