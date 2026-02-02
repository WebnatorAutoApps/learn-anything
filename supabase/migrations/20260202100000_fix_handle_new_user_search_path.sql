-- Fix handle_new_user trigger: qualify gen_random_bytes with extensions schema.
-- The function uses `security definer set search_path = ''` which means
-- gen_random_bytes (from pgcrypto in the extensions schema) is not found,
-- causing "Database error saving new user" on signup.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  raw_name text;
  prefix text;
  candidate text;
  attempt int := 0;
  max_attempts int := 10;
begin
  raw_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    'user'
  );

  -- Normalize name to slug
  prefix := lower(raw_name);
  prefix := regexp_replace(prefix, '\s+', '-', 'g');
  prefix := regexp_replace(prefix, '[^a-z0-9-]', '', 'g');
  prefix := regexp_replace(prefix, '-+', '-', 'g');
  prefix := regexp_replace(prefix, '^-|-$', '', 'g');
  if prefix = '' then
    prefix := 'user';
  end if;

  loop
    attempt := attempt + 1;
    candidate := prefix || '-' || substr(encode(extensions.gen_random_bytes(3), 'hex'), 1, 5);

    begin
      insert into public.profiles (id, full_name, email, avatar_url, username)
      values (
        new.id,
        coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
        new.email,
        coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture'),
        candidate
      );
      return new; -- success
    exception when unique_violation then
      if attempt >= max_attempts then
        raise exception 'Failed to generate unique username for new user % after % attempts', new.id, max_attempts;
      end if;
      raise notice 'Username collision for new user %, attempt %. Retrying...', new.id, attempt;
    end;
  end loop;
end;
$$;
