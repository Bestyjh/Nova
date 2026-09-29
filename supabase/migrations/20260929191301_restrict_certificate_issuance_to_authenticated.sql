REVOKE EXECUTE
ON FUNCTION public.issue_certificate(uuid)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.issue_certificate(uuid)
TO authenticated;

GRANT EXECUTE
ON FUNCTION public.issue_certificate(uuid)
TO service_role;