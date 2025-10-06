import { z } from 'zod';

export const campaignSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Campaign name is required")
    .max(100, "Campaign name too long"),
  url: z.string()
    .trim()
    .url("Invalid URL format")
    .max(2048, "URL too long"),
  domain: z.string()
    .trim()
    .min(1, "Domain is required")
    .max(255, "Domain too long")
    .regex(/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/, "Invalid domain format"),
  utm_source: z.string()
    .trim()
    .min(1, "Source is required")
    .max(255, "Source too long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Source contains invalid characters"),
  utm_medium: z.string()
    .trim()
    .min(1, "Medium is required")
    .max(255, "Medium too long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Medium contains invalid characters"),
  utm_campaign: z.string()
    .trim()
    .min(1, "Campaign is required")
    .max(255, "Campaign too long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Campaign contains invalid characters"),
  utm_term: z.string().trim().max(255).optional().or(z.literal('')),
  utm_content: z.string().trim().max(255).optional().or(z.literal('')),
  utm_id: z.string().trim().max(255).optional().or(z.literal('')),
  custom: z.string().trim().max(500).optional().or(z.literal('')),
});

export const trackingEventSchema = z.object({
  campaign_id: z.string().uuid().optional(),
  event_type: z.enum(['click', 'pageview', 'conversion']),
  referrer: z.string().trim().max(2048).optional(),
  utm_source: z.string().trim().max(255).optional(),
  utm_medium: z.string().trim().max(255).optional(),
  utm_campaign: z.string().trim().max(255).optional(),
});

export const authSchema = z.object({
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email too long"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password too long"),
});
