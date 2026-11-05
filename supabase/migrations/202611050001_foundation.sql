create table public.workspaces (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null unique references auth.users(id) on delete cascade,
 name text not null default 'My studio', created_at timestamptz not null default now(), last_import_preview timestamptz
);
create table public.projects (
 id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
 title text not null check(length(title) between 1 and 180), category text not null default 'Imported', description text,
 source_url text not null, image_url text, published boolean not null default false,
 created_at timestamptz not null default now(), unique(workspace_id,source_url)
);
create index projects_workspace on public.projects(workspace_id);
alter table public.workspaces enable row level security;
alter table public.projects enable row level security;
create policy workspace_owner_read on public.workspaces for select to authenticated using(owner_id=auth.uid());
create policy project_owner_read on public.projects for select to authenticated using(exists(select 1 from public.workspaces where id=workspace_id and owner_id=auth.uid()));
create policy published_projects on public.projects for select to anon,authenticated using(published=true);
create policy project_owner_insert on public.projects for insert to authenticated with check(exists(select 1 from public.workspaces where id=workspace_id and owner_id=auth.uid()));
create policy project_owner_update on public.projects for update to authenticated using(exists(select 1 from public.workspaces where id=workspace_id and owner_id=auth.uid())) with check(exists(select 1 from public.workspaces where id=workspace_id and owner_id=auth.uid()));
create policy project_owner_delete on public.projects for delete to authenticated using(exists(select 1 from public.workspaces where id=workspace_id and owner_id=auth.uid()));
create function public.initialize_studio() returns uuid language plpgsql security definer set search_path='' as $$
declare studio_id uuid;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 insert into public.workspaces(owner_id) values(auth.uid()) on conflict(owner_id) do nothing;
 select id into studio_id from public.workspaces where owner_id=auth.uid();return studio_id;
end; $$;
revoke all on function public.initialize_studio() from public;grant execute on function public.initialize_studio() to authenticated;
create function public.claim_import_preview(workspace uuid) returns boolean language plpgsql security definer set search_path='' as $$
declare claimed uuid;
begin
 update public.workspaces set last_import_preview=now() where id=workspace and owner_id=auth.uid() and (last_import_preview is null or last_import_preview < now()-interval '1 minute') returning id into claimed;
 return claimed is not null;
end; $$;
revoke all on function public.claim_import_preview(uuid) from public;grant execute on function public.claim_import_preview(uuid) to authenticated;
-- Original files must stay private. Public web derivatives will use a separate publication path.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('studio-originals','studio-originals',false,52428800,array['image/jpeg','image/png','image/webp','video/mp4']) on conflict(id) do nothing;
create policy studio_file_read on storage.objects for select to authenticated using(bucket_id='studio-originals' and exists(select 1 from public.workspaces where id::text=(storage.foldername(name))[1] and owner_id=auth.uid()));
create policy studio_file_insert on storage.objects for insert to authenticated with check(bucket_id='studio-originals' and exists(select 1 from public.workspaces where id::text=(storage.foldername(name))[1] and owner_id=auth.uid()));
