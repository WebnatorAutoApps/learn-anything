-- Add theme column to profiles table for visual theme preference
-- Default is 'terminal' (the existing green hacker aesthetic)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS theme text DEFAULT 'terminal';

-- Add a check constraint to validate allowed theme values
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_theme_check
CHECK (theme IN ('terminal', 'space', 'school', 'gym', '90s-internet'));
