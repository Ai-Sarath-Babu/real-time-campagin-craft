-- Phase 1: Fix Profile Visibility (CRITICAL)
-- Drop overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Create restrictive policy - users can only view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Phase 2: Remove Legacy Tables (meetings system not in use)
-- Drop legacy tables that have infinite recursion issues and are unused
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.meeting_participants CASCADE;
DROP TABLE IF EXISTS public.meetings CASCADE;

-- Drop associated functions
DROP FUNCTION IF EXISTS public.generate_meeting_id() CASCADE;
DROP FUNCTION IF EXISTS public.set_meeting_id() CASCADE;

-- Phase 1: Enhance Tracking Events Table for Rate Limiting
-- Add index for IP-based rate limiting queries
CREATE INDEX IF NOT EXISTS idx_tracking_events_ip_created 
ON public.tracking_events(ip_address, created_at);

-- Add index for visitor-based analytics
CREATE INDEX IF NOT EXISTS idx_tracking_events_visitor_created 
ON public.tracking_events(visitor_id, created_at);