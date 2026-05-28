-- V7: Normalize blank/empty contact fields to NULL.
--
-- The Customer.email and Customer.phone_number columns are UNIQUE-indexed.
-- The frontend previously sent empty strings ("") for the field the user
-- didn't provide, and the backend persisted them verbatim. The first guest
-- with email="" saved fine; every subsequent guest collided on the unique
-- index → 500.
--
-- Backend now coerces blanks to NULL before save (see CheckInService).
-- This migration cleans up any existing blank rows so the historical
-- collision rows no longer block new walk-ins.

UPDATE customers
   SET email = NULL
 WHERE email IS NOT NULL
   AND BTRIM(email) = '';

UPDATE customers
   SET phone_number = NULL
 WHERE phone_number IS NOT NULL
   AND BTRIM(phone_number) = '';

UPDATE customers
   SET note = NULL
 WHERE note IS NOT NULL
   AND BTRIM(note) = '';
