alter table public.agents
  add column if not exists widget_accent text,
  add column if not exists widget_brand text,
  add column if not exists widget_label text,
  add column if not exists widget_greeting text,
  add column if not exists widget_position text;
