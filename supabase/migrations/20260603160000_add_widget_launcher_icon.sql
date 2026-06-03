-- Add launcher icon customization columns to agents table.
alter table public.agents
  add column if not exists widget_launcher_icon text,
  add column if not exists widget_launcher_logo_url text;
