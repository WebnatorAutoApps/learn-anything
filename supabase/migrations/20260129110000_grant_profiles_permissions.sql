-- Grant necessary permissions on profiles table to authenticated and anon roles.
-- Without these grants, RLS policies alone are insufficient — the roles also need
-- table-level privileges to perform SELECT/UPDATE operations via PostgREST.

grant select on public.profiles to anon, authenticated;
grant update on public.profiles to anon, authenticated;
