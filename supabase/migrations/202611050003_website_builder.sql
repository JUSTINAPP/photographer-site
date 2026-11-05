create table public.studio_websites (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  draft jsonb not null,
  published jsonb,
  public_id uuid not null default gen_random_uuid() unique
);

alter table public.studio_websites enable row level security;
grant select, insert, update on public.studio_websites to authenticated;

create policy studio_website_owner on public.studio_websites
  for all to authenticated
  using (exists (select 1 from public.workspaces w
    where w.id = workspace_id and w.owner_id = auth.uid()))
  with check (exists (select 1 from public.workspaces w
    where w.id = workspace_id and w.owner_id = auth.uid()));

create function public.published_studio_website(site_id uuid)
returns table (settings jsonb, projects jsonb)
language sql stable security definer set search_path = ''
as $$
  select s.published, coalesce((
    select jsonb_agg(
      jsonb_build_object('id', p.id, 'title', p.title, 'description', p.description,
        'category', p.category, 'image_url', p.image_url)
      order by p.created_at desc
    )
    from public.projects p where p.workspace_id = s.workspace_id and p.published
  ), '[]'::jsonb)
  from public.studio_websites s
  where s.public_id = site_id and s.published is not null;
$$;

revoke all on function public.published_studio_website(uuid) from public;
grant execute on function public.published_studio_website(uuid) to anon, authenticated;
