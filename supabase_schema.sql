-- SkillForge — Schéma Supabase
-- À exécuter dans l'éditeur SQL de votre projet Supabase

-- Table principale
create table if not exists public.domains (
  id          text primary key,
  name        text not null,
  icon        text not null default '🎯',
  color       text not null default '#ff6b35',
  tree        jsonb not null default '[]'::jsonb,
  user_id     uuid references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Index pour les requêtes par utilisateur
create index if not exists domains_user_id_idx on public.domains(user_id);

-- Row Level Security
alter table public.domains enable row level security;

-- Politique : chaque utilisateur voit/modifie seulement ses données
create policy "Users can manage their own domains"
  on public.domains
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- (Optionnel) Mode public — sans auth, tout le monde peut lire/écrire
-- Décommentez si vous ne voulez pas d'authentification pour l'instant :
-- create policy "Allow all (no auth)"
--   on public.domains for all using (true) with check (true);

-- Trigger pour updated_at automatique
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger domains_updated_at
  before update on public.domains
  for each row execute procedure public.handle_updated_at();
