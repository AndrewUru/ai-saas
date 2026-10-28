-- The app only reads catalogs from connected WooCommerce and Shopify stores.
-- Dropping the column also removes its owner constraints and index.
alter table public.agents drop column if exists native_store_id;
drop table if exists public.native_products;
drop table if exists public.native_stores;
