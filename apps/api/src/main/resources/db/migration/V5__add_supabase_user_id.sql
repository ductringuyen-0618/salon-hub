-- V5: Link our local User rows to Supabase Auth identities.
--
-- Supabase issues JWTs with a UUID `sub` claim that identifies the user inside
-- Supabase's auth.users table. We store that UUID on our local users row so
-- the Spring backend can map an incoming Supabase token → local User
-- (which carries role assignment + business-relevant fields).
--
-- Existing seed users continue to work with the legacy JwtService until the
-- migration completes — `supabase_user_id` is nullable for now.

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS supabase_user_id UUID;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_supabase_user_id
    ON users (supabase_user_id)
    WHERE supabase_user_id IS NOT NULL;
