-- Move only known legacy green defaults to the neutral palette.
-- Custom colors that do not exactly match these defaults remain untouched.
update public.agents
set
  widget_accent = case
    when lower(widget_accent) in ('#25d366', '#34d399') then '#d4d4d8'
    else widget_accent
  end,
  widget_color_header_bg = case
    when lower(widget_color_header_bg) = '#075e54' then '#18181b'
    else widget_color_header_bg
  end,
  widget_color_user_bubble_text = case
    when lower(widget_color_user_bubble_text) = '#0b2f20' then '#18181b'
    else widget_color_user_bubble_text
  end,
  widget_color_toggle_bg = case
    when lower(widget_color_toggle_bg) in ('#25d366', '#34d399') then '#d4d4d8'
    else widget_color_toggle_bg
  end,
  widget_color_bubble_glow = case
    when lower(widget_color_bubble_glow) in ('#25d366', '#34d399') then '#d4d4d8'
    else widget_color_bubble_glow
  end
where
  lower(coalesce(widget_accent, '')) in ('#25d366', '#34d399')
  or lower(coalesce(widget_color_header_bg, '')) = '#075e54'
  or lower(coalesce(widget_color_user_bubble_text, '')) = '#0b2f20'
  or lower(coalesce(widget_color_toggle_bg, '')) in ('#25d366', '#34d399')
  or lower(coalesce(widget_color_bubble_glow, '')) in ('#25d366', '#34d399');
