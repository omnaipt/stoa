-- STOA · Teste de isolamento multi-tenant (RLS)
-- Valida que um membro de um restaurante vê os seus dados e que um
-- segundo utilizador sem membership não vê nada do tenant alheio.
--
-- Correr com: supabase test db   (usa pgTAP)
-- Requer a migration 0001_init.sql aplicada.

begin;

select plan(11);

-- pgTAP disponível
select has_extension('pgtap');

-- ── Setup: dois utilizadores em auth.users ────────────────────────────────
-- (Inserção directa em auth.users para o teste; o trigger handle_new_user
--  cria os profiles automaticamente.)
insert into auth.users (id, email, raw_user_meta_data)
values
  ('11111111-1111-1111-1111-111111111111', 'owner@stoa.test',  '{"full_name":"Owner A"}'),
  ('22222222-2222-2222-2222-222222222222', 'outsider@stoa.test','{"full_name":"User B"}');

-- Restaurante do utilizador A + membership + dados de negócio.
-- Inserido como service_role (bypassa RLS no setup).
insert into public.restaurants (id, name, slug, owner_id)
values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Tasca do A', 'tasca-a',
        '11111111-1111-1111-1111-111111111111');

insert into public.restaurant_members (restaurant_id, user_id, role)
values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '11111111-1111-1111-1111-111111111111', 'owner');

insert into public.customers (id, restaurant_id, name, phone)
values ('cccccccc-cccc-cccc-cccc-cccccccccccc',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Cliente Um', '910000000');

insert into public.tables (id, restaurant_id, label, seats)
values ('dddddddd-dddd-dddd-dddd-dddddddddddd',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mesa 1', 4);

insert into public.turns (id, restaurant_id, label, service, start_time, weekdays)
values ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Jantar', 'jantar',
        '20:00', array[1,2,3,4,5,6,7]);

insert into public.reservations (restaurant_id, customer_id, table_id, turn_id, customer_name, party_size, reserved_at)
values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Cliente Um', 2, now());

-- ── Cenário 1: utilizador A (membro) VÊ os seus dados ─────────────────────
set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select is(
  (select count(*)::int from public.restaurants),
  1, 'Membro A vê 1 restaurante (o seu)');

select is(
  (select count(*)::int from public.customers),
  1, 'Membro A vê 1 customer do seu restaurante');

select is(
  (select count(*)::int from public.reservations),
  1, 'Membro A vê 1 reserva do seu restaurante');

select is(
  (select count(*)::int from public.tables),
  1, 'Membro A vê 1 mesa do seu restaurante');

select is(
  (select count(*)::int from public.turns),
  1, 'Membro A vê 1 turno do seu restaurante');

select is(
  (select public.is_restaurant_member('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')),
  true, 'is_restaurant_member = true para o membro A');

-- ── Cenário 2: utilizador B (sem membership) NÃO vê nada ──────────────────
set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

select is(
  (select count(*)::int from public.restaurants),
  0, 'Utilizador B (sem membership) NÃO vê o restaurante alheio');

select is(
  (select count(*)::int from public.customers),
  0, 'Utilizador B NÃO vê customers do tenant alheio');

select is(
  (select count(*)::int from public.reservations),
  0, 'Utilizador B NÃO vê reservas do tenant alheio');

select is(
  (select public.is_restaurant_member('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')),
  false, 'is_restaurant_member = false para o outsider B');

select * from finish();

rollback;
