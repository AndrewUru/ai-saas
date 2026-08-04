create table if not exists public.agent_messages (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  message text not null,
  reply text,
  created_at timestamptz not null default now()
);

create index if not exists agent_messages_agent_created_at_idx
  on public.agent_messages(agent_id, created_at desc);

alter table public.agent_messages enable row level security;

drop policy if exists "Agent messages are visible to agent owners"
  on public.agent_messages;
create policy "Agent messages are visible to agent owners"
  on public.agent_messages
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.agents
      where agents.id = agent_messages.agent_id
        and agents.user_id = auth.uid()
    )
  );
