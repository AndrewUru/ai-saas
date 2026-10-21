-- Run inside a transaction after the migration. This file never commits fixtures.
insert into auth.users(id) values ('f0000000-0000-4000-8000-000000000001'), ('f0000000-0000-4000-8000-000000000002');
insert into public.native_stores(id,user_id,name) values
  ('f0000000-0000-4000-8000-000000000011','f0000000-0000-4000-8000-000000000001','Test merchant one'),
  ('f0000000-0000-4000-8000-000000000012','f0000000-0000-4000-8000-000000000002','Test merchant two');
insert into public.native_products(id,store_id,name,price_cents,stock,active) values
  ('f0000000-0000-4000-8000-000000000021','f0000000-0000-4000-8000-000000000011','Coffee',1990,3,true),
  ('f0000000-0000-4000-8000-000000000022','f0000000-0000-4000-8000-000000000012','Tea',990,3,true);

do $$ begin
  begin
    insert into public.agents(user_id,name,native_store_id) values
      ('f0000000-0000-4000-8000-000000000001','Cross tenant agent','f0000000-0000-4000-8000-000000000012');
    raise exception 'Cross tenant foreign key failed';
  exception when foreign_key_violation then null;
  end;
end $$;

set local role authenticated;
select set_config('request.jwt.claim.sub','f0000000-0000-4000-8000-000000000001',true);
do $$ begin
  if (select count(*) from public.native_stores) <> 1 then raise exception 'Store RLS failed'; end if;
  if (select count(*) from public.native_products) <> 1 then raise exception 'Product RLS failed'; end if;
  update public.native_products set stock = 2 where id = 'f0000000-0000-4000-8000-000000000021';
  if not found then raise exception 'Owner update failed'; end if;
  update public.native_products set stock = 0 where id = 'f0000000-0000-4000-8000-000000000022';
  if found then raise exception 'Cross tenant update allowed'; end if;
  begin
    insert into public.native_products(store_id,name,price_cents) values ('f0000000-0000-4000-8000-000000000012','Invalid',100);
    raise exception 'Cross tenant insert allowed';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
set local role anon;
do $$ begin
  begin
    perform * from public.native_products;
    raise exception 'Anonymous direct read allowed';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
select 'native_store_rls_passed' as result;
