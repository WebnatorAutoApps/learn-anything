-- Add username column to profiles table.
-- Usernames are auto-generated in the format: {normalized-name}-{5-hex-chars}
-- and are not editable by users.

-- 1. Add the column (nullable initially so we can backfill)
alter table public.profiles add column username text;

-- 2. Backfill existing profiles with generated usernames.
-- Uses the same logic as the application: lowercase name, strip special chars,
-- replace spaces with hyphens, append 5 random hex characters.
-- Retries on collision (unique constraint) up to 10 times per user.
do $$
declare
  rec record;
  raw_name text;
  prefix text;
  candidate text;
  attempt int;
  max_attempts int := 10;
begin
  for rec in select id, full_name from public.profiles where username is null loop
    raw_name := coalesce(rec.full_name, 'user');

    -- Normalize: lowercase, spaces to hyphens, strip non-alphanumeric/hyphens,
    -- collapse consecutive hyphens, trim leading/trailing hyphens
    prefix := lower(raw_name);
    prefix := regexp_replace(prefix, '\s+', '-', 'g');
    prefix := regexp_replace(prefix, '[^a-z0-9-]', '', 'g');
    prefix := regexp_replace(prefix, '-+', '-', 'g');
    prefix := regexp_replace(prefix, '^-|-$', '', 'g');
    if prefix = '' then
      prefix := 'user';
    end if;

    attempt := 0;
    loop
      attempt := attempt + 1;
      candidate := prefix || '-' || substr(encode(gen_random_bytes(3), 'hex'), 1, 5);

      -- Try to update; if no conflict we're done
      begin
        update public.profiles set username = candidate where id = rec.id;
        exit; -- success
      exception when unique_violation then
        if attempt >= max_attempts then
          raise exception 'Failed to generate unique username for user % after % attempts', rec.id, max_attempts;
        end if;
        raise notice 'Username collision for user %, attempt %. Retrying...', rec.id, attempt;
      end;
    end loop;
  end loop;
end;
$$;

-- 3. Now make the column non-nullable
alter table public.profiles alter column username set not null;

-- 4. Add unique constraint
alter table public.profiles add constraint profiles_username_unique unique (username);

-- 5. Update the handle_new_user trigger to generate a username on signup.
-- Uses retry logic for uniqueness within the trigger.
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
    candidate := prefix || '-' || substr(encode(gen_random_bytes(3), 'hex'), 1, 5);

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
