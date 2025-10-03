import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const trackingEventSchema = z.object({
  campaign_id: z.string().uuid().optional(),
  event_type: z.enum(['click', 'pageview', 'conversion']),
  referrer: z.string().trim().max(2048).optional(),
  utm_source: z.string().trim().max(255).optional(),
  utm_medium: z.string().trim().max(255).optional(),
  utm_campaign: z.string().trim().max(255).optional(),
  visitor_id: z.string().trim().max(255).optional(),
  page_path: z.string().trim().max(2048).optional(),
  element_selector: z.string().trim().max(500).optional(),
  element_text: z.string().trim().max(500).optional(),
  screen_recording_url: z.string().trim().max(2048).optional(),
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    
    // Validate input
    const validationResult = trackingEventSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Validation failed:', validationResult.error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: validationResult.error.errors 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { 
      campaign_id, 
      event_type,
      referrer,
      utm_source,
      utm_medium,
      utm_campaign,
      visitor_id,
      page_path,
      element_selector,
      element_text,
      screen_recording_url
    } = validationResult.data;

    console.log('Received tracking event:', { 
      campaign_id, 
      event_type, 
      utm_source, 
      utm_medium, 
      utm_campaign,
      visitor_id,
      page_path
    });

    // Get user agent and IP address
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     req.headers.get('x-real-ip') || 
                     'Unknown';

    // Parse user agent for device/browser info
    const deviceType = userAgent.includes('Mobile') ? 'mobile' : 
                       userAgent.includes('Tablet') ? 'tablet' : 'desktop';
    
    const browser = userAgent.includes('Chrome') ? 'Chrome' :
                    userAgent.includes('Firefox') ? 'Firefox' :
                    userAgent.includes('Safari') ? 'Safari' : 'Other';

    // Generate a session ID (could be improved with actual session tracking)
    const sessionId = crypto.randomUUID();

    // Find campaign by ID or UTM parameters
    let finalCampaignId = campaign_id;

    if (!finalCampaignId && utm_source && utm_medium && utm_campaign) {
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('id')
        .eq('utm_source', utm_source)
        .eq('utm_medium', utm_medium)
        .eq('utm_campaign', utm_campaign)
        .single();

      if (campaign) {
        finalCampaignId = campaign.id;
      }
    }

    if (!finalCampaignId) {
      return new Response(
        JSON.stringify({ error: 'Campaign not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert tracking event
    const { data, error } = await supabase
      .from('tracking_events')
      .insert({
        campaign_id: finalCampaignId,
        event_type,
        referrer,
        user_agent: userAgent,
        device_type: deviceType,
        browser: browser,
        session_id: sessionId,
        ip_address: clientIp,
        visitor_id: visitor_id || sessionId,
        page_path,
        element_selector,
        element_text,
        screen_recording_url,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting tracking event:', error);
      throw error;
    }

    console.log('Tracking event inserted successfully:', data.id);

    return new Response(
      JSON.stringify({ success: true, event_id: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in track-event function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
