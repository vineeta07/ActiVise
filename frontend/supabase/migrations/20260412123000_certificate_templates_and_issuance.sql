-- Template-driven certificate issuance and blockchain tracking.
CREATE TABLE IF NOT EXISTS public.certificate_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_code TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    body_template TEXT NOT NULL,
    placeholders TEXT [] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Certificate templates viewable by everyone" ON public.certificate_templates;
CREATE POLICY "Certificate templates viewable by everyone" ON public.certificate_templates FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can create certificate templates" ON public.certificate_templates;
CREATE POLICY "Anyone can create certificate templates" ON public.certificate_templates FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can update certificate templates" ON public.certificate_templates;
CREATE POLICY "Anyone can update certificate templates" ON public.certificate_templates FOR
UPDATE USING (true);
CREATE TABLE IF NOT EXISTS public.certificate_issuances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id TEXT NOT NULL UNIQUE,
    template_code TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    issuer_name TEXT NOT NULL,
    mission_title TEXT NOT NULL,
    filler JSONB NOT NULL DEFAULT '{}'::jsonb,
    rendered_content TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    chain_reference TEXT,
    tx_hash TEXT,
    chain_id BIGINT,
    contract_address TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT certificate_issuances_template_code_fkey FOREIGN KEY (template_code) REFERENCES public.certificate_templates(template_code)
);
CREATE INDEX IF NOT EXISTS certificate_issuances_recipient_created_idx ON public.certificate_issuances (recipient_name, created_at DESC);
ALTER TABLE public.certificate_issuances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Certificate issuances viewable by everyone" ON public.certificate_issuances;
CREATE POLICY "Certificate issuances viewable by everyone" ON public.certificate_issuances FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can create certificate issuances" ON public.certificate_issuances;
CREATE POLICY "Anyone can create certificate issuances" ON public.certificate_issuances FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can update certificate issuances" ON public.certificate_issuances;
CREATE POLICY "Anyone can update certificate issuances" ON public.certificate_issuances FOR
UPDATE USING (true);
-- Reuse the existing generic timestamp trigger helper.
DROP TRIGGER IF EXISTS update_certificate_issuances_updated_at ON public.certificate_issuances;
CREATE TRIGGER update_certificate_issuances_updated_at BEFORE
UPDATE ON public.certificate_issuances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.certificate_templates (
        template_code,
        display_name,
        body_template,
        placeholders,
        is_active
    )
VALUES (
        'volunteer',
        'Volunteer Certificate',
        'This is to certify that {{recipient_name}} has successfully volunteered in "{{mission_title}}" and delivered measurable community impact. Impact summary: {{impact_summary}}. Issued by {{issuer_name}} on {{issued_on}}.',
        ARRAY ['recipient_name', 'mission_title', 'impact_summary', 'issuer_name', 'issued_on'],
        true
    ),
    (
        'donor',
        'Donor Certificate',
        'This certifies that {{recipient_name}} supported "{{mission_title}}" through a contribution of {{contribution_amount}} and enabled verified impact outcomes. Impact summary: {{impact_summary}}. Issued by {{issuer_name}} on {{issued_on}}.',
        ARRAY ['recipient_name', 'mission_title', 'contribution_amount', 'impact_summary', 'issuer_name', 'issued_on'],
        true
    ),
    (
        'partner',
        'Partner/Sponsor Certificate',
        'This certifies that {{recipient_name}} partnered in "{{mission_title}}" as {{partnership_role}} and helped drive verified civic impact. Impact summary: {{impact_summary}}. Issued by {{issuer_name}} on {{issued_on}}.',
        ARRAY ['recipient_name', 'mission_title', 'partnership_role', 'impact_summary', 'issuer_name', 'issued_on'],
        true
    ) ON CONFLICT (template_code) DO
UPDATE
SET display_name = EXCLUDED.display_name,
    body_template = EXCLUDED.body_template,
    placeholders = EXCLUDED.placeholders,
    is_active = EXCLUDED.is_active;