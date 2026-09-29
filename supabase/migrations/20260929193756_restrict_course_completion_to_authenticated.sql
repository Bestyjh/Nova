REVOKE EXECUTE
ON FUNCTION public.complete_course_if_eligible(uuid)
FROM PUBLIC;

REVOKE EXECUTE
ON FUNCTION public.complete_course_if_eligible(uuid)
FROM anon;

GRANT EXECUTE
ON FUNCTION public.complete_course_if_eligible(uuid)
TO authenticated;

GRANT EXECUTE
ON FUNCTION public.complete_course_if_eligible(uuid)
TO service_role;