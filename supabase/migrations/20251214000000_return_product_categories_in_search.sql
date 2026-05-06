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
  categories jsonb,
  tags jsonb,
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
    categories,
    tags,
    1 - (embedding <=> query_embedding) as similarity
  from woo_products
  where integration_id = target_integration
    and embedding is not null
    and 1 - (embedding <=> query_embedding) >= match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;

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
  product_type text,
  tags text,
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
    product_type,
    tags,
    1 - (embedding <=> query_embedding) as similarity
  from shopify_products
  where integration_id = target_integration
    and embedding is not null
    and 1 - (embedding <=> query_embedding) >= match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
