alter table public.agents
  add column if not exists widget_launcher_style text,
  add column if not exists widget_bubble_subtitle text,
  add column if not exists widget_bubble_use_three boolean,
  add column if not exists widget_bubble_width integer,
  add column if not exists widget_bubble_radius integer,
  add column if not exists widget_color_bubble_bg text,
  add column if not exists widget_color_bubble_text text,
  add column if not exists widget_color_bubble_subtext text,
  add column if not exists widget_color_bubble_border text,
  add column if not exists widget_color_bubble_glow text;
