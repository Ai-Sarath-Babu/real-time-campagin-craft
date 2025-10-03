-- Add new columns to tracking_events for advanced analytics
ALTER TABLE public.tracking_events
ADD COLUMN IF NOT EXISTS ip_address text,
ADD COLUMN IF NOT EXISTS visitor_id text,
ADD COLUMN IF NOT EXISTS page_path text,
ADD COLUMN IF NOT EXISTS element_selector text,
ADD COLUMN IF NOT EXISTS element_text text,
ADD COLUMN IF NOT EXISTS screen_recording_url text;

-- Create index for faster queries on visitor_id
CREATE INDEX IF NOT EXISTS idx_tracking_events_visitor_id ON public.tracking_events(visitor_id);

-- Create index for faster queries on ip_address
CREATE INDEX IF NOT EXISTS idx_tracking_events_ip_address ON public.tracking_events(ip_address);

-- Create index for faster queries on page_path
CREATE INDEX IF NOT EXISTS idx_tracking_events_page_path ON public.tracking_events(page_path);