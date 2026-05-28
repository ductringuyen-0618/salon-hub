-- Users authenticated via Supabase don't store a password in our DB —
-- the credential lives in Supabase's auth.users table and is verified
-- via JWT. The legacy local-JWT seed users still need a password, but
-- new Supabase-provisioned admins (from tenant onboarding) do not.
--
-- Drop the NOT NULL on users.password to allow rows where the
-- authoritative password lives in Supabase.

ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
