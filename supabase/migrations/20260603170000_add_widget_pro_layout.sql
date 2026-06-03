-- Add Pro layout customization columns to agents table.
alter table public.agents
  add column if not exists widget_width integer,
  add column if not exists widget_height integer,
  add column if not exists widget_offset_x integer,
  add column if not exists widget_offset_y integer,
  add column if not exists widget_launcher_size integer,
  add column if not exists widget_border_radius integer;
