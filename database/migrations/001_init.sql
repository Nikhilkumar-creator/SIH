-- =====================================================================
-- NCPOR Polar Science Outreach Portal — Initial Schema
-- Run via Supabase SQL editor or `supabase db push` / psql.
-- =====================================================================

create extension if not exists vector;
create extension if not exists pgcrypto; -- gen_random_uuid()

-- ---------------------------------------------------------------------
-- 1. PROFILES (extends auth.users)
-- ---------------------------------------------------------------------
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  full_name   text not null,
  role        text not null default 'researcher'
              check (role in ('admin', 'editor', 'researcher', 'visitor')),
  department  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'researcher');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------
-- 2. EXPEDITIONS
-- ---------------------------------------------------------------------
create table public.expeditions (
  id          uuid default gen_random_uuid() primary key,
  title       text not null,
  region      text not null
              check (region in ('Arctic', 'Antarctic', 'Himalayas', 'Southern Ocean')),
  start_date  date not null,
  end_date    date,
  description text,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz default now(),
  constraint chk_expedition_dates check (end_date is null or end_date >= start_date)
);

-- ---------------------------------------------------------------------
-- 3. RESEARCH ASSETS
-- ---------------------------------------------------------------------
create table public.research_assets (
  id               uuid default gen_random_uuid() primary key,
  title            text not null,
  description      text,
  asset_type       text not null
                   check (asset_type in ('report', 'dataset', 'publication', 'photo', 'video')),
  file_path        text not null,        -- path inside Supabase Storage bucket
  file_size_bytes  bigint not null check (file_size_bytes >= 0),
  mime_type        text not null,
  expedition_id    uuid references public.expeditions(id) on delete set null,
  uploaded_by      uuid references public.profiles(id),
  is_public        boolean not null default false,
  is_immutable     boolean not null default false, -- true once officially published
  fts_vector       tsvector generated always as (
                     to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
                   ) stored,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- Publications/datasets become immutable once flagged published; enforce via trigger.
create function public.prevent_immutable_update()
returns trigger as $$
begin
  if old.is_immutable = true and (
       new.file_path is distinct from old.file_path or
       new.title is distinct from old.title or
       new.description is distinct from old.description
     ) then
    raise exception 'Cannot modify an immutable published asset (id=%)', old.id;
  end if;
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_research_assets_immutable
  before update on public.research_assets
  for each row execute procedure public.prevent_immutable_update();

-- ---------------------------------------------------------------------
-- 4. GENERATED OUTREACH CONTENT (AI drafts + editorial workflow)
-- ---------------------------------------------------------------------
create table public.generated_content (
  id            uuid default gen_random_uuid() primary key,
  asset_id      uuid references public.research_assets(id) on delete cascade,
  content_type  text not null
                check (content_type in ('summary', 'article', 'social_x', 'social_linkedin', 'social_instagram')),
  title         text,
  body          text not null,
  tags          text[] default '{}',
  status        text not null default 'draft'
                check (status in ('draft', 'peer_review', 'admin_approved', 'published', 'rejected')),
  reviewed_by   uuid references public.profiles(id),
  published_at  timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create trigger trg_generated_content_touch
  before update on public.generated_content
  for each row execute procedure public.prevent_immutable_update(); -- reuses updated_at bump; no immutability check applies (is_immutable absent)

-- ---------------------------------------------------------------------
-- 5. VECTOR EMBEDDINGS (semantic search chunks)
-- ---------------------------------------------------------------------
create table public.asset_vectors (
  id             uuid default gen_random_uuid() primary key,
  asset_id       uuid references public.research_assets(id) on delete cascade,
  chunk_index    int not null default 0,
  chunk_content  text not null,
  embedding      vector(768), -- matches nomic-embed-text / llama3 embedding dim
  created_at     timestamptz default now(),
  unique (asset_id, chunk_index)
);

-- ---------------------------------------------------------------------
-- 6. AUDIT LOG (admin auditability requirement)
-- ---------------------------------------------------------------------
create table public.audit_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid references public.profiles(id),
  action      text not null,
  entity      text not null,
  entity_id   uuid,
  metadata    jsonb,
  created_at  timestamptz default now()
);

-- =====================================================================
-- INDEXES
-- =====================================================================
create index idx_assets_fts        on public.research_assets using gin (fts_vector);
create index idx_assets_type       on public.research_assets (asset_type);
create index idx_assets_public     on public.research_assets (is_public);
create index idx_assets_expedition on public.research_assets (expedition_id);
create index idx_vectors_embedding on public.asset_vectors using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index idx_generated_status  on public.generated_content (status);
create index idx_generated_asset   on public.generated_content (asset_id);
create index idx_audit_entity      on public.audit_log (entity, entity_id);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles          enable row level security;
alter table public.expeditions       enable row level security;
alter table public.research_assets   enable row level security;
alter table public.generated_content enable row level security;
alter table public.asset_vectors     enable row level security;
alter table public.audit_log         enable row level security;

-- Helper: current user's role
create function public.current_role_name()
returns text as $$
  select role from public.profiles where id = auth.uid();
$$ language sql stable security definer;

-- profiles: users read their own row; admins read all.
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = id or public.current_role_name() = 'admin');

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- expeditions: publicly readable; only researcher+ can insert.
create policy "expeditions_public_read"
  on public.expeditions for select
  using (true);

create policy "expeditions_insert_researcher"
  on public.expeditions for insert
  with check (public.current_role_name() in ('researcher', 'editor', 'admin'));

-- research_assets: public rows readable by anyone; private rows only by
-- the uploader, editors, and admins. Inserts must be self-attributed.
create policy "assets_select_public_or_privileged"
  on public.research_assets for select
  using (
    is_public = true
    or uploaded_by = auth.uid()
    or public.current_role_name() in ('editor', 'admin')
  );

create policy "assets_insert_self"
  on public.research_assets for insert
  with check (auth.uid() = uploaded_by);

create policy "assets_update_owner_or_privileged"
  on public.research_assets for update
  using (uploaded_by = auth.uid() or public.current_role_name() in ('editor', 'admin'));

-- generated_content: visible to editors/admins always; visible to the
-- asset owner; visible to the public only once published.
create policy "content_select_scoped"
  on public.generated_content for select
  using (
    status = 'published'
    or public.current_role_name() in ('editor', 'admin')
    or exists (
      select 1 from public.research_assets a
      where a.id = asset_id and a.uploaded_by = auth.uid()
    )
  );

create policy "content_insert_backend_or_privileged"
  on public.generated_content for insert
  with check (public.current_role_name() in ('researcher', 'editor', 'admin'));

create policy "content_update_editor_or_admin"
  on public.generated_content for update
  using (public.current_role_name() in ('editor', 'admin'));

-- asset_vectors: never exposed to the public directly; only editors/admins
-- (and the backend service role, which bypasses RLS) can read.
create policy "vectors_select_privileged"
  on public.asset_vectors for select
  using (public.current_role_name() in ('editor', 'admin'));

-- audit_log: admin only.
create policy "audit_select_admin"
  on public.audit_log for select
  using (public.current_role_name() = 'admin');
