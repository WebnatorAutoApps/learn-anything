-- Create a storage bucket for completion images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'completion-images',
  'completion-images',
  true,
  10485760,  -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp']
);

-- Allow authenticated users to upload to their own folder
create policy "Users can upload completion images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'completion-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to read their own images
create policy "Users can read own completion images"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'completion-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read access (since the bucket is public, images are viewable by URL)
create policy "Public read access for completion images"
  on storage.objects for select
  to anon
  using (bucket_id = 'completion-images');

-- Allow authenticated users to delete their own images
create policy "Users can delete own completion images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'completion-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
