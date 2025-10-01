-- Fix search_path for update_campaign_stats function
CREATE OR REPLACE FUNCTION public.update_campaign_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Fix search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;