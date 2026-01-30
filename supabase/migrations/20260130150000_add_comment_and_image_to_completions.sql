-- Add optional comment and image_url columns to user_module_projects
-- for capturing feedback and visual evidence when completing a module.
alter table public.user_module_projects
  add column comment text,
  add column image_url text;

-- Enforce a reasonable max length for comments (2000 characters)
alter table public.user_module_projects
  add constraint user_module_projects_comment_length
  check (comment is null or char_length(comment) <= 2000);
