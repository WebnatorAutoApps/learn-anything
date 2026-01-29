-- Allow authenticated users to insert their own profile row.
-- This is needed so the /api/user endpoint can auto-create a profile
-- when the handle_new_user trigger didn't fire (e.g., user existed
-- before the trigger was created, or the trigger failed silently).

grant insert on public.profiles to authenticated;

create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);
