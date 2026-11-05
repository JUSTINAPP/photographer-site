create table public.studio_team (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null check (email = lower(trim(email)) and length(email) between 3 and 254),
  role text not null check (role in ('editor', 'viewer')),
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (workspace_id, email),
  unique (workspace_id, user_id)
);
alter table public.studio_team enable row level security;
grant select, insert, delete on public.studio_team to authenticated;
grant update(role) on public.studio_team to authenticated;

create function public.studio_role(studio uuid)
returns text language sql stable security definer set search_path = '' as $$
  select case when w.owner_id = auth.uid() then 'owner' else t.role end
  from public.workspaces w
  left join public.studio_team t on t.workspace_id = w.id and t.user_id = auth.uid()
  where w.id = studio;
$$;
revoke all on function public.studio_role(uuid) from public;
grant execute on function public.studio_role(uuid) to authenticated;

create policy studio_team_owner on public.studio_team for all to authenticated
  using (public.studio_role(workspace_id) = 'owner')
  with check (public.studio_role(workspace_id) = 'owner');
create policy studio_team_pending_insert_guard on public.studio_team as restrictive for insert to authenticated
  with check (user_id is null);
create policy workspace_team_read on public.workspaces for select to authenticated using (public.studio_role(id) in ('editor','viewer'));

create function public.accept_studio_invitations()
returns uuid language plpgsql security definer set search_path = '' as $$
declare studio uuid;
begin
  with accepted as (
    update public.studio_team t set user_id = u.id
    from auth.users u
    where u.id = auth.uid() and u.email_confirmed_at is not null
      and lower(u.email) = t.email and t.user_id is null
      and not exists (select 1 from public.studio_team existing where existing.workspace_id = t.workspace_id and existing.user_id = u.id)
    returning t.workspace_id, t.created_at
  )
  select workspace_id into studio from accepted order by created_at desc, workspace_id limit 1;
  return studio;
end;
$$;
revoke all on function public.accept_studio_invitations() from public;
grant execute on function public.accept_studio_invitations() to authenticated;

create policy projects_team_read on public.projects for select to authenticated using (public.studio_role(workspace_id) in ('editor','viewer'));
create policy projects_team_insert on public.projects for insert to authenticated with check (public.studio_role(workspace_id) = 'editor');
create policy projects_team_update on public.projects for update to authenticated
  using (public.studio_role(workspace_id) = 'editor') with check (public.studio_role(workspace_id) = 'editor');

create policy media_team_read on public.studio_media for select to authenticated using (public.studio_role(workspace_id) in ('editor','viewer'));
create policy media_team_insert on public.studio_media for insert to authenticated with check (public.studio_role(workspace_id) = 'editor');
create policy media_team_update on public.studio_media for update to authenticated
  using (public.studio_role(workspace_id) = 'editor') with check (public.studio_role(workspace_id) = 'editor');

create policy websites_team_read on public.studio_websites for select to authenticated using (public.studio_role(workspace_id) in ('editor','viewer'));
create policy websites_team_insert on public.studio_websites for insert to authenticated with check (public.studio_role(workspace_id) = 'editor');
create policy websites_team_update on public.studio_websites for update to authenticated
  using (public.studio_role(workspace_id) = 'editor') with check (public.studio_role(workspace_id) = 'editor');

create policy studio_team_files_read on storage.objects for select to authenticated
  using (bucket_id = 'studio-originals' and exists (
    select 1 from public.workspaces w where w.id::text = (storage.foldername(name))[1] and public.studio_role(w.id) = 'editor'
  ));
create policy studio_team_files_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'studio-originals' and exists (
    select 1 from public.workspaces w where w.id::text = (storage.foldername(name))[1] and public.studio_role(w.id) = 'editor'
  ));

create or replace function public.claim_import_preview(workspace uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
declare claimed uuid;
begin
  update public.workspaces set last_import_preview=now()
  where id=workspace and public.studio_role(id) in ('owner','editor')
    and (last_import_preview is null or last_import_preview < now()-interval '1 minute')
  returning id into claimed;
  return claimed is not null;
end;
$$;
