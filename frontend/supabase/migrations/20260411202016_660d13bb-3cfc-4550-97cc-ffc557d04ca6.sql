
-- Create missions table
CREATE TABLE public.missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'waste_cleanup',
  status TEXT NOT NULL DEFAULT 'active',
  urgency TEXT NOT NULL DEFAULT 'medium',
  latitude DOUBLE PRECISION NOT NULL DEFAULT 19.076,
  longitude DOUBLE PRECISION NOT NULL DEFAULT 72.8777,
  location_name TEXT,
  fund_goal INTEGER DEFAULT 0,
  fund_raised INTEGER DEFAULT 0,
  volunteer_count INTEGER DEFAULT 0,
  geofence_radius INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Missions are viewable by everyone" ON public.missions FOR SELECT USING (true);
CREATE POLICY "Anyone can create missions" ON public.missions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update missions" ON public.missions FOR UPDATE USING (true);

-- Create impact proofs table
CREATE TABLE public.impact_proofs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID REFERENCES public.missions(id),
  before_photo_url TEXT,
  after_photo_url TEXT,
  vision_class TEXT,
  vision_confidence DOUBLE PRECISION,
  geo_within_geofence BOOLEAN DEFAULT false,
  geo_distance_m DOUBLE PRECISION,
  exif_authentic BOOLEAN DEFAULT false,
  co2_offset_kg DOUBLE PRECISION DEFAULT 0,
  sdgs TEXT[] DEFAULT '{}',
  verification_status TEXT DEFAULT 'pending',
  volunteer_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.impact_proofs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Impact proofs viewable by everyone" ON public.impact_proofs FOR SELECT USING (true);
CREATE POLICY "Anyone can create proofs" ON public.impact_proofs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update proofs" ON public.impact_proofs FOR UPDATE USING (true);

-- Create community posts table
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  author_avatar TEXT NOT NULL DEFAULT 'AN',
  location TEXT DEFAULT 'Mumbai, MH',
  content TEXT NOT NULL,
  tag TEXT DEFAULT 'general',
  likes INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts viewable by everyone" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Anyone can create posts" ON public.community_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update posts" ON public.community_posts FOR UPDATE USING (true);

-- Create volunteers/leaderboard table
CREATE TABLE public.volunteers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT 'XX',
  sbt_count INTEGER DEFAULT 0,
  co2_offset DOUBLE PRECISION DEFAULT 0,
  badge TEXT DEFAULT 'Civic Hero',
  impact_rank INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Volunteers viewable by everyone" ON public.volunteers FOR SELECT USING (true);
CREATE POLICY "Anyone can create volunteers" ON public.volunteers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update volunteers" ON public.volunteers FOR UPDATE USING (true);

-- Storage bucket for photos
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);
CREATE POLICY "Photos are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
CREATE POLICY "Anyone can upload photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos');

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON public.missions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
