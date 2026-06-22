import { createAdmin } from "@/lib/supabase/admin";
import type { AgentRecord } from "./types";

type StatusError = Error & { status: number };

function makeStatusError(message: string, status: number): StatusError {
  const err = new Error(message) as StatusError;
  err.status = status;
  return err;
}

export async function loadAgentByKey(key: string) {
  const supabase = createAdmin();

  const { data, error } = await supabase
    .from("agents")
    .select(
      "id, is_active, allowed_domains, language, widget_accent, widget_brand, widget_label, widget_greeting, widget_human_support_text, widget_format, widget_launcher_icon, widget_launcher_logo_url, widget_launcher_style, widget_bubble_subtitle, widget_bubble_use_three, widget_bubble_width, widget_bubble_radius, widget_position, widget_width, widget_height, widget_offset_x, widget_offset_y, widget_launcher_size, widget_border_radius, widget_color_header_bg, widget_color_header_text, widget_color_chat_bg, widget_color_user_bubble_bg, widget_color_user_bubble_text, widget_color_bot_bubble_bg, widget_color_bot_bubble_text, widget_color_toggle_bg, widget_color_toggle_text, widget_color_bubble_bg, widget_color_bubble_text, widget_color_bubble_subtext, widget_color_bubble_border, widget_color_bubble_glow"
    )
    .eq("api_key", key)
    .maybeSingle<AgentRecord>();

  if (error) {
    throw makeStatusError(`DB Error: ${error.message}`, 500);
  }
  if (!data) {
    throw makeStatusError("Agent not found", 404);
  }
  if (!data.is_active) {
    throw makeStatusError("Inactive agent", 403);
  }

  return data;
}
