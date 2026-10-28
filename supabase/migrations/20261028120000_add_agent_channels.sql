-- Each customer thread (widget session, Telegram chat, ...) keeps its own
-- history instead of sharing the agent's latest messages across visitors.
alter table public.agent_messages
  add column if not exists channel text not null default 'widget',
  add column if not exists conversation_id text;

create index if not exists agent_messages_conversation_created_at_idx
  on public.agent_messages(agent_id, conversation_id, created_at desc);

-- Messaging channels (Telegram, WhatsApp, ...) connected to an agent.
-- Writes go through the service role from server actions; owners can only read.
create table if not exists public.agent_channels (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('telegram', 'whatsapp', 'messenger', 'instagram')),
  external_id text not null,
  display_name text,
  credentials_cipher text not null,
  webhook_secret text not null,
  is_active boolean not null default true,
  last_error text,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (type, external_id)
);

create index if not exists agent_channels_agent_id_idx
  on public.agent_channels(agent_id);

alter table public.agent_channels enable row level security;

drop policy if exists "Agent channels are visible to owners" on public.agent_channels;
create policy "Agent channels are visible to owners"
  on public.agent_channels
  for select
  to authenticated
  using (user_id = auth.uid());

-- Platforms retry webhooks; remembering processed event ids avoids answering twice.
create table if not exists public.channel_inbound_events (
  channel_id uuid not null references public.agent_channels(id) on delete cascade,
  external_event_id text not null,
  created_at timestamptz not null default now(),
  primary key (channel_id, external_event_id)
);

alter table public.channel_inbound_events enable row level security;
