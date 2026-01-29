-- Create courses table
create table public.courses (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  normalized_title text not null,
  learning_goal text not null,
  learning_goal_details text not null,
  expertise_level text not null,
  expertise_details text,
  expected_skill_level text not null,
  likelihood_of_learning integer not null,
  total_modules integer not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (id)
);

-- Create modules table
create table public.modules (
  id uuid not null default gen_random_uuid(),
  course_id uuid not null references public.courses on delete cascade,
  module_index integer not null,
  title text not null,
  description text not null,
  created_at timestamptz not null default now(),

  primary key (id),
  unique (course_id, module_index)
);

-- Create projects table (each module has exactly 3 project options)
create table public.projects (
  id uuid not null default gen_random_uuid(),
  module_id uuid not null references public.modules on delete cascade,
  project_index integer not null,
  title text not null,
  instructions text not null,
  objective text not null,
  created_at timestamptz not null default now(),

  primary key (id),
  unique (module_id, project_index)
);

-- Enable Row Level Security on all tables
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.projects enable row level security;

-- Courses: users can only see/manage their own courses
create policy "Users can read own courses"
  on public.courses for select
  using (auth.uid() = user_id);

create policy "Users can insert own courses"
  on public.courses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own courses"
  on public.courses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own courses"
  on public.courses for delete
  using (auth.uid() = user_id);

-- Modules: access through course ownership
create policy "Users can read own modules"
  on public.modules for select
  using (
    exists (
      select 1 from public.courses
      where courses.id = modules.course_id
        and courses.user_id = auth.uid()
    )
  );

create policy "Users can insert own modules"
  on public.modules for insert
  with check (
    exists (
      select 1 from public.courses
      where courses.id = modules.course_id
        and courses.user_id = auth.uid()
    )
  );

-- Projects: access through module -> course ownership
create policy "Users can read own projects"
  on public.projects for select
  using (
    exists (
      select 1 from public.modules
      join public.courses on courses.id = modules.course_id
      where modules.id = projects.module_id
        and courses.user_id = auth.uid()
    )
  );

create policy "Users can insert own projects"
  on public.projects for insert
  with check (
    exists (
      select 1 from public.modules
      join public.courses on courses.id = modules.course_id
      where modules.id = projects.module_id
        and courses.user_id = auth.uid()
    )
  );

-- Auto-update updated_at on courses
create trigger on_course_updated
  before update on public.courses
  for each row execute function public.handle_updated_at();

-- Indexes for common queries
create index courses_user_id_idx on public.courses (user_id);
create index modules_course_id_idx on public.modules (course_id);
create index projects_module_id_idx on public.projects (module_id);

-- Grant permissions to authenticated and anon roles
grant select, insert, update, delete on public.courses to authenticated;
grant select, insert on public.modules to authenticated;
grant select, insert on public.projects to authenticated;
grant select on public.courses to anon;
grant select on public.modules to anon;
grant select on public.projects to anon;
