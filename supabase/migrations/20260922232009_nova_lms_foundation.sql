create type public.user_role as enum ('learner','admin');
create type public.enrollment_status as enum ('active','completed','cancelled');
create type public.lesson_kind as enum ('video','article','resource','quiz');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  role public.user_role not null default 'learner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null default '',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  position integer not null check (position >= 0),
  created_at timestamptz not null default now(),
  unique(course_id, position)
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  position integer not null check (position >= 0),
  kind public.lesson_kind not null default 'article',
  content jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(module_id, position)
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status public.enrollment_status not null default 'active',
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(user_id, course_id)
);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

create index modules_course_id_idx on public.modules(course_id);
create index lessons_module_id_idx on public.lessons(module_id);
create index enrollments_user_id_idx on public.enrollments(user_id);
create index enrollments_course_id_idx on public.enrollments(course_id);
create index lesson_progress_user_id_idx on public.lesson_progress(user_id);
create index lesson_progress_lesson_id_idx on public.lesson_progress(lesson_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'); $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id, first_name, last_name)
  values(new.id, coalesce(new.raw_user_meta_data->>'first_name',''), coalesce(new.raw_user_meta_data->>'last_name',''));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;

create policy "profiles_read_own" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

create policy "published_courses_read" on public.courses for select using (published or public.is_admin());
create policy "admin_courses_all" on public.courses for all using (public.is_admin()) with check (public.is_admin());
create policy "published_modules_read" on public.modules for select using (exists(select 1 from public.courses c where c.id = course_id and c.published) or public.is_admin());
create policy "admin_modules_all" on public.modules for all using (public.is_admin()) with check (public.is_admin());
create policy "published_lessons_read" on public.lessons for select using ((published and exists(select 1 from public.modules m join public.courses c on c.id=m.course_id where m.id=module_id and c.published)) or public.is_admin());
create policy "admin_lessons_all" on public.lessons for all using (public.is_admin()) with check (public.is_admin());

create policy "enrollments_read_own" on public.enrollments for select using (user_id = auth.uid() or public.is_admin());
create policy "enrollments_insert_own" on public.enrollments for insert with check (user_id = auth.uid() or public.is_admin());
create policy "admin_enrollments_all" on public.enrollments for all using (public.is_admin()) with check (public.is_admin());

create policy "progress_read_own" on public.lesson_progress for select using (user_id = auth.uid() or public.is_admin());
create policy "progress_insert_own" on public.lesson_progress for insert with check (user_id = auth.uid() or public.is_admin());
create policy "progress_update_own" on public.lesson_progress for update using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "admin_progress_all" on public.lesson_progress for all using (public.is_admin()) with check (public.is_admin());;
