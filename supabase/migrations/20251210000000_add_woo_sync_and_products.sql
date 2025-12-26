-- Enable pgvector for product embeddings
create extension if not exists vector;

-- Normalize Woo integration schema
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_name = 'integrations_woocommerce'
      and column_name = 'site_url'
  ) then
    alter table integrations_woocommerce rename column site_url to store_url;
  end if;
end $$;

alter table integrations_woocommerce
  add column if not exists last_sync_at timestamptz,
  add column if not exists last_sync_status text,
  add column if not exists last_sync_error text,
  add column if not exists products_indexed_count integer,
  add column if not exists webhook_token text,
  add column if not exists webhook_secret text;

alter table integrations_woocommerce
  alter column webhook_token set default gen_random_uuid()::text;

update integrations_woocommerce
  set webhook_token = gen_random_uuid()::text
  where webhook_token is null;

-- Store synced WooCommerce products
create table if not exists woo_products (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references integrations_woocommerce(id) on delete cascade,
  woo_product_id integer not null,
  name text not null,
  slug text,
  permalink text,
  price text,
  currency text,
  sku text,
  stock_status text,
  stock_quantity integer,
  categories jsonb,
  tags jsonb,
  attributes jsonb,
  short_description text,
  description text,
  image text,
  raw jsonb,
  updated_at_remote timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  embedding vector(1536)
);

create unique index if not exists woo_products_integration_woo_id_idx
  on woo_products (integration_id, woo_product_id);

create index if not exists woo_products_embedding_idx
  on woo_products using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Match products via cosine similarity
create or replace function match_woo_products(
  query_embedding vector(1536),
  match_count integer,
  target_integration uuid,
  match_threshold double precision default 0.2
)
returns table (
  id uuid,
  integration_id uuid,
  woo_product_id integer,
  name text,
  price text,
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
    woo_product_id,
    name,
    price,
    stock_status,
    permalink,
    image,
    1 - (embedding <=> query_embedding) as similarity
  from woo_products
  where integration_id = target_integration
    and embedding is not null
    and 1 - (embedding <=> query_embedding) >= match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
