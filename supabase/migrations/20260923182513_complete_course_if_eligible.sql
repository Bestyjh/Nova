create or replace function public.complete_course_if_eligible(p_course_id uuid)
returns table(completed boolean, completed_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_enrollment_id uuid;
  v_status public.enrollment_status;
  v_completed_at timestamptz;
  v_total integer;
  v_done integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select e.id, e.status, e.completed_at
    into v_enrollment_id, v_status, v_completed_at
  from public.enrollments e
  where e.user_id = v_user_id
    and e.course_id = p_course_id
    and e.status in ('active'::public.enrollment_status, 'completed'::public.enrollment_status)
  limit 1;

  if v_enrollment_id is null then
    raise exception 'Enrollment not found';
  end if;

  select count(*)
    into v_total
  from public.lessons l
  join public.modules m on m.id = l.module_id
  where m.course_id = p_course_id
    and l.published = true;

  if v_total = 0 then
    return query select false, v_completed_at;
    return;
  end if;

  select count(*)
    into v_done
  from public.lessons l
  join public.modules m on m.id = l.module_id
  join public.lesson_progress lp
    on lp.lesson_id = l.id
   and lp.user_id = v_user_id
   and lp.completed = true
  where m.course_id = p_course_id
    and l.published = true;

  if v_done <> v_total then
    return query select false, v_completed_at;
    return;
  end if;

  if v_status <> 'completed'::public.enrollment_status or v_completed_at is null then
    update public.enrollments
       set status = 'completed'::public.enrollment_status,
           completed_at = coalesce(public.enrollments.completed_at, now())
     where id = v_enrollment_id
     returning public.enrollments.completed_at into v_completed_at;
  end if;

  return query select true, v_completed_at;
end;
$$;

revoke all on function public.complete_course_if_eligible(uuid) from public;
grant execute on function public.complete_course_if_eligible(uuid) to authenticated;;
