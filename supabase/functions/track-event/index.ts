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

// Rate limiting: Max 100 events per IP per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  entry.count++;
  return true;
}

// Sanitize page path to remove query parameters and fragments
function sanitizePagePath(path: string | undefined): string | null {
  if (!path) return null;
  try {
    const url = new URL(path, 'https://example.com');
    return url.pathname.substring(0, 500);
  } catch {
    return path.split('?')[0].split('#')[0].substring(0, 500);
  }
}

// Sanitize element text to prevent PII leakage
function sanitizeElementText(text: string | undefined): string | null {
  if (!text) return null;
  // Remove emails, phone numbers, and truncate
  return text
    .replace(/[\w.-]+@[\w.-]+\.\w+/g, '[email]')
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[phone]')
    .substring(0, 200);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract client IP from various headers
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                     req.headers.get('x-real-ip') ||
                     req.headers.get('cf-connecting-ip') ||
                     'unknown';
    
    // Rate limiting check
    if (!checkRateLimit(clientIp)) {
      console.warn(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    console.log('Received tracking event from IP:', clientIp, {
      event_type, 
      visitor_id,
      page_path
    });

    // Get user agent and parse device info
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const deviceType = userAgent.includes('Mobile') ? 'mobile' : 
                       userAgent.includes('Tablet') ? 'tablet' : 'desktop';
    
    const browser = userAgent.includes('Chrome') ? 'Chrome' :
                    userAgent.includes('Firefox') ? 'Firefox' :
                    userAgent.includes('Safari') ? 'Safari' : 'Other';

    // Sanitize tracking data to prevent PII leakage
    const sanitizedPagePath = sanitizePagePath(page_path);
    const sanitizedElementText = sanitizeElementText(element_text);

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

    // Use visitor_id as session identifier (better than generating new UUID)
    const sessionId = visitor_id || crypto.randomUUID();

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
        page_path: sanitizedPagePath,
        element_selector,
        element_text: sanitizedElementText,
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
