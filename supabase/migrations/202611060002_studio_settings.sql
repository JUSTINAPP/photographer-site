alter table public.studio_team drop constraint studio_team_role_check;
alter table public.studio_team add constraint studio_team_role_check
  check (role in ('admin','social','assistant','editor','viewer'));

revoke update on public.studio_team from authenticated;
grant update(role) on public.studio_team to authenticated;

create policy team_admin_read on public.studio_team for select to authenticated
  using (public.studio_role(workspace_id) = 'admin');
create policy team_admin_manage on public.studio_team for all to authenticated
  using (public.studio_role(workspace_id) = 'admin' and role <> 'admin')
  with check (public.studio_role(workspace_id) = 'admin' and role <> 'admin');
drop policy workspace_team_read on public.workspaces;
create policy workspace_team_read on public.workspaces for select to authenticated
  using (public.studio_role(id) is not null);

create policy projects_extended_read on public.projects for select to authenticated
  using (public.studio_role(workspace_id) in ('admin','assistant','social'));
create policy projects_admin_insert on public.projects for insert to authenticated
  with check (public.studio_role(workspace_id) = 'admin');
create policy projects_admin_update on public.projects for update to authenticated
  using (public.studio_role(workspace_id) = 'admin') with check (public.studio_role(workspace_id) = 'admin');
create policy media_extended_read on public.studio_media for select to authenticated
  using (public.studio_role(workspace_id) in ('admin','assistant','social'));
create policy media_admin_insert on public.studio_media for insert to authenticated
  with check (public.studio_role(workspace_id) = 'admin');
create policy media_admin_update on public.studio_media for update to authenticated
  using (public.studio_role(workspace_id) = 'admin') with check (public.studio_role(workspace_id) = 'admin');
create policy websites_admin on public.studio_websites for all to authenticated
  using (public.studio_role(workspace_id) = 'admin') with check (public.studio_role(workspace_id) = 'admin');
create policy websites_assistant_read on public.studio_websites for select to authenticated
  using (public.studio_role(workspace_id) = 'assistant');
create policy records_admin on public.studio_records for all to authenticated
  using (public.studio_role(workspace_id) = 'admin') with check (public.studio_role(workspace_id) = 'admin');

create policy schedule_team on public.studio_schedule for all to authenticated
  using (public.studio_role(workspace_id) = 'admin'
    or (kind = 'social' and public.studio_role(workspace_id) = 'social')
    or (kind = 'event' and public.studio_role(workspace_id) = 'assistant'))
  with check ((public.studio_role(workspace_id) = 'admin'
    or (kind = 'social' and public.studio_role(workspace_id) = 'social')
    or (kind = 'event' and public.studio_role(workspace_id) = 'assistant'))
    and (media_id is null or exists (
      select 1 from public.studio_media m where m.id = media_id and m.workspace_id = studio_schedule.workspace_id
    )));

create policy studio_admin_file_read on storage.objects for select to authenticated
  using (bucket_id = 'studio-originals' and exists (
    select 1 from public.workspaces w where w.id::text = (storage.foldername(name))[1] and public.studio_role(w.id) = 'admin'));
create policy studio_admin_file_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'studio-originals' and exists (
    select 1 from public.workspaces w where w.id::text = (storage.foldername(name))[1] and public.studio_role(w.id) = 'admin'));

create or replace function public.claim_import_preview(workspace uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
declare claimed uuid;
begin
  update public.workspaces set last_import_preview=now()
  where id=workspace and public.studio_role(id) in ('owner','admin','editor')
    and (last_import_preview is null or last_import_preview < now()-interval '1 minute')
  returning id into claimed;
  return claimed is not null;
end;
$$;

create function public.patch_studio_settings(studio uuid, patch jsonb) returns void
language sql security invoker set search_path = '' as $$
  insert into public.studio_websites (workspace_id, draft)
  select studio, patch where public.studio_role(studio) in ('owner','admin')
  on conflict (workspace_id) do update set draft = studio_websites.draft || excluded.draft;
$$;
revoke all on function public.patch_studio_settings(uuid,jsonb) from public;
grant execute on function public.patch_studio_settings(uuid,jsonb) to authenticated;

create table public.studio_domains (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  hostname text not null check (length(hostname) <= 253 and hostname ~ '^[a-z0-9.-]+\.[a-z]{2,}$'),
  verification_token uuid not null default gen_random_uuid()
);
alter table public.studio_domains enable row level security;
revoke all on public.studio_domains from anon, authenticated;
grant select, delete on public.studio_domains to authenticated;
grant insert(workspace_id,hostname), update(workspace_id,hostname) on public.studio_domains to authenticated;
create policy studio_domains_admin on public.studio_domains for all to authenticated
  using (public.studio_role(workspace_id) in ('owner','admin'))
  with check (public.studio_role(workspace_id) in ('owner','admin'));

create function public.published_domain_candidates(domain_name text)
returns table (public_id uuid, verification_token uuid)
language sql stable security definer set search_path = '' as $$
  select s.public_id, d.verification_token
  from public.studio_domains d join public.studio_websites s on s.workspace_id = d.workspace_id
  where d.hostname = domain_name and s.published is not null;
$$;
revoke all on function public.published_domain_candidates(text) from public;
grant execute on function public.published_domain_candidates(text) to anon, authenticated;
