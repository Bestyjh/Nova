ALTER TABLE public.enrollments
ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;