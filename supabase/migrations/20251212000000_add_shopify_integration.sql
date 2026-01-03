-- Enable pgvector for product embeddings
create extension if not exists vector;

-- Shopify integrations
create table if not exists integrations_shopify (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text,
  shop_domain text not null,
  is_active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_sync_at timestamptz,
  last_sync_status text,
  last_sync_error text,
  products_indexed_count integer not null default 0,
  access_token_enc text not null,
  scopes text,
  currency text,
  webhook_token text
);

alter table integrations_shopify
  alter column webhook_token set default gen_random_uuid()::text;

update integrations_shopify
  set webhook_token = gen_random_uuid()::text
  where webhook_token is null;

create index if not exists integrations_shopify_user_id_idx
  on integrations_shopify (user_id);

create index if not exists integrations_shopify_shop_domain_idx
  on integrations_shopify (shop_domain);

alter table integrations_shopify enable row level security;

drop policy if exists "integrations_shopify_select" on integrations_shopify;
create policy "integrations_shopify_select"
  on integrations_shopify
  for select
  using (auth.uid() = user_id);

drop policy if exists "integrations_shopify_insert" on integrations_shopify;
create policy "integrations_shopify_insert"
  on integrations_shopify
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "integrations_shopify_update" on integrations_shopify;
create policy "integrations_shopify_update"
  on integrations_shopify
  for update
  using (auth.uid() = user_id);

drop policy if exists "integrations_shopify_delete" on integrations_shopify;
create policy "integrations_shopify_delete"
  on integrations_shopify
  for delete
  using (auth.uid() = user_id);

-- Store synced Shopify products
create table if not exists shopify_products (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references integrations_shopify(id) on delete cascade,
  shopify_product_id text not null,
  name text not null,
  handle text,
  permalink text,
  price text,
  currency text,
  sku text,
  stock_status text,
  stock_quantity integer,
  vendor text,
  product_type text,
  tags text,
  description text,
  image text,
  raw jsonb,
  updated_at_remote timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  embedding vector(1536)
);

create unique index if not exists shopify_products_integration_shopify_id_idx
  on shopify_products (integration_id, shopify_product_id);

create index if not exists shopify_products_embedding_idx
  on shopify_products using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Match products via cosine similarity
create or replace function match_shopify_products(
  query_embedding vector(1536),
  match_count integer,
  target_integration uuid,
  match_threshold double precision default 0.2
)
returns table (
  id uuid,
  integration_id uuid,
  shopify_product_id text,
  name text,
  price text,
  currency text,
  stock_status text,
  permalink text,
  image text,
  similarity double precision
)
language sql
stable
as $$
  select
    id,
    integration_id,
    shopify_product_id,
    name,
    price,
    currency,
    stock_status,
    permalink,
    image,
    1 - (embedding <=> query_embedding) as similarity
  from shopify_products
  where integration_id = target_integration
    and embedding is not null
    and 1 - (embedding <=> query_embedding) >= match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- Associate agents with Shopify integrations
alter table agents
  add column if not exists shopify_integration_id uuid references integrations_shopify(id) on delete set null;

create index if not exists agents_shopify_integration_id_idx
  on agents (shopify_integration_id);
