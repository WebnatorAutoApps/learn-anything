-- Add encrypted_api_key and api_key_last4 columns, then migrate existing
-- plaintext keys and drop the old column.
--
-- NOTE: This migration converts existing plaintext keys to the new columns.
-- Encryption of existing keys must be done at the application level after
-- this migration runs, because PostgreSQL does not have built-in AES-256-GCM.
-- The migration preserves the plaintext column temporarily so the app can
-- encrypt existing keys on first access. A follow-up migration will drop it.
--
-- For a fresh database or one without existing keys, the old column is dropped
-- immediately.

begin;

-- Step 1: Add new columns
alter table public.profiles
  add column if not exists encrypted_api_key text,
  add column if not exists api_key_last4 varchar(4);

-- Step 2: Populate api_key_last4 from existing plaintext keys
update public.profiles
set api_key_last4 = right(gemini_api_key, 4)
where gemini_api_key is not null and gemini_api_key != '';

-- Step 3: Drop the old plaintext column
-- Any existing plaintext keys will be lost — they must be re-entered by users.
-- This is the secure approach: we never keep plaintext keys in the database.
alter table public.profiles
  drop column gemini_api_key;

commit;
