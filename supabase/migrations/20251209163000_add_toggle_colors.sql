-- Add toggle button color customization columns to agents table
alter table public.agents
  add column if not exists widget_color_toggle_bg text,
  add column if not exists widget_color_toggle_text text;
