-- Contacts, equipment, documents, moodboards and newsletter drafts, isolated by studio.
alter table public.workspaces add column invoice_sequence bigint not null default 0;
create table public.studio_records (
 id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
 kind text not null check(kind in ('contacts','equipment','invoices','proposals','moodboards','newsletters')),
 data jsonb not null check(jsonb_typeof(data)='object' and coalesce(length(data->>'title'),0) between 1 and 180),
 archived boolean not null default false,created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create index studio_records_scope on public.studio_records(workspace_id,kind,archived);
alter table public.studio_records enable row level security;
create policy studio_records_owner on public.studio_records for all to authenticated
 using(exists(select 1 from public.workspaces w where w.id=workspace_id and w.owner_id=auth.uid()))
 with check(exists(select 1 from public.workspaces w where w.id=workspace_id and w.owner_id=auth.uid()));
create unique index studio_invoice_number on public.studio_records(workspace_id,(data->>'number')) where kind='invoices';
create function public.studio_record_guard() returns trigger language plpgsql security definer set search_path='' as $$
declare n bigint; l jsonb; total_amount numeric:=0; base_amount numeric; paid numeric;
begin
 if tg_op='UPDATE' then
  if new.workspace_id<>old.workspace_id or new.kind<>old.kind then raise exception 'Record identity cannot change';end if;
  if old.kind='invoices' then
   if old.data->>'status'<>'draft' and new.data->>'status'='draft' then raise exception 'Issued invoices cannot return to draft';end if;
   if old.data->>'status'<>'draft' and (new.data-array['paid_amount','status','notes']) is distinct from (old.data-array['paid_amount','status','notes']) then raise exception 'Issued invoice details are locked';end if;
   new.data=jsonb_set(new.data,'{number}',old.data->'number');
  end if;
 end if;
 if new.kind in ('invoices','proposals') then
  if jsonb_typeof(new.data->'lines') is distinct from 'array' or jsonb_array_length(new.data->'lines') not between 1 and 60 then raise exception 'Document needs line items';end if;
  for l in select value from jsonb_array_elements(new.data->'lines') loop
   if jsonb_typeof(l->'quantity') is distinct from 'number' or jsonb_typeof(l->'unit_price') is distinct from 'number' or jsonb_typeof(l->'discount') is distinct from 'number' or jsonb_typeof(l->'tax_rate') is distinct from 'number' then raise exception 'Numeric line amounts required';end if;
   if (l->>'quantity')::numeric<=0 or (l->>'unit_price')::numeric<0 or (l->>'discount')::numeric<0 or (l->>'discount')::numeric>(l->>'quantity')::numeric*(l->>'unit_price')::numeric or (l->>'tax_rate')::numeric not between 0 and 100 then raise exception 'Invalid document amounts';end if;
  base_amount=round((l->>'quantity')::numeric*(l->>'unit_price')::numeric-(l->>'discount')::numeric,2);
   total_amount=total_amount+base_amount+round(base_amount*(l->>'tax_rate')::numeric/100,2);
  end loop;
  paid=coalesce((new.data->>'paid_amount')::numeric,0);
  if paid<0 or paid>total_amount then raise exception 'Invalid payment amount';end if;
  if new.kind='invoices' then
   if coalesce(new.data->>'status','') not in ('draft','issued','part_paid','paid','cancelled') then raise exception 'Invalid invoice status';end if;
   if new.data->>'status'='paid' and paid<>total_amount then raise exception 'Full payment required';end if;
   if new.data->>'status'='part_paid' and not(paid>0 and paid<total_amount) then raise exception 'Partial payment required';end if;
  end if;
 end if;
 if tg_op='INSERT' and new.kind='invoices' then
  update public.workspaces set invoice_sequence=invoice_sequence+1 where id=new.workspace_id returning invoice_sequence into n;
  new.data=jsonb_set(new.data,'{number}',to_jsonb('INV-'||lpad(n::text,5,'0')));
 end if;
 new.updated_at=now();return new;
end;$$;
create trigger studio_record_guard before insert or update on public.studio_records for each row execute function public.studio_record_guard();
create function public.convert_studio_proposal(proposal_id uuid,studio_id uuid) returns jsonb language plpgsql set search_path='' as $$
declare p public.studio_records; inv public.studio_records;
begin
 select * into p from public.studio_records where id=proposal_id and workspace_id=studio_id and kind='proposals' and not archived for update;
 if p.id is null or p.data->>'status'<>'accepted' then raise exception 'Accepted proposal required';end if;
 if p.data->>'invoice_id' is not null then select * into inv from public.studio_records where id=(p.data->>'invoice_id')::uuid and workspace_id=studio_id;return to_jsonb(inv);end if;
 insert into public.studio_records(workspace_id,kind,data) values(studio_id,'invoices',(p.data-array['invoice_id','number'])||jsonb_build_object('status','draft','paid_amount',0)) returning * into inv;
 update public.studio_records set data=jsonb_set(data,'{invoice_id}',to_jsonb(inv.id::text)) where id=p.id;
 return to_jsonb(inv);
end;$$;
revoke all on function public.convert_studio_proposal(uuid,uuid) from public;
grant execute on function public.convert_studio_proposal(uuid,uuid) to authenticated;
