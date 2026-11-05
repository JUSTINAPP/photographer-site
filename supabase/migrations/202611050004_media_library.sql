create table public.studio_media (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  kind text not null check (kind in ('photo', 'video')),
  name text not null check (length(name) between 1 and 150),
  source_url text not null check (length(source_url) <= 2048 and source_url like 'https://%'),
  created_at timestamptz not null default now(),
  unique (workspace_id, source_url)
);

alter table public.studio_media enable row level security;
grant select, insert, update on public.studio_media to authenticated;

create policy studio_media_owner on public.studio_media
  for all to authenticated
  using (exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid()))
  with check (exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid()));
