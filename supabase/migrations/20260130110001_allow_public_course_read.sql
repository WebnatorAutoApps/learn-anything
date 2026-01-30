-- Allow anyone (including anonymous/unauthenticated) to read course overview data.
-- This enables the course overview page to show high-level info to unenrolled users.

-- Courses: allow public read access (anon role already has SELECT grant)
create policy "Anyone can read courses"
  on public.courses for select
  using (true);

-- Modules: allow public read access for module titles/counts (anon role already has SELECT grant)
create policy "Anyone can read modules"
  on public.modules for select
  using (true);

-- Projects remain restricted to course owners and enrolled users.
-- Enrolled users can read projects for courses they are enrolled in.
create policy "Enrolled users can read projects"
  on public.projects for select
  using (
    exists (
      select 1 from public.modules
      join public.courses on courses.id = modules.course_id
      left join public.enrollments on enrollments.course_id = courses.id
        and enrollments.user_id = auth.uid()
      where modules.id = projects.module_id
        and (courses.user_id = auth.uid() or enrollments.id is not null)
    )
  );
