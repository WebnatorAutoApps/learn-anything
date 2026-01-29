-- Add gemini_api_key column to profiles table
alter table public.profiles
  add column gemini_api_key text;
