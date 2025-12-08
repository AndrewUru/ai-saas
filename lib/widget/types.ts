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
}
