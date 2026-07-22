
-- Extensions
create extension if not exists "pgcrypto";

-- Profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  role text default 'user',
  student_id text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
drop policy if exists "profiles_update_own_or_admin" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin());

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (id = auth.uid() or public.is_admin());

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Subjects
create table if not exists public.subjects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  code text,
  year integer not null,
  semester integer not null,
  description text,
  icon text,
  created_at timestamptz default now()
);

alter table public.subjects enable row level security;

drop policy if exists "subjects_read_authenticated" on public.subjects;
drop policy if exists "subjects_write_admin" on public.subjects;

create policy "subjects_read_authenticated"
  on public.subjects for select
  to authenticated
  using (true);

create policy "subjects_write_admin"
  on public.subjects for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- uploaded_notes
create table if not exists public.uploaded_notes (
  id uuid default gen_random_uuid() primary key,
  subject_id uuid references public.subjects(id) on delete set null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  file_name text,
  file_url text,
  extracted_text text,
  ai_analyzed boolean default false,
  created_at timestamptz default now()
);

alter table public.uploaded_notes enable row level security;

drop policy if exists "notes_select_own_or_admin" on public.uploaded_notes;
drop policy if exists "notes_insert_authenticated" on public.uploaded_notes;
drop policy if exists "notes_update_own_or_admin" on public.uploaded_notes;
drop policy if exists "notes_delete_admin" on public.uploaded_notes;

create policy "notes_select_own_or_admin"
  on public.uploaded_notes for select
  using (uploaded_by = auth.uid() or public.is_admin());

create policy "notes_insert_authenticated"
  on public.uploaded_notes for insert
  with check (uploaded_by = auth.uid() or public.is_admin());

create policy "notes_update_own_or_admin"
  on public.uploaded_notes for update
  using (uploaded_by = auth.uid() or public.is_admin());

create policy "notes_delete_admin"
  on public.uploaded_notes for delete
  using (public.is_admin());

-- labs
create table if not exists public.labs (
  id uuid default gen_random_uuid() primary key,
  subject_id uuid references public.subjects(id) on delete cascade,
  note_id uuid references public.uploaded_notes(id) on delete set null,
  title text not null,
  description text,
  theory_content jsonb,
  practical_steps jsonb,
  code_examples jsonb,
  simulation_data jsonb,
  difficulty text default 'beginner',
  order_index integer,
  created_at timestamptz default now()
);

alter table public.labs enable row level security;

drop policy if exists "labs_read_authenticated" on public.labs;
drop policy if exists "labs_write_admin" on public.labs;

create policy "labs_read_authenticated"
  on public.labs for select
  to authenticated
  using (true);

create policy "labs_write_admin"
  on public.labs for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- questions
create table if not exists public.questions (
  id uuid default gen_random_uuid() primary key,
  lab_id uuid references public.labs(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete cascade,
  question_text text not null,
  options jsonb,
  correct_answer text,
  explanation text,
  question_type text,
  points integer default 10,
  created_at timestamptz default now()
);

alter table public.questions enable row level security;

drop policy if exists "questions_read_authenticated" on public.questions;
drop policy if exists "questions_write_admin" on public.questions;

create policy "questions_read_authenticated"
  on public.questions for select
  to authenticated
  using (true);

create policy "questions_write_admin"
  on public.questions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- user_progress
create table if not exists public.user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  lab_id uuid references public.labs(id) on delete cascade,
  completed boolean default false,
  score integer default 0,
  answers jsonb,
  completed_at timestamptz,
  created_at timestamptz default now()
);

alter table public.user_progress enable row level security;

drop policy if exists "progress_select_own_or_admin" on public.user_progress;
drop policy if exists "progress_upsert_own" on public.user_progress;
drop policy if exists "progress_update_own_or_admin" on public.user_progress;

create policy "progress_select_own_or_admin"
  on public.user_progress for select
  using (user_id = auth.uid() or public.is_admin());

create policy "progress_upsert_own"
  on public.user_progress for insert
  with check (user_id = auth.uid() or public.is_admin());

create policy "progress_update_own_or_admin"
  on public.user_progress for update
  using (user_id = auth.uid() or public.is_admin());

-- achievements
create table if not exists public.achievements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  title text,
  description text,
  badge_icon text,
  earned_at timestamptz default now()
);

alter table public.achievements enable row level security;

drop policy if exists "achievements_select_own_or_admin" on public.achievements;
drop policy if exists "achievements_insert_own_or_admin" on public.achievements;

create policy "achievements_select_own_or_admin"
  on public.achievements for select
  using (user_id = auth.uid() or public.is_admin());

create policy "achievements_insert_own_or_admin"
  on public.achievements for insert
  with check (user_id = auth.uid() or public.is_admin());

-- notifications (in-app: achievements, clan wars, battle invites, etc.)
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'system',
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id)
  where read_at is null;

alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own_or_admin" on public.notifications;
drop policy if exists "notifications_insert_own_or_admin" on public.notifications;
drop policy if exists "notifications_update_own_or_admin" on public.notifications;
drop policy if exists "notifications_delete_own_or_admin" on public.notifications;

create policy "notifications_select_own_or_admin"
  on public.notifications for select
  using (user_id = auth.uid() or public.is_admin());

create policy "notifications_insert_own_or_admin"
  on public.notifications for insert
  with check (user_id = auth.uid() or public.is_admin());

create policy "notifications_update_own_or_admin"
  on public.notifications for update
  using (user_id = auth.uid() or public.is_admin());

create policy "notifications_delete_own_or_admin"
  on public.notifications for delete
  using (user_id = auth.uid() or public.is_admin());

-- chat_sessions
create table if not exists public.chat_sessions (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  session_title text default 'New Chat',
  mode text check (mode in ('general','concept_explain','code_debug','past_papers','lab_practical')) default 'general',
  language text default 'en',
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.chat_sessions enable row level security;

drop policy if exists "chat_select_own" on public.chat_sessions;
drop policy if exists "chat_insert_own" on public.chat_sessions;
drop policy if exists "chat_update_own" on public.chat_sessions;
drop policy if exists "chat_delete_own" on public.chat_sessions;

create policy "chat_select_own"
  on public.chat_sessions for select
  using (user_id = auth.uid() or public.is_admin());

create policy "chat_insert_own"
  on public.chat_sessions for insert
  with check (user_id = auth.uid());

create policy "chat_update_own"
  on public.chat_sessions for update
  using (user_id = auth.uid() or public.is_admin());

create policy "chat_delete_own"
  on public.chat_sessions for delete
  using (user_id = auth.uid() or public.is_admin());

-- Storage bucket (course materials)
insert into storage.buckets (id, name, public)
values ('course-materials', 'course-materials', false)
on conflict (id) do nothing;

drop policy if exists "storage_course_read_own_or_admin" on storage.objects;
drop policy if exists "storage_course_upload_own" on storage.objects;
drop policy if exists "storage_course_update_admin" on storage.objects;

create policy "storage_course_read_own_or_admin"
  on storage.objects for select
  using (
    bucket_id = 'course-materials'
    and (owner = auth.uid() or public.is_admin())
  );

create policy "storage_course_upload_own"
  on storage.objects for insert
  with check (bucket_id = 'course-materials' and owner = auth.uid());

create policy "storage_course_update_admin"
  on storage.objects for update
  using (bucket_id = 'course-materials' and public.is_admin());

-- Profile avatars (public read; users write only under userId/ prefix)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars_select_public" on storage.objects;
drop policy if exists "avatars_insert_own" on storage.objects;
drop policy if exists "avatars_update_own" on storage.objects;
drop policy if exists "avatars_delete_own" on storage.objects;

create policy "avatars_select_public"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "avatars_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "avatars_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );

-- Seed HNDIT subjects (skips rows that already match name+year+semester)
insert into public.subjects (name, code, year, semester, description, icon)
select v.name, v.code, v.year, v.semester, v.description, v.icon
from (
  values
    ('IT Fundamentals', 'Y1S1-ITF', 1, 1, 'HNDIT Year 1 Semester 1', 'cpu'),
    ('Mathematics I', 'Y1S1-M1', 1, 1, 'HNDIT Year 1 Semester 1', 'sigma'),
    ('Communication Skills', 'Y1S1-COM', 1, 1, 'HNDIT Year 1 Semester 1', 'message-circle'),
    ('Programming Fundamentals', 'Y1S1-PF', 1, 1, 'HNDIT Year 1 Semester 1', 'code'),
    ('Digital Logic', 'Y1S1-DL', 1, 1, 'HNDIT Year 1 Semester 1', 'circuit-board'),
    ('Database Concepts', 'Y1S1-DBC', 1, 1, 'HNDIT Year 1 Semester 1', 'database'),
    ('Networking Basics', 'Y1S1-NET', 1, 1, 'HNDIT Year 1 Semester 1', 'network'),
    ('Web Basics', 'Y1S1-WEB', 1, 1, 'HNDIT Year 1 Semester 1', 'globe'),
    ('OOP Concepts', 'Y1S2-OOP', 1, 2, 'HNDIT Year 1 Semester 2', 'box'),
    ('Mathematics II', 'Y1S2-M2', 1, 2, 'HNDIT Year 1 Semester 2', 'sigma'),
    ('Data Structures', 'Y1S2-DS', 1, 2, 'HNDIT Year 1 Semester 2', 'git-branch'),
    ('Operating Systems', 'Y1S2-OS', 1, 2, 'HNDIT Year 1 Semester 2', 'monitor'),
    ('Web Development', 'Y1S2-WD', 1, 2, 'HNDIT Year 1 Semester 2', 'layout'),
    ('Software Engineering', 'Y1S2-SE', 1, 2, 'HNDIT Year 1 Semester 2', 'workflow'),
    ('Computer Architecture', 'Y1S2-CA', 1, 2, 'HNDIT Year 1 Semester 2', 'cpu'),
    ('Project Management', 'Y1S2-PM', 1, 2, 'HNDIT Year 1 Semester 2', 'kanban'),
    ('Advanced Database', 'Y2S1-ADB', 2, 1, 'HNDIT Year 2 Semester 1', 'database'),
    ('Java Programming', 'Y2S1-JAVA', 2, 1, 'HNDIT Year 2 Semester 1', 'coffee'),
    ('Network Administration', 'Y2S1-NA', 2, 1, 'HNDIT Year 2 Semester 1', 'router'),
    ('System Analysis', 'Y2S1-SA', 2, 1, 'HNDIT Year 2 Semester 1', 'layers'),
    ('Mobile Development', 'Y2S1-MOB', 2, 1, 'HNDIT Year 2 Semester 1', 'smartphone'),
    ('Cloud Computing', 'Y2S1-CC', 2, 1, 'HNDIT Year 2 Semester 1', 'cloud'),
    ('Cyber Security', 'Y2S1-SEC', 2, 1, 'HNDIT Year 2 Semester 1', 'shield'),
    ('IT Ethics', 'Y2S1-ETH', 2, 1, 'HNDIT Year 2 Semester 1', 'scale'),
    ('Final Project', 'Y2S2-FP', 2, 2, 'HNDIT Year 2 Semester 2', 'flag'),
    ('Advanced Web', 'Y2S2-AW', 2, 2, 'HNDIT Year 2 Semester 2', 'globe'),
    ('AI Fundamentals', 'Y2S2-AI', 2, 2, 'HNDIT Year 2 Semester 2', 'sparkles'),
    ('DevOps', 'Y2S2-DO', 2, 2, 'HNDIT Year 2 Semester 2', 'settings'),
    ('Enterprise Systems', 'Y2S2-ES', 2, 2, 'HNDIT Year 2 Semester 2', 'building-2'),
    ('Research Methods', 'Y2S2-RM', 2, 2, 'HNDIT Year 2 Semester 2', 'search'),
    ('Capstone Lab', 'Y2S2-CL', 2, 2, 'HNDIT Year 2 Semester 2', 'flask-conical'),
    ('Professional Development', 'Y2S2-PD', 2, 2, 'HNDIT Year 2 Semester 2', 'briefcase')
) as v(name, code, year, semester, description, icon)
where not exists (
  select 1 from public.subjects s
  where s.name = v.name and s.year = v.year and s.semester = v.semester
);

create unique index if not exists user_progress_user_lab_uidx
  on public.user_progress (user_id, lab_id);

