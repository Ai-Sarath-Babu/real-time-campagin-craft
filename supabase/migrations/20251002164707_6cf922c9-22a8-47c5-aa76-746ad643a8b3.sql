-- Phase 1: Fix Critical Profile Exposure
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create restrictive policy - only authenticated users can view profiles
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Phase 2: Lock Down Data Manipulation

-- Protect campaign_stats from manual manipulation
CREATE POLICY "Prevent manual stats inserts"
ON public.campaign_stats
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Prevent stats updates"
ON public.campaign_stats
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "Prevent stats deletes"
ON public.campaign_stats
FOR DELETE
TO authenticated
USING (false);

-- Protect tracking_events from tampering
CREATE POLICY "Prevent event updates"
ON public.tracking_events
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "Campaign owners can delete tracking events"
ON public.tracking_events
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM campaigns
    WHERE campaigns.id = tracking_events.campaign_id
      AND campaigns.user_id = auth.uid()
  )
);