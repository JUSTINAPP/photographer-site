begin;
-- Qualify the storage row. Inside the workspace subquery, bare "name" resolved
-- to workspaces.name instead of storage.objects.name, denying legitimate files.
alter policy studio_file_read on storage.objects using (
 bucket_id='studio-originals' and exists(select 1 from public.workspaces w where w.id::text=(storage.foldername(storage.objects.name))[1] and w.owner_id=auth.uid()));
alter policy studio_file_insert on storage.objects with check (
 bucket_id='studio-originals' and exists(select 1 from public.workspaces w where w.id::text=(storage.foldername(storage.objects.name))[1] and w.owner_id=auth.uid()));
alter policy studio_admin_file_read on storage.objects using (
 bucket_id='studio-originals' and exists(select 1 from public.workspaces w where w.id::text=(storage.foldername(storage.objects.name))[1] and public.studio_role(w.id)='admin'));
alter policy studio_admin_file_insert on storage.objects with check (
 bucket_id='studio-originals' and exists(select 1 from public.workspaces w where w.id::text=(storage.foldername(storage.objects.name))[1] and public.studio_role(w.id)='admin'));
alter policy studio_team_files_read on storage.objects using (
 bucket_id='studio-originals' and exists(select 1 from public.workspaces w where w.id::text=(storage.foldername(storage.objects.name))[1] and public.studio_role(w.id)='editor'));
alter policy studio_team_files_insert on storage.objects with check (
 bucket_id='studio-originals' and exists(select 1 from public.workspaces w where w.id::text=(storage.foldername(storage.objects.name))[1] and public.studio_role(w.id)='editor'));
do $$begin
 if to_regclass('supabase_migrations.schema_migrations') is not null then
  execute $record$insert into supabase_migrations.schema_migrations(version,name,statements) values('202611260005','original_storage_paths',array[]::text[]) on conflict(version) do nothing$record$;
 end if;
end$$;
notify pgrst,'reload schema';
commit;
