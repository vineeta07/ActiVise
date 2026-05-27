-- AI verification results (linked to reports/impact_proofs)
CREATE TABLE IF NOT EXISTS public.ai_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proof_id UUID REFERENCES public.impact_proofs(id) ON DELETE CASCADE,
    classification TEXT NOT NULL,
    confidence DOUBLE PRECISION NOT NULL,
    severity TEXT NOT NULL,
    spam_score DOUBLE PRECISION NOT NULL,
    model_version TEXT NOT NULL,
    raw_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "AI results viewable by everyone" ON public.ai_results FOR SELECT USING (true);
CREATE POLICY "Anyone can create AI results" ON public.ai_results FOR INSERT WITH CHECK (true);

-- Threaded comments for forum
CREATE TABLE IF NOT EXISTS public.forum_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL DEFAULT 'Anonymous',
    author_avatar TEXT NOT NULL DEFAULT 'AN',
    content TEXT NOT NULL,
    depth INTEGER NOT NULL DEFAULT 0,
    likes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments viewable by everyone" ON public.forum_comments FOR SELECT USING (true);
CREATE POLICY "Anyone can create comments" ON public.forum_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update comments" ON public.forum_comments FOR UPDATE USING (true);

-- Upvote tracking (prevents double-voting)
CREATE TABLE IF NOT EXISTS public.forum_upvotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE,
    user_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    -- Allow upvoting either a post OR a comment, but not both in the same record
    CONSTRAINT check_post_or_comment CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR 
        (post_id IS NULL AND comment_id IS NOT NULL)
    ),
    -- Ensure a user can only upvote a specific post or comment once
    CONSTRAINT unique_post_upvote UNIQUE (post_id, user_key),
    CONSTRAINT unique_comment_upvote UNIQUE (comment_id, user_key)
);

ALTER TABLE public.forum_upvotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Upvotes viewable by everyone" ON public.forum_upvotes FOR SELECT USING (true);
CREATE POLICY "Anyone can create upvotes" ON public.forum_upvotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete upvotes" ON public.forum_upvotes FOR DELETE USING (true);

-- Gamification features for volunteers table
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0;
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'Seedling';
