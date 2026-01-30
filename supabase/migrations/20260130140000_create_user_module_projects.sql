-- Create user_module_projects table to track per-user project selections
-- and completion status for each module.
create table public.user_module_projects (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  module_id uuid not null references public.modules on delete cascade,
  project_id uuid not null references public.projects on delete cascade,
  selected_at timestamptz not null default now(),
  completed boolean not null default false,
  completed_at timestamptz,

  primary key (id),
  -- Only one project selection per user per module
  unique (user_id, module_id)
);

-- Enable RLS
alter table public.user_module_projects enable row level security;

-- Users can read their own project selections
create policy "Users can read own project selections"
  on public.user_module_projects for select
  using (auth.uid() = user_id);

-- Users can insert their own project selections
create policy "Users can insert own project selections"
  on public.user_module_projects for insert
  with check (auth.uid() = user_id);

-- Users can update their own project selections (for marking complete)
create policy "Users can update own project selections"
  on public.user_module_projects for update
  using (auth.uid() = user_id);

-- Users can delete their own project selections (for switching projects)
create policy "Users can delete own project selections"
  on public.user_module_projects for delete
  using (auth.uid() = user_id);

-- Indexes
create index user_module_projects_user_id_idx on public.user_module_projects (user_id);
create index user_module_projects_module_id_idx on public.user_module_projects (module_id);
create index user_module_projects_project_id_idx on public.user_module_projects (project_id);

-- Grant permissions
grant select, insert, update, delete on public.user_module_projects to authenticated;
