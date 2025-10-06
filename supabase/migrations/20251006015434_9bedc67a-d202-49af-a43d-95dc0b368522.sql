-- Add domain column to campaigns table
ALTER TABLE public.campaigns 
ADD COLUMN domain text NOT NULL DEFAULT '';

-- Add index for faster domain filtering
CREATE INDEX idx_campaigns_domain ON public.campaigns(domain);

-- Add index for user_id and domain combination
CREATE INDEX idx_campaigns_user_domain ON public.campaigns(user_id, domain);

-- Update existing campaigns to extract domain from URL
UPDATE public.campaigns 
SET domain = CASE 
  WHEN url ~* '^https?://([^/]+)' THEN 
    substring(url from '^https?://([^/]+)')
  ELSE 
    'unknown'
END
WHERE domain = '';