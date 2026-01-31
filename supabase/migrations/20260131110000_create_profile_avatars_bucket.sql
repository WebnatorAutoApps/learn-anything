-- Create a storage bucket for profile avatar images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-avatars',
  'profile-avatars',
  true,
  5242880,  -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
);

-- Allow authenticated users to upload to their own folder
create policy "Users can upload profile avatars"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to read their own avatars
create policy "Users can read own profile avatars"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read access (avatars should be publicly viewable)
create policy "Public read access for profile avatars"
  on storage.objects for select
  to anon
  using (bucket_id = 'profile-avatars');

-- Allow authenticated users to update (overwrite) their own avatars
create policy "Users can update own profile avatars"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own avatars
create policy "Users can delete own profile avatars"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
