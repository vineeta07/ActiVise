-- Extend missions with volunteer planning metadata.
ALTER TABLE public.missions
ADD COLUMN IF NOT EXISTS required_volunteers INTEGER NOT NULL DEFAULT 30;
-- Campaign registrations for WhatsApp-enabled updates.
CREATE TABLE IF NOT EXISTS public.campaign_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
    campaign_title TEXT NOT NULL,
    user_key TEXT NOT NULL DEFAULT 'demo-user',
    phone TEXT,
    whatsapp_opt_in BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'registered',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS campaign_registrations_user_campaign_idx ON public.campaign_registrations (user_key, campaign_id);
ALTER TABLE public.campaign_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Campaign registrations viewable by everyone" ON public.campaign_registrations;
CREATE POLICY "Campaign registrations viewable by everyone" ON public.campaign_registrations FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can create campaign registrations" ON public.campaign_registrations;
CREATE POLICY "Anyone can create campaign registrations" ON public.campaign_registrations FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can update campaign registrations" ON public.campaign_registrations;
CREATE POLICY "Anyone can update campaign registrations" ON public.campaign_registrations FOR
UPDATE USING (true);
-- Company progress that gates ESG report visibility.
CREATE TABLE IF NOT EXISTS public.company_task_progress (
    company_key TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    completed_tasks INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.company_task_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Company task progress viewable by everyone" ON public.company_task_progress;
CREATE POLICY "Company task progress viewable by everyone" ON public.company_task_progress FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can insert company task progress" ON public.company_task_progress;
CREATE POLICY "Anyone can insert company task progress" ON public.company_task_progress FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can update company task progress" ON public.company_task_progress;
CREATE POLICY "Anyone can update company task progress" ON public.company_task_progress FOR
UPDATE USING (true);
INSERT INTO public.company_task_progress (company_key, company_name, completed_tasks)
VALUES ('greenorbit-tech', 'GreenOrbit Technologies', 0) ON CONFLICT (company_key) DO NOTHING;
-- Unified notifications table for in-app and WhatsApp events.
CREATE TABLE IF NOT EXISTS public.app_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'in-app',
    user_phone TEXT,
    campaign_id UUID REFERENCES public.missions(id) ON DELETE
    SET NULL,
        priority TEXT NOT NULL DEFAULT 'normal',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.app_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Notifications viewable by everyone" ON public.app_notifications;
CREATE POLICY "Notifications viewable by everyone" ON public.app_notifications FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can create notifications" ON public.app_notifications;
CREATE POLICY "Anyone can create notifications" ON public.app_notifications FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can update notifications" ON public.app_notifications;
CREATE POLICY "Anyone can update notifications" ON public.app_notifications FOR
UPDATE USING (true);
-- Certificate content anchor records for blockchain-noted payload hashes.
CREATE TABLE IF NOT EXISTS public.certificate_anchors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    mission_title TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    chain_reference TEXT NOT NULL,
    anchor_status TEXT NOT NULL DEFAULT 'anchored',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.certificate_anchors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Certificate anchors viewable by everyone" ON public.certificate_anchors;
CREATE POLICY "Certificate anchors viewable by everyone" ON public.certificate_anchors FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can create certificate anchors" ON public.certificate_anchors;
CREATE POLICY "Anyone can create certificate anchors" ON public.certificate_anchors FOR
INSERT WITH CHECK (true);