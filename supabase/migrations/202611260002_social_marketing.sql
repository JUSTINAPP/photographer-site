-- Add social format/carousel metadata while preserving the existing calendar rows.
alter table public.studio_schedule add column if not exists details jsonb not null default '{}'::jsonb check (jsonb_typeof(details)='object' and octet_length(details::text)<=24000);
alter table public.studio_schedule drop constraint if exists studio_schedule_category_check;
alter table public.studio_schedule add constraint studio_schedule_category_check check(category in ('Shoot','Delivery','Meeting','Other','Instagram','LinkedIn','TikTok','Facebook','Event','Article'));
create table public.studio_growth_records (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references public.workspaces(id) on delete cascade,
 kind text not null check(kind in ('idea','pillar','guidelines','connection','review')),
 title text not null check(length(title) between 1 and 180),
 data jsonb not null default '{}'::jsonb check(jsonb_typeof(data)='object' and octet_length(data::text)<=32000),
 archived boolean not null default false,
 created_at timestamptz not null default now()
);
create index studio_growth_scope on public.studio_growth_records(workspace_id,kind);
create unique index studio_growth_singleton on public.studio_growth_records(workspace_id,kind,title);
alter table public.studio_growth_records enable row level security;
grant select,insert,update,delete on public.studio_growth_records to authenticated;
create policy growth_read on public.studio_growth_records for select to authenticated using(public.studio_role(workspace_id) in ('owner','admin','social'));
create policy growth_insert on public.studio_growth_records for insert to authenticated with check(public.studio_role(workspace_id) in ('owner','admin','social') and (kind <> 'connection' or public.is_platform_admin()));
create policy growth_update on public.studio_growth_records for update to authenticated using(public.studio_role(workspace_id) in ('owner','admin','social') and (kind <> 'connection' or public.is_platform_admin())) with check(public.studio_role(workspace_id) in ('owner','admin','social') and (kind <> 'connection' or public.is_platform_admin()));
create policy growth_delete on public.studio_growth_records for delete to authenticated using(public.studio_role(workspace_id) in ('owner','admin','social') and (kind <> 'connection' or public.is_platform_admin()));
