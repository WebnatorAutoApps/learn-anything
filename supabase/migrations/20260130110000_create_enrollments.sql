-- Create enrollments table to track which users are enrolled in which courses
create table public.enrollments (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  course_id uuid not null references public.courses on delete cascade,
  enrolled_at timestamptz not null default now(),

  primary key (id),
  unique (user_id, course_id)
);

-- Enable Row Level Security
alter table public.enrollments enable row level security;

-- Users can read their own enrollments
create policy "Users can read own enrollments"
  on public.enrollments for select
  using (auth.uid() = user_id);

-- Users can enroll themselves in courses
create policy "Users can insert own enrollments"
  on public.enrollments for insert
  with check (auth.uid() = user_id);

-- Users can unenroll themselves
create policy "Users can delete own enrollments"
  on public.enrollments for delete
  using (auth.uid() = user_id);

-- Course owners can read enrollments for their courses
create policy "Course owners can read enrollments for their courses"
  on public.enrollments for select
  using (
    exists (
      select 1 from public.courses
      where courses.id = enrollments.course_id
        and courses.user_id = auth.uid()
    )
  );

-- Index for fast lookups
create index enrollments_user_id_idx on public.enrollments (user_id);
create index enrollments_course_id_idx on public.enrollments (course_id);

-- Grant permissions
grant select, insert, delete on public.enrollments to authenticated;
