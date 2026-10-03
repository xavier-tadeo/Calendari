-- Executa aixo UNA vegada al SQL Editor de Supabase (projecte gxpsgcubjukqmtsjnrxz).
-- La taula familia_store ja la crea l'app; aqui nomes activem la seguretat.

alter table public.familia_store enable row level security;

drop policy if exists "familia_all" on public.familia_store;
create policy "familia_all" on public.familia_store
  for all to authenticated
  using (true)
  with check (true);
