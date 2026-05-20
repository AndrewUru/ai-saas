create table if not exists public.widget_events (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  event_type text not null check (
    event_type in ('load', 'open', 'message_sent', 'message_failed')
  ),
  page_url text,
  referrer text,
  user_agent text,
  word_count integer not null default 0 check (word_count >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists widget_events_agent_created_at_idx
  on public.widget_events(agent_id, created_at desc);

create index if not exists widget_events_agent_type_created_at_idx
  on public.widget_events(agent_id, event_type, created_at desc);

alter table public.widget_events enable row level security;

drop policy if exists "Widget events are visible to agent owners" on public.widget_events;
create policy "Widget events are visible to agent owners"
  on public.widget_events
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.agents
      where agents.id = widget_events.agent_id
        and agents.user_id = auth.uid()
    )
  );

