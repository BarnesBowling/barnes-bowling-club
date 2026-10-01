alter table public.membership_applications
  add column if not exists passport_photo text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'application-photos',
  'application-photos',
  false,
  5242880,
  '{image/jpeg,image/jpg,image/png,image/gif,image/webp}'
)
on conflict (id) do nothing;

create policy "application_photos_admin_select"
  on storage.objects for select
  using (bucket_id = 'application-photos' and public.is_admin());

create policy "application_photos_service_insert"
  on storage.objects for insert
  with check (bucket_id = 'application-photos');
