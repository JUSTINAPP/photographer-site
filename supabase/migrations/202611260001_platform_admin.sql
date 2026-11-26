begin;

create table public.platform_admins (
  email text primary key check (email = lower(trim(email))),
  created_at timestamptz not null default now()
);
alter table public.platform_admins enable row level security;
revoke all on public.platform_admins from anon, authenticated;
insert into public.platform_admins(email) values ('jonas@dorja.com');

create function public.is_platform_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.platform_admins p join auth.users u on lower(u.email)=p.email
    where u.id=auth.uid() and u.email_confirmed_at is not null
  );
$$;
revoke all on function public.is_platform_admin() from public;
grant execute on function public.is_platform_admin() to authenticated;

alter table public.workspaces alter column owner_id drop not null;
alter table public.workspaces add column onboarding_email text
  check (onboarding_email is null or (onboarding_email=lower(trim(onboarding_email)) and onboarding_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'));
create unique index workspace_prepared_email on public.workspaces(onboarding_email) where owner_id is null;

create table public.platform_studio_accounts (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  plan text not null default 'independent' check (plan in ('independent','studio','production')),
  status text not null default 'trial' check (status in ('trial','active','complimentary','paused')),
  trial_ends_at date,
  notes text not null default '' check (length(notes)<=10000)
);
alter table public.platform_studio_accounts enable row level security;
grant select, insert, update on public.platform_studio_accounts to authenticated;
create policy platform_accounts_admin on public.platform_studio_accounts for all to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());
insert into public.platform_studio_accounts(workspace_id,trial_ends_at)
select id,(created_at+interval '14 days')::date from public.workspaces;

create table public.platform_prices (
  id text primary key check (id in ('independent','studio','production')),
  name text not null,
  monthly numeric(10,2) not null check (monthly>=0 and monthly<=100000),
  annual_monthly numeric(10,2) not null check (annual_monthly>=0 and annual_monthly<=monthly),
  updated_at timestamptz not null default now()
);
alter table public.platform_prices enable row level security;
grant select on public.platform_prices to anon,authenticated;
create policy prices_public_read on public.platform_prices for select to anon,authenticated using (true);
insert into public.platform_prices(id,name,monthly,annual_monthly) values
 ('independent','Independent',49,39),('studio','Studio',89,69),('production','Production',149,119);

create table public.platform_prospects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 180),
  email text not null default '' check (length(email)<=254),
  website text not null default '' check (length(website)<=2048),
  contact_name text not null default '' check (length(contact_name)<=180),
  source text not null default '' check (length(source)<=180),
  stage text not null default 'new' check (stage in ('new','contacted','replied','demo','onboarding','won','lost')),
  next_step text not null default '' check (length(next_step)<=500),
  next_date date,
  notes text not null default '' check (length(notes)<=20000),
  workspace_id uuid references public.workspaces(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.platform_prospects enable row level security;
grant select,insert,update on public.platform_prospects to authenticated;
create policy prospects_platform_admin on public.platform_prospects for all to authenticated
 using (public.is_platform_admin()) with check (public.is_platform_admin());

create table public.platform_activity (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id),
  kind text not null,
  workspace_id uuid references public.workspaces(id) on delete set null,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);
alter table public.platform_activity enable row level security;
grant select on public.platform_activity to authenticated;
create policy activity_platform_admin on public.platform_activity for select to authenticated using (public.is_platform_admin());

create table public.platform_support_sessions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  admin_id uuid not null references auth.users(id),
  reason text not null check (length(reason) between 3 and 500),
  started_at timestamptz not null default now(),
  ends_at timestamptz not null,
  ended_at timestamptz
);
create index platform_support_active on public.platform_support_sessions(admin_id,workspace_id,ends_at) where ended_at is null;
alter table public.platform_support_sessions enable row level security;
grant select on public.platform_support_sessions to authenticated;
create policy support_platform_read on public.platform_support_sessions for select to authenticated using (public.is_platform_admin());

create or replace function public.studio_role(studio uuid) returns text
language sql stable security definer set search_path = '' as $$
  select case
    when w.owner_id=auth.uid() then 'owner'
    when public.is_platform_admin() and exists (
      select 1 from public.platform_support_sessions s where s.workspace_id=w.id and s.admin_id=auth.uid()
        and s.ended_at is null and s.ends_at>now()
    ) then 'admin'
    else t.role
  end
  from public.workspaces w left join public.studio_team t on t.workspace_id=w.id and t.user_id=auth.uid()
  where w.id=studio;
$$;

create function public.prepare_photographer_studio(customer_name text, customer_email text, customer_website text default '')
returns uuid language plpgsql security definer set search_path = '' as $$
declare account uuid; studio uuid; address text=lower(trim(customer_email));
begin
  if not public.is_platform_admin() then raise exception 'Platform admin required'; end if;
  if customer_name is null or address is null or length(trim(customer_name)) not between 1 and 100 or length(address)>254 or address !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or length(customer_website)>2048 or (customer_website<>'' and customer_website !~ '^https://[^[:space:]]+$') then
    raise exception 'Check the studio name, email and website'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(address,0));
  select id into account from auth.users where lower(email)=address;
  select id into studio from public.workspaces where (account is not null and owner_id=account)
    or (owner_id is null and onboarding_email=address) order by created_at limit 1;
  if studio is null then
    insert into public.workspaces(name,onboarding_email) values(trim(customer_name),address) returning id into studio;
    insert into public.studio_websites(workspace_id,draft)
      values(studio,jsonb_build_object('name',trim(customer_name),'currentWebsite',customer_website));
    insert into public.platform_studio_accounts(workspace_id,trial_ends_at) values(studio,(now()+interval '14 days')::date);
    insert into public.platform_activity(actor_id,kind,workspace_id,details)
      values(auth.uid(),'studio_prepared',studio,jsonb_build_object('email',address));
  end if;
  return studio;
end;
$$;
revoke all on function public.prepare_photographer_studio(text,text,text) from public;
grant execute on function public.prepare_photographer_studio(text,text,text) to authenticated;

create or replace function public.accept_studio_invitations() returns uuid
language plpgsql security definer set search_path = '' as $$
declare studio uuid; prepared uuid; address text;
begin
  select lower(email) into address from auth.users where id=auth.uid() and email_confirmed_at is not null;
  if address is null then return null; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(address,0));
  if not exists(select 1 from public.workspaces where owner_id=auth.uid()) then
    update public.workspaces set owner_id=auth.uid()
      where owner_id is null and onboarding_email=address returning id into prepared;
    if prepared is not null then
      insert into public.platform_activity(actor_id,kind,workspace_id) values(auth.uid(),'studio_claimed',prepared);
    end if;
  end if;
  with accepted as (
    update public.studio_team t set user_id=auth.uid()
    where t.email=address and t.user_id is null
      and not exists(select 1 from public.studio_team existing where existing.workspace_id=t.workspace_id and existing.user_id=auth.uid())
    returning t.workspace_id,t.created_at
  ) select workspace_id into studio from accepted order by created_at desc,workspace_id limit 1;
  return coalesce(prepared,studio);
end;
$$;

create or replace function public.initialize_studio() returns uuid
language plpgsql security definer set search_path = '' as $$
declare studio uuid; address text;
begin
  select lower(email) into address from auth.users where id=auth.uid() and email_confirmed_at is not null;
  if address is null then raise exception 'Verified sign-in required'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(address,0));
  perform public.accept_studio_invitations();
  insert into public.workspaces(owner_id) values(auth.uid()) on conflict(owner_id) do nothing;
  select id into studio from public.workspaces where owner_id=auth.uid();
  insert into public.platform_studio_accounts(workspace_id,trial_ends_at)
    values(studio,(now()+interval '14 days')::date) on conflict do nothing;
  return studio;
end;
$$;

create function public.open_platform_support(studio uuid, purpose text, minutes integer default 60)
returns uuid language plpgsql security definer set search_path = '' as $$
declare session uuid;
begin
  if not public.is_platform_admin() then raise exception 'Platform admin required'; end if;
  if length(trim(purpose)) not between 3 and 500 or minutes not in (30,60,240) then raise exception 'Add a reason and duration'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(auth.uid()::text,1));
  update public.platform_support_sessions set ended_at=now() where admin_id=auth.uid() and ended_at is null;
  insert into public.platform_support_sessions(workspace_id,admin_id,reason,ends_at)
    values(studio,auth.uid(),trim(purpose),now()+pg_catalog.make_interval(mins=>minutes)) returning id into session;
  insert into public.platform_activity(actor_id,kind,workspace_id,details)
    values(auth.uid(),'support_opened',studio,jsonb_build_object('reason',trim(purpose),'minutes',minutes));
  return session;
end;
$$;
revoke all on function public.open_platform_support(uuid,text,integer) from public;
grant execute on function public.open_platform_support(uuid,text,integer) to authenticated;

create function public.end_platform_support() returns void
language plpgsql security definer set search_path = '' as $$
declare s record;
begin
  if not public.is_platform_admin() then raise exception 'Platform admin required'; end if;
  for s in update public.platform_support_sessions set ended_at=now()
    where admin_id=auth.uid() and ended_at is null returning workspace_id
  loop
    insert into public.platform_activity(actor_id,kind,workspace_id) values(auth.uid(),'support_ended',s.workspace_id);
  end loop;
end;
$$;
revoke all on function public.end_platform_support() from public;
grant execute on function public.end_platform_support() to authenticated;

create function public.platform_studio_directory() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_platform_admin() then raise exception 'Platform admin required'; end if;
  return coalesce((select jsonb_agg(row_to_json(row) order by row.created_at desc) from (
    select w.id,coalesce(nullif(s.draft->>'name',''),w.name) as name,
      coalesce(u.email,w.onboarding_email,'') as email,w.owner_id is not null as claimed,
      w.created_at,u.last_sign_in_at,s.published is not null as live,s.public_id,
      coalesce(a.plan,'independent') as plan,coalesce(a.status,'trial') as status,a.trial_ends_at,coalesce(a.notes,'') as notes,
      coalesce(s.draft->>'currentWebsite','') as website,
      (select count(*) from public.studio_media m where m.workspace_id=w.id) as media_count,
      (select count(*) from public.projects p where p.workspace_id=w.id) as project_count,
      (select count(*) from public.studio_team t where t.workspace_id=w.id and t.user_id is not null) as team_count
    from public.workspaces w left join auth.users u on u.id=w.owner_id
      left join public.studio_websites s on s.workspace_id=w.id
      left join public.platform_studio_accounts a on a.workspace_id=w.id
  ) row),'[]'::jsonb);
end;
$$;
revoke all on function public.platform_studio_directory() from public;
grant execute on function public.platform_studio_directory() to authenticated;

create function public.publish_platform_prices(prices jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare entry record;
begin
  if not public.is_platform_admin() then raise exception 'Platform admin required'; end if;
  if prices is null or jsonb_typeof(prices)<>'array' or jsonb_array_length(prices)<>3 then raise exception 'Provide all three plans'; end if;
  if (select count(distinct value->>'id') from jsonb_array_elements(prices))<>3 then raise exception 'Each plan must appear once'; end if;
  for entry in select * from jsonb_to_recordset(prices) as x(id text,monthly numeric,annual_monthly numeric) loop
    if entry.id not in ('independent','studio','production') or entry.id is null
      or entry.monthly is null or entry.annual_monthly is null
      or entry.monthly<0 or entry.monthly>100000 or entry.annual_monthly<0 or entry.annual_monthly>entry.monthly then
      raise exception 'Check plan prices'; end if;
    update public.platform_prices set monthly=entry.monthly,annual_monthly=entry.annual_monthly,updated_at=now() where id=entry.id;
  end loop;
  insert into public.platform_activity(actor_id,kind,details) values(auth.uid(),'pricing_updated',jsonb_build_object('prices',prices));
end;
$$;
revoke all on function public.publish_platform_prices(jsonb) from public;
grant execute on function public.publish_platform_prices(jsonb) to authenticated;


create function public.log_platform_record_change() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.platform_activity(actor_id,kind,workspace_id,details)
    values(auth.uid(),case when tg_table_name='platform_prospects' then 'prospect_saved' else 'account_updated' end,
      new.workspace_id,case when tg_table_name='platform_prospects' then jsonb_build_object('prospect_id',to_jsonb(new)->>'id') else '{}'::jsonb end);
  return new;
end;
$$;
revoke all on function public.log_platform_record_change() from public;
create trigger platform_prospect_audit after insert or update on public.platform_prospects
  for each row execute function public.log_platform_record_change();
create trigger platform_account_audit after update on public.platform_studio_accounts
  for each row execute function public.log_platform_record_change();

do $$
begin
  if to_regclass('supabase_migrations.schema_migrations') is not null then
    execute $record$insert into supabase_migrations.schema_migrations(version,name,statements)
      values ('202611260001','platform_admin',array[]::text[]) on conflict(version) do nothing$record$;
  end if;
end;
$$;

commit;
