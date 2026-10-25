-- Per-user practice sessions for Articulation Coach.
--
-- Auth: Supabase Auth (email + password). Each row belongs to one auth user and
-- RLS scopes every read/write to `auth.uid()`, so the browser's publishable key
-- can only ever touch the signed-in user's own data.

create table if not exists public.sessions (
    id            uuid        primary key default gen_random_uuid(),
    user_id       uuid        not null references auth.users(id) on delete cascade,
    created_at    timestamptz not null default now(),
    week          int,
    day           int,
    drill         text,
    pack          text,
    prompt        text,
    score         int,
    wpm           int,
    filler_count  int,
    transcript    text
);

create index if not exists sessions_user_created_idx
    on public.sessions (user_id, created_at desc);

alter table public.sessions enable row level security;

-- Idempotent policies (drop-then-create so the file can be re-applied).
drop policy if exists "own sessions select" on public.sessions;
drop policy if exists "own sessions insert" on public.sessions;
drop policy if exists "own sessions update" on public.sessions;
drop policy if exists "own sessions delete" on public.sessions;

create policy "own sessions select" on public.sessions
    for select to authenticated using (auth.uid() = user_id);
create policy "own sessions insert" on public.sessions
    for insert to authenticated with check (auth.uid() = user_id);
create policy "own sessions update" on public.sessions
    for update to authenticated using (auth.uid() = user_id);
create policy "own sessions delete" on public.sessions
    for delete to authenticated using (auth.uid() = user_id);
