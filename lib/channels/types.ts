export const CHANNEL_TYPES = ["telegram", "whatsapp", "messenger", "instagram"] as const;

export type ChannelType = (typeof CHANNEL_TYPES)[number];

export type ChannelRecord = {
  id: string;
  agent_id: string;
  user_id: string;
  type: ChannelType;
  external_id: string;
  display_name: string | null;
  credentials_cipher: string;
  webhook_secret: string;
  is_active: boolean;
};

export const CHANNEL_SELECT =
  "id, agent_id, user_id, type, external_id, display_name, credentials_cipher, webhook_secret, is_active";
