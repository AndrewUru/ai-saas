create or replace function consume_agent_message_quota(p_agent_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update agents
  set messages_limit = case
    when messages_limit is null then null
    else messages_limit - 1
  end
  where id = p_agent_id
    and is_active = true
    and (messages_limit is null or messages_limit > 0);

  return found;
end;
$$;

revoke all on function consume_agent_message_quota(uuid) from public;
revoke all on function consume_agent_message_quota(uuid) from anon;
revoke all on function consume_agent_message_quota(uuid) from authenticated;
grant execute on function consume_agent_message_quota(uuid) to service_role;
