-- Fix search_path for set_meeting_id function
CREATE OR REPLACE FUNCTION public.set_meeting_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.meeting_id IS NULL OR NEW.meeting_id = '' THEN
    NEW.meeting_id := generate_meeting_id();
    WHILE EXISTS (SELECT 1 FROM public.meetings WHERE meeting_id = NEW.meeting_id) LOOP
      NEW.meeting_id := generate_meeting_id();
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;