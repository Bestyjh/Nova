REVOKE ALL
ON FUNCTION public.issue_certificate(uuid)
FROM anon;

GRANT EXECUTE
ON FUNCTION public.issue_certificate(uuid)
TO authenticated;
