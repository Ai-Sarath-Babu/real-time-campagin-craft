-- Create campaigns table to store UTM campaigns
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  utm_source TEXT NOT NULL,
  utm_medium TEXT NOT NULL,
  utm_campaign TEXT NOT NULL,
  utm_term TEXT,
  utm_content TEXT,
  utm_id TEXT,
  custom_params JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tracking_events table for real-time event tracking
CREATE TABLE public.tracking_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('click', 'pageview', 'conversion')),
  referrer TEXT,
  user_agent TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campaign_stats table for aggregated analytics
CREATE TABLE public.campaign_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  clicks INTEGER DEFAULT 0,
  pageviews INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_stats ENABLE ROW LEVEL SECURITY;

-- Campaigns policies
CREATE POLICY "Users can view their own campaigns"
  ON public.campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
  ON public.campaigns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
  ON public.campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- Tracking events policies - allow public insert for tracking script
CREATE POLICY "Anyone can insert tracking events"
  ON public.tracking_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view events for their campaigns"
  ON public.tracking_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = tracking_events.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Campaign stats policies
CREATE POLICY "Users can view stats for their campaigns"
  ON public.campaign_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_stats.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX idx_tracking_events_campaign_id ON public.tracking_events(campaign_id);
CREATE INDEX idx_tracking_events_created_at ON public.tracking_events(created_at DESC);
CREATE INDEX idx_campaign_stats_campaign_date ON public.campaign_stats(campaign_id, date DESC);

-- Create function to update campaign stats
CREATE OR REPLACE FUNCTION public.update_campaign_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.campaign_stats (campaign_id, date, clicks, pageviews, conversions, unique_visitors)
  VALUES (
    NEW.campaign_id,
    CURRENT_DATE,
    CASE WHEN NEW.event_type = 'click' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'pageview' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'conversion' THEN 1 ELSE 0 END,
    1
  )
  ON CONFLICT (campaign_id, date)
  DO UPDATE SET
    clicks = campaign_stats.clicks + CASE WHEN NEW.event_type = 'click' THEN 1 ELSE 0 END,
    pageviews = campaign_stats.pageviews + CASE WHEN NEW.event_type = 'pageview' THEN 1 ELSE 0 END,
    conversions = campaign_stats.conversions + CASE WHEN NEW.event_type = 'conversion' THEN 1 ELSE 0 END,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update stats on new tracking events
CREATE TRIGGER update_stats_on_tracking_event
  AFTER INSERT ON public.tracking_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_campaign_stats();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for campaigns updated_at
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for tracking_events
ALTER PUBLICATION supabase_realtime ADD TABLE public.tracking_events;
ALTER TABLE public.tracking_events REPLICA IDENTITY FULL;