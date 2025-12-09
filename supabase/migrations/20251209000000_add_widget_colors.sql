alter table public.agents
  add column if not exists widget_color_header_bg text,
  add column if not exists widget_color_header_text text,
  add column if not exists widget_color_chat_bg text,
  add column if not exists widget_color_user_bubble_bg text,
  add column if not exists widget_color_user_bubble_text text,
  add column if not exists widget_color_bot_bubble_bg text,
  add column if not exists widget_color_bot_bubble_text text;
