export type WidgetPosition = "left" | "right";

export interface WidgetAppearance {
  accent: string;
  accentContrast: string;
  accentShadow: string;
  accentLight: string;
  accentGradient: string;
  closeColor: string;
  closeBg: string;
  brandName: string;
  brandInitial: string;
  collapsedLabel: string;
  greeting: string;
  position: WidgetPosition;
  // New customization fields
  colorHeaderBg: string;
  colorHeaderText: string;
  colorChatBg: string;
  colorUserBubbleBg: string;
  colorUserBubbleText: string;
  colorBotBubbleBg: string;
  colorBotBubbleText: string;
  colorToggleBg: string;
  colorToggleText: string;
}

export interface WidgetConfig {
  key: string;
  chatEndpoint: string;
  accent: string;
  brandName: string;
  brandInitial: string;
  collapsedLabel: string;
  greeting: string;
  position: WidgetPosition;
  appearance: {
    colorHeaderBg: string;
    colorHeaderText: string;
    colorChatBg: string;
    colorUserBubbleBg: string;
    colorUserBubbleText: string;
    colorBotBubbleBg: string;
    colorBotBubbleText: string;
    colorToggleBg: string;
    colorToggleText: string;
  };
  // Avatar
 avatarType?: "initial" | "bubble" | "image";
bubbleStyle?: "default" | "energy" | "calm";
bubbleColors?: [string, string, string] | string[]; // lo que uses

}

export interface AgentRecord {
  id: string;
  is_active: boolean;
  allowed_domains: string[] | null;
  widget_accent: string | null;
  widget_brand: string | null;
  widget_label: string | null;
  widget_greeting: string | null;
  widget_position: WidgetPosition | null;
  widget_color_header_bg: string | null;
  widget_color_header_text: string | null;
  widget_color_chat_bg: string | null;
  widget_color_user_bubble_bg: string | null;
  widget_color_user_bubble_text: string | null;
  widget_color_bot_bubble_bg: string | null;
  widget_color_bot_bubble_text: string | null;
  widget_color_toggle_bg: string | null;
  widget_color_toggle_text: string | null;
  // Avatar fields
  avatar_type: string | null;
  avatar_bubble_style: string | null;
  avatar_bubble_colors: string[] | null;
}
