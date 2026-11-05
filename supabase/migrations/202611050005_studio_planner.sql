create function public.rename_studio_portfolio(studio_id uuid, portfolio_name text)
returns void language sql set search_path = '' as $$
  insert into public.studio_websites (workspace_id, draft)
  values (studio_id, jsonb_build_object('name', left(trim(portfolio_name), 100)))
  on conflict (workspace_id) do update
  set draft = studio_websites.draft || excluded.draft;
$$;
revoke all on function public.rename_studio_portfolio(uuid, text) from public;
grant execute on function public.rename_studio_portfolio(uuid, text) to authenticated;

create table public.studio_schedule (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  kind text not null check (kind in ('event', 'social')),
  title text not null check (length(title) between 1 and 150),
  day date,
  local_time time,
  notes text not null default '' check (length(notes) <= 3000),
  category text not null check (category in ('Shoot','Delivery','Meeting','Other','Instagram','LinkedIn','TikTok')),
  status text not null check (status in ('planned','draft','scheduled','posted')),
  media_id uuid references public.studio_media(id) on delete set null,
  check (kind <> 'event' or (day is not null and status = 'planned')),
  check (status <> 'scheduled' or (day is not null and local_time is not null))
);
create index studio_schedule_workspace_day on public.studio_schedule(workspace_id, day);
alter table public.studio_schedule enable row level security;
grant select, insert, update, delete on public.studio_schedule to authenticated;
create policy studio_schedule_owner on public.studio_schedule for all to authenticated
  using (exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid()))
  with check (
    exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid())
    and (media_id is null or exists (
      select 1 from public.studio_media m where m.id = media_id and m.workspace_id = studio_schedule.workspace_id
    ))
  );
