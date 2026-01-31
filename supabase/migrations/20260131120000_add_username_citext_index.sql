-- Add case-insensitive unique index on username and format check constraint.
-- This ensures no two users can have usernames differing only by case,
-- and enforces format rules at the database level.

-- 1. Create a case-insensitive unique index (keeps the existing constraint as-is
--    but adds a functional index on lower(username) for uniqueness).
create unique index if not exists profiles_username_lower_unique
  on public.profiles (lower(username));

-- 2. Add a check constraint enforcing username format:
--    - Only lowercase letters, digits, and hyphens
--    - Between 3 and 39 characters
--    - Cannot start or end with a hyphen
--    - No consecutive hyphens
alter table public.profiles
  add constraint profiles_username_format_check
  check (
    username ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'
    and length(username) between 3 and 39
    and username !~ '--'
  );
