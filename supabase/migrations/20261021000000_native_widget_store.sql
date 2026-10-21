-- Native catalogs belong to a merchant; agents may only use that merchant's store.
create table public.native_stores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  currency text not null default 'EUR' check (currency in ('EUR','USD','GBP')),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  unique(id, user_id)
);

alter table public.agents add column native_store_id uuid;
alter table public.agents add constraint agents_native_store_requires_owner check (native_store_id is null or user_id is not null);
alter table public.agents add constraint agents_native_store_owner_fk
  foreign key (native_store_id, user_id) references public.native_stores(id, user_id);
create index agents_native_store_idx on public.agents(native_store_id) where native_store_id is not null;

create table public.native_products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.native_stores(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
  description text not null default '' check (char_length(description) <= 4000),
  image_url text not null default '' check (image_url = '' or image_url ~ '^https://'),
  category text not null default '' check (char_length(category) <= 80),
  price_cents integer not null check (price_cents between 1 and 100000000),
  stock integer not null default 0 check (stock between 0 and 1000000),
  active boolean not null default false,
  search_document tsvector generated always as (to_tsvector('simple', translate(name || ' ' || category || ' ' || description, 'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunAEIOUUN'))) stored,
  created_at timestamptz not null default now()
);
create index native_products_store_idx on public.native_products(store_id, active, created_at);
create index native_products_search_idx on public.native_products using gin(search_document);

alter table public.native_stores enable row level security;
alter table public.native_products enable row level security;
revoke all on public.native_stores, public.native_products from anon;
grant select, insert, update on public.native_stores to authenticated;
grant select, insert, update, delete on public.native_products to authenticated;
grant all on public.native_stores, public.native_products to service_role;

create policy native_store_read on public.native_stores for select to authenticated using (user_id = (select auth.uid()));
create policy native_store_create on public.native_stores for insert to authenticated with check (user_id = (select auth.uid()));
create policy native_store_update on public.native_stores for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy native_product_owner on public.native_products for all to authenticated
  using (exists (select 1 from public.native_stores s where s.id = store_id and s.user_id = (select auth.uid())))
  with check (exists (select 1 from public.native_stores s where s.id = store_id and s.user_id = (select auth.uid())));
