create table public.studio_media_categories (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 60)
);
create unique index studio_media_category_name on public.studio_media_categories (workspace_id, lower(trim(name)));
alter table public.studio_media_categories enable row level security;
grant select, insert on public.studio_media_categories to authenticated;
create policy media_category_read on public.studio_media_categories for select to authenticated
  using (public.studio_role(workspace_id) is not null);
create policy media_category_create on public.studio_media_categories for insert to authenticated
  with check (public.studio_role(workspace_id) in ('owner', 'admin', 'editor'));

alter table public.studio_media
  add column category_ids uuid[] not null default '{}',
  add column capture_year integer check (capture_year between 1800 and 2100);

create function public.organise_studio_media(studio uuid, assets uuid[], operation text, category uuid, year_value integer)
returns integer language plpgsql security invoker set search_path = '' as $$
declare affected integer;
begin
  if public.studio_role(studio) is null or public.studio_role(studio) not in ('owner', 'admin', 'editor')
      or coalesce(cardinality(assets), 0) not between 1 and 100 then
    raise exception 'Invalid media selection';
  end if;
  if operation in ('add', 'remove') then
    if not exists (select 1 from public.studio_media_categories c where c.workspace_id = studio and c.id = category) then
      raise exception 'Invalid media category';
    end if;
    update public.studio_media m
      set category_ids = case when operation = 'remove' then array_remove(m.category_ids, category)
        when category = any(m.category_ids) then m.category_ids else array_append(m.category_ids, category) end
      where m.workspace_id = studio and m.id = any(assets);
  elsif operation = 'year' then
    update public.studio_media m set capture_year = year_value
      where m.workspace_id = studio and m.id = any(assets);
  else
    raise exception 'Invalid media operation';
  end if;
  get diagnostics affected = row_count;
  return affected;
end;
$$;
revoke all on function public.organise_studio_media(uuid, uuid[], text, uuid, integer) from public;
grant execute on function public.organise_studio_media(uuid, uuid[], text, uuid, integer) to authenticated;
