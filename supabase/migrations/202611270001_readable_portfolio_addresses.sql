alter table public.studio_websites add column slug text unique;
alter table public.studio_websites add constraint studio_website_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{0,62}$');

-- Allocate once; later edits to the photographer's name must not break shared links.
create function public.assign_portfolio_slug() returns trigger
language plpgsql security definer set search_path='' as $$
declare base text; candidate text; suffix integer:=1;
begin
  if TG_OP='UPDATE' and old.slug is not null then
    new.slug:=old.slug;
    return new;
  end if;
  base:=left(regexp_replace(lower(coalesce(nullif(new.published->>'name',''),new.draft->>'name','')), '[^a-z0-9]', '', 'g'),48);
  if base='' then return new; end if;
  if base=any(array['admin','api','auth','demo','examples','forgotpassword','forgot-password','help','join','login','portfoliodomain','portfolio-domain','pricing','projects','resetpassword','reset-password','signup','sites','studio','notice','terms','privacy','trust','accessibility','dpa','subprocessors','ai','mobile','cookies','contact','about','features','support','security','favicon','robots','sitemap','_next']) then base:=base||'-portfolio'; end if;
  perform pg_advisory_xact_lock(hashtextextended('portfolio-slug:'||base,0));
  candidate:=base;
  while exists(select 1 from public.studio_websites s where s.slug=candidate and s.workspace_id<>new.workspace_id) loop
    suffix:=suffix+1; candidate:=base||'-'||suffix;
  end loop;
  new.slug:=candidate;
  return new;
end $$;
revoke all on function public.assign_portfolio_slug() from public;
create trigger assign_portfolio_slug before insert or update on public.studio_websites for each row execute function public.assign_portfolio_slug();
update public.studio_websites set draft=draft where slug is null;

create function public.published_studio_by_slug(site_slug text)
returns table(public_id uuid,name text)
language sql stable security definer set search_path='' as $$
 select s.public_id,s.published->>'name' from public.studio_websites s where s.slug=site_slug and s.published is not null;
$$;
create function public.published_studio_address(site_id uuid)
returns table(slug text)
language sql stable security definer set search_path='' as $$
 select s.slug from public.studio_websites s where s.public_id=site_id and s.published is not null;
$$;
revoke all on function public.published_studio_by_slug(text),public.published_studio_address(uuid) from public;
grant execute on function public.published_studio_by_slug(text),public.published_studio_address(uuid) to anon,authenticated;
