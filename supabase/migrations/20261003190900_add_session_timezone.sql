alter table public.sessions
add column timezone text;

update public.sessions
set timezone = 'America/Edmonton'
where timezone is null;

alter table public.sessions
alter column timezone set default 'UTC';

alter table public.sessions
alter column timezone set not null;

comment on column public.sessions.timezone is
'IANA timezone used when the session was scheduled, for example America/Edmonton or America/Toronto.';