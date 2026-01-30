-- Add commitment_interval_days to enrollments table
alter table public.enrollments
  add column commitment_interval_days integer not null default 3;

-- Also add it to courses for owner enrollments
alter table public.courses
  add column commitment_interval_days integer;

-- Create module_schedules table to track per-module unlock/due dates
create table public.module_schedules (
  id uuid not null default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments on delete cascade,
  module_id uuid not null references public.modules on delete cascade,
  unlock_date date not null,
  due_date date not null,
  created_at timestamptz not null default now(),

  primary key (id),
  unique (enrollment_id, module_id)
);

-- For owner enrollments (no enrollment record), store schedules by course + user
create table public.owner_module_schedules (
  id uuid not null default gen_random_uuid(),
  course_id uuid not null references public.courses on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  module_id uuid not null references public.modules on delete cascade,
  unlock_date date not null,
  due_date date not null,
  created_at timestamptz not null default now(),

  primary key (id),
  unique (course_id, user_id, module_id)
);

-- Enable RLS
alter table public.module_schedules enable row level security;
alter table public.owner_module_schedules enable row level security;

-- module_schedules RLS: users can read their own schedules
create policy "Users can read own module schedules"
  on public.module_schedules for select
  using (
    exists (
      select 1 from public.enrollments
      where enrollments.id = module_schedules.enrollment_id
        and enrollments.user_id = auth.uid()
    )
  );

-- module_schedules: users can insert their own schedules
create policy "Users can insert own module schedules"
  on public.module_schedules for insert
  with check (
    exists (
      select 1 from public.enrollments
      where enrollments.id = module_schedules.enrollment_id
        and enrollments.user_id = auth.uid()
    )
  );

-- module_schedules: users can delete their own schedules (on unenroll)
create policy "Users can delete own module schedules"
  on public.module_schedules for delete
  using (
    exists (
      select 1 from public.enrollments
      where enrollments.id = module_schedules.enrollment_id
        and enrollments.user_id = auth.uid()
    )
  );

-- owner_module_schedules RLS: owners can read their own
create policy "Owners can read own module schedules"
  on public.owner_module_schedules for select
  using (auth.uid() = user_id);

-- owner_module_schedules: owners can insert their own
create policy "Owners can insert own module schedules"
  on public.owner_module_schedules for insert
  with check (auth.uid() = user_id);

-- owner_module_schedules: owners can delete their own
create policy "Owners can delete own module schedules"
  on public.owner_module_schedules for delete
  using (auth.uid() = user_id);

-- Indexes
create index module_schedules_enrollment_id_idx on public.module_schedules (enrollment_id);
create index module_schedules_module_id_idx on public.module_schedules (module_id);
create index owner_module_schedules_course_user_idx on public.owner_module_schedules (course_id, user_id);
create index owner_module_schedules_module_id_idx on public.owner_module_schedules (module_id);

-- Grant permissions
grant select, insert, delete on public.module_schedules to authenticated;
grant select, insert, delete on public.owner_module_schedules to authenticated;
