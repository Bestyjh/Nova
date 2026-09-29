CREATE OR REPLACE FUNCTION public.submit_assessment(
  p_assessment_id uuid,
  p_answers jsonb
)
RETURNS TABLE(
  attempt_id uuid,
  score numeric,
  passed boolean,
  points_earned integer,
  points_possible integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid;
  v_attempt_id uuid;
  v_course_id uuid;
  v_passing_score integer;
  v_max_attempts integer;
  v_attempt_count integer;
  v_points_earned integer := 0;
  v_points_possible integer := 0;
  v_score numeric(5,2) := 0;
  v_passed boolean := false;
  v_question record;
  v_selected_answer text;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication required.';
  end if;

  /*
   * Resolve the assessment and its authoritative
   * course through:
   *
   * assessment -> lesson -> module -> course
   *
   * The assessment and lesson must both be published.
   */
  select
    m.course_id,
    a.passing_score,
    a.max_attempts
  into
    v_course_id,
    v_passing_score,
    v_max_attempts
  from public.assessments a
  join public.lessons l
    on l.id = a.lesson_id
  join public.modules m
    on m.id = l.module_id
  where a.id = p_assessment_id
    and a.published = true
    and l.published = true;

  if not found then
    raise exception 'Assessment not found or unavailable.';
  end if;

  /*
   * Assessment submission requires a current course
   * enrollment. Cancelled enrollments are excluded.
   */
  if not exists (
    select 1
    from public.enrollments e
    where e.user_id = v_user_id
      and e.course_id = v_course_id
      and e.status in (
        'active'::public.enrollment_status,
        'completed'::public.enrollment_status
      )
  ) then
    raise exception 'You are not enrolled in this course.';
  end if;

  /*
   * Once an assessment has been passed, another
   * submission is unnecessary and must not consume
   * additional attempts.
   */
  if exists (
    select 1
    from public.assessment_attempts aa
    where aa.assessment_id = p_assessment_id
      and aa.user_id = v_user_id
      and aa.completed_at is not null
      and aa.passed = true
  ) then
    raise exception 'Assessment has already been passed.';
  end if;

  select count(*)
  into v_attempt_count
  from public.assessment_attempts aa
  where aa.assessment_id = p_assessment_id
    and aa.user_id = v_user_id
    and aa.completed_at is not null;

  if v_max_attempts is not null
     and v_attempt_count >= v_max_attempts then
    raise exception 'Maximum assessment attempts reached.';
  end if;

  select coalesce(sum(q.points), 0)
  into v_points_possible
  from public.assessment_questions q
  where q.assessment_id = p_assessment_id;

  if v_points_possible <= 0 then
    raise exception 'Assessment has no scorable questions.';
  end if;

  insert into public.assessment_attempts (
    assessment_id,
    user_id
  )
  values (
    p_assessment_id,
    v_user_id
  )
  returning id into v_attempt_id;

  for v_question in
    select
      q.id,
      q.correct_answer,
      q.points
    from public.assessment_questions q
    where q.assessment_id = p_assessment_id
    order by q.position, q.id
  loop
    v_selected_answer :=
      nullif(
        trim(
          coalesce(
            p_answers ->> v_question.id::text,
            ''
          )
        ),
        ''
      );

    insert into public.assessment_answers (
      attempt_id,
      question_id,
      selected_answer,
      correct,
      points_awarded
    )
    values (
      v_attempt_id,
      v_question.id,
      v_selected_answer,
      v_selected_answer is not null
        and v_selected_answer =
          v_question.correct_answer,
      case
        when v_selected_answer is not null
          and v_selected_answer =
            v_question.correct_answer
        then v_question.points
        else 0
      end
    );

    if v_selected_answer is not null
       and v_selected_answer =
         v_question.correct_answer then
      v_points_earned :=
        v_points_earned + v_question.points;
    end if;
  end loop;

  v_score :=
    round(
      (
        v_points_earned::numeric /
        v_points_possible::numeric
      ) * 100,
      2
    );

  v_passed :=
    v_score >= v_passing_score;

  update public.assessment_attempts
  set
    score = v_score,
    passed = v_passed,
    completed_at = now()
  where id = v_attempt_id;

  return query
  select
    v_attempt_id,
    v_score,
    v_passed,
    v_points_earned,
    v_points_possible;
end;
$function$;

REVOKE ALL
ON FUNCTION public.submit_assessment(uuid, jsonb)
FROM anon;

GRANT EXECUTE
ON FUNCTION public.submit_assessment(uuid, jsonb)
TO authenticated;