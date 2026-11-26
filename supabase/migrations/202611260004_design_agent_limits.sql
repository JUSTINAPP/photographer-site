begin;
create table public.studio_design_requests (
 workspace_id uuid primary key references public.workspaces(id) on delete cascade,
 requested_at timestamptz not null default now(),
 usage_date date not null default current_date,
 daily_count integer not null default 1
);
alter table public.studio_design_requests enable row level security;
revoke all on public.studio_design_requests from anon,authenticated;
create function public.claim_design_request(studio uuid) returns text
language plpgsql security definer set search_path='' as $$
declare accepted uuid; usage integer;
begin
 if public.studio_role(studio) is null or public.studio_role(studio) not in ('owner','admin','editor') then return 'denied'; end if;
 insert into public.studio_design_requests(workspace_id) values(studio)
 on conflict(workspace_id) do update set requested_at=now(),usage_date=current_date,
 daily_count=case when studio_design_requests.usage_date=current_date then studio_design_requests.daily_count+1 else 1 end
 where studio_design_requests.requested_at < now()-interval '8 seconds'
 and (studio_design_requests.usage_date<>current_date or studio_design_requests.daily_count<120)
 returning workspace_id into accepted;
 if accepted is not null then return 'ready'; end if;
 select daily_count into usage from public.studio_design_requests where workspace_id=studio and usage_date=current_date;
 return case when usage>=120 then 'limit' else 'wait' end;
end;
$$;
revoke all on function public.claim_design_request(uuid) from public;
grant execute on function public.claim_design_request(uuid) to authenticated;
do $$begin
 if to_regclass('supabase_migrations.schema_migrations') is not null then
  execute $record$insert into supabase_migrations.schema_migrations(version,name,statements) values('202611260004','design_agent_limits',array[]::text[]) on conflict(version) do nothing$record$;
 end if;
end$$;
notify pgrst,'reload schema';
commit;
