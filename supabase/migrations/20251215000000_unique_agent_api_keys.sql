create unique index if not exists agents_api_key_unique_idx
on public.agents (api_key)
where api_key is not null;
