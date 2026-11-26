-- Free demo usage counter (server-key fallback for visitors without their own API key).
-- One row per (subject, UTC day). Subjects are hashed IPs ("ip:<sha256>") and user ids ("user:<uuid>").
-- Only the service role touches this table; RLS is on with no policies so clients can't read or write it.

CREATE TABLE IF NOT EXISTS public.demo_usage (
    subject TEXT NOT NULL CHECK (char_length(subject) <= 200),
    day DATE NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
    count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (subject, day)
);

ALTER TABLE public.demo_usage ENABLE ROW LEVEL SECURITY;

-- Atomically consume one demo message for every subject in p_subjects.
-- Returns the highest resulting count, or NULL (and consumes nothing) if any
-- subject has already reached p_limit today.
CREATE OR REPLACE FUNCTION public.consume_demo_message(p_subjects TEXT[], p_limit INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_today DATE := (now() AT TIME ZONE 'utc')::date;
    v_max INTEGER;
BEGIN
    -- Lock today's rows for these subjects so concurrent requests can't overshoot
    PERFORM 1 FROM demo_usage
    WHERE subject = ANY(p_subjects) AND day = v_today
    FOR UPDATE;

    IF EXISTS (
        SELECT 1 FROM demo_usage
        WHERE subject = ANY(p_subjects) AND day = v_today AND count >= p_limit
    ) THEN
        RETURN NULL;
    END IF;

    INSERT INTO demo_usage (subject, day, count)
    SELECT s, v_today, 1 FROM unnest(p_subjects) AS s
    ON CONFLICT (subject, day) DO UPDATE SET count = demo_usage.count + 1;

    SELECT max(count) INTO v_max FROM demo_usage
    WHERE subject = ANY(p_subjects) AND day = v_today;

    RETURN v_max;
END;
$$;

-- Read-only view of today's usage (for the remaining-messages indicator)
CREATE OR REPLACE FUNCTION public.get_demo_usage(p_subjects TEXT[])
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(max(count), 0) FROM demo_usage
    WHERE subject = ANY(p_subjects) AND day = (now() AT TIME ZONE 'utc')::date;
$$;

REVOKE ALL ON FUNCTION public.consume_demo_message(TEXT[], INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_demo_usage(TEXT[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_demo_message(TEXT[], INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_demo_usage(TEXT[]) TO service_role;

-- Old rows are useless after their day; prune anything older than a week when convenient:
-- DELETE FROM public.demo_usage WHERE day < (now() AT TIME ZONE 'utc')::date - 7;
