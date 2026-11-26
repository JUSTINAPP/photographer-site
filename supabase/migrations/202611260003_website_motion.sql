begin;
-- Draft encodes stay in studio-originals. Only an explicit website publish copies them here.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('studio-web-assets','studio-web-assets',true,20971520,array['video/mp4'])
on conflict (id) do nothing;
create policy studio_web_asset_insert on storage.objects for insert to authenticated
with check (bucket_id='studio-web-assets' and public.studio_role(((storage.foldername(name))[1])::uuid) in ('owner','admin','editor'));
create policy studio_web_asset_read on storage.objects for select to authenticated
using (bucket_id='studio-web-assets' and public.studio_role(((storage.foldername(name))[1])::uuid) in ('owner','admin','editor'));
create policy studio_editor_motion_read on storage.objects for select to authenticated
using (bucket_id='studio-originals' and public.studio_role(((storage.foldername(name))[1])::uuid)='editor' and (storage.foldername(name))[2]='motion');
create policy studio_editor_motion_insert on storage.objects for insert to authenticated
with check (bucket_id='studio-originals' and public.studio_role(((storage.foldername(name))[1])::uuid)='editor' and (storage.foldername(name))[2]='motion');
create or replace function public.patch_studio_settings(studio uuid, patch jsonb) returns void
language sql security invoker set search_path = '' as $$
  insert into public.studio_websites (workspace_id, draft)
  select studio, patch where public.studio_role(studio) in ('owner','admin','editor')
  on conflict (workspace_id) do update set draft = studio_websites.draft || excluded.draft;
$$;
-- Public files use immutable names. Clients cannot overwrite another studio’s file.
do $$begin
 if to_regclass('supabase_migrations.schema_migrations') is not null then
  execute $record$insert into supabase_migrations.schema_migrations(version,name,statements) values('202611260003','website_motion',array[]::text[]) on conflict(version) do nothing$record$;
 end if;
end$$;
notify pgrst, 'reload schema';
commit;
