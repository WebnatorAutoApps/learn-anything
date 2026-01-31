-- Add tone column to profiles for configurable AI communication style
alter table public.profiles
  add column if not exists tone text;

-- No default value in the column itself; the application layer applies the default
-- when the value is null. This keeps existing rows untouched and avoids a full table rewrite.
