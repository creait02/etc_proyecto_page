-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_email TEXT,
    contact_phone TEXT,
    contact_instagram TEXT,
    contact_address TEXT,
    contact_title_en TEXT,
    contact_title_es TEXT,
    contact_subtitle_en TEXT,
    contact_subtitle_es TEXT,
    contact_description_en TEXT,
    contact_description_es TEXT,
    footer_description_en TEXT,
    footer_description_es TEXT,
    hero_title_en TEXT,
    hero_title_es TEXT,
    hero_subtitle_en TEXT,
    hero_subtitle_es TEXT,
    hero_video TEXT,
    home_bg_image TEXT,
    about_text_en TEXT,
    about_text_es TEXT,
    services_title_en TEXT,
    services_title_es TEXT,
    services_description_en TEXT,
    services_description_es TEXT,
    services_btn1_en TEXT,
    services_btn1_es TEXT,
    services_btn2_en TEXT,
    services_btn2_es TEXT,
    services_stat1_value TEXT,
    services_stat1_label_en TEXT,
    services_stat1_label_es TEXT,
    services_stat2_value TEXT,
    services_stat2_label_en TEXT,
    services_stat2_label_es TEXT,
    services_stat3_value TEXT,
    services_stat3_label_en TEXT,
    services_stat3_label_es TEXT,
    services_stat4_value TEXT,
    services_stat4_label_en TEXT,
    services_stat4_label_es TEXT,
    services_media_type TEXT,
    services_video_url TEXT,
    services_image_1 TEXT,
    services_image_2 TEXT,
    services_image_3 TEXT,
    services_image_4 TEXT,
    highlights_title_en TEXT,
    highlights_title_es TEXT,
    logo_alt TEXT,
    logo_url TEXT,
    services_en JSONB,
    services_es JSONB,
    team_title_en TEXT,
    team_title_es TEXT,
    team_description_en TEXT,
    team_description_es TEXT,
    team_tags_en TEXT,
    team_tags_es TEXT,
    project_filters JSONB,
    social_links JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Protect site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." 
ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Users can insert settings." 
ON public.site_settings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update settings." 
ON public.site_settings FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete settings." 
ON public.site_settings FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    titleEs TEXT,
    category TEXT,
    categoryEs TEXT,
    description TEXT,
    descriptionEs TEXT,
    status TEXT,
    image TEXT,
    gallery JSONB,
    slug TEXT UNIQUE,
    "order" INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Protect projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public projects are viewable by everyone." 
ON public.projects FOR SELECT USING (true);
CREATE POLICY "Users can insert projects." 
ON public.projects FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update projects." 
ON public.projects FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete projects." 
ON public.projects FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    role TEXT,
    role_en TEXT,
    role_es TEXT,
    image TEXT,
    "order" INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Protect team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public team members are viewable by everyone." 
ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Users can insert team members." 
ON public.team_members FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update team members." 
ON public.team_members FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete team members." 
ON public.team_members FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create highlights table
CREATE TABLE IF NOT EXISTS public.highlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_en TEXT,
    title_es TEXT,
    category_en TEXT,
    category_es TEXT,
    description_en TEXT,
    description_es TEXT,
    body_en TEXT,
    body_es TEXT,
    image_url TEXT,
    video_url TEXT,
    gallery_url_1 TEXT,
    gallery_url_2 TEXT,
    "order" INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migration for highlights table (to ensure columns exist if table already created)
ALTER TABLE public.highlights 
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS title_es TEXT,
ADD COLUMN IF NOT EXISTS category_en TEXT,
ADD COLUMN IF NOT EXISTS category_es TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_es TEXT,
ADD COLUMN IF NOT EXISTS body_en TEXT,
ADD COLUMN IF NOT EXISTS body_es TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS gallery_url_1 TEXT,
ADD COLUMN IF NOT EXISTS gallery_url_2 TEXT;

-- Protect highlights
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public highlights are viewable by everyone." ON public.highlights;
CREATE POLICY "Public highlights are viewable by everyone." 
ON public.highlights FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert highlights." ON public.highlights;
CREATE POLICY "Users can insert highlights." 
ON public.highlights FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update highlights." ON public.highlights;
CREATE POLICY "Users can update highlights." 
ON public.highlights FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can delete highlights." ON public.highlights;
CREATE POLICY "Users can delete highlights." 
ON public.highlights FOR DELETE USING (auth.uid() IS NOT NULL);

-- Migration to add new columns to existing table
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS home_bg_image TEXT,
ADD COLUMN IF NOT EXISTS services_title_en TEXT,
ADD COLUMN IF NOT EXISTS services_title_es TEXT,
ADD COLUMN IF NOT EXISTS services_description_en TEXT,
ADD COLUMN IF NOT EXISTS services_description_es TEXT,
ADD COLUMN IF NOT EXISTS services_btn1_en TEXT,
ADD COLUMN IF NOT EXISTS services_btn1_es TEXT,
ADD COLUMN IF NOT EXISTS services_btn2_en TEXT,
ADD COLUMN IF NOT EXISTS services_btn2_es TEXT,
ADD COLUMN IF NOT EXISTS services_stat1_value TEXT,
ADD COLUMN IF NOT EXISTS services_stat1_label_en TEXT,
ADD COLUMN IF NOT EXISTS services_stat1_label_es TEXT,
ADD COLUMN IF NOT EXISTS services_stat2_value TEXT,
ADD COLUMN IF NOT EXISTS services_stat2_label_en TEXT,
ADD COLUMN IF NOT EXISTS services_stat2_label_es TEXT,
ADD COLUMN IF NOT EXISTS services_stat3_value TEXT,
ADD COLUMN IF NOT EXISTS services_stat3_label_en TEXT,
ADD COLUMN IF NOT EXISTS services_stat3_label_es TEXT,
ADD COLUMN IF NOT EXISTS services_stat4_value TEXT,
ADD COLUMN IF NOT EXISTS services_stat4_label_en TEXT,
ADD COLUMN IF NOT EXISTS services_stat4_label_es TEXT,
ADD COLUMN IF NOT EXISTS services_media_type TEXT,
ADD COLUMN IF NOT EXISTS services_video_url TEXT,
ADD COLUMN IF NOT EXISTS services_image_1 TEXT,
ADD COLUMN IF NOT EXISTS services_image_2 TEXT,
ADD COLUMN IF NOT EXISTS services_image_3 TEXT,
ADD COLUMN IF NOT EXISTS services_image_4 TEXT,
ADD COLUMN IF NOT EXISTS highlights_title_en TEXT,
ADD COLUMN IF NOT EXISTS highlights_title_es TEXT,
ADD COLUMN IF NOT EXISTS logo_alt TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS home_title_en TEXT,
ADD COLUMN IF NOT EXISTS home_title_es TEXT,
ADD COLUMN IF NOT EXISTS home_pretitle_en TEXT,
ADD COLUMN IF NOT EXISTS home_pretitle_es TEXT,
ADD COLUMN IF NOT EXISTS home_subtitle_en TEXT,
ADD COLUMN IF NOT EXISTS home_subtitle_es TEXT,
ADD COLUMN IF NOT EXISTS team_subtitle_en TEXT,
ADD COLUMN IF NOT EXISTS team_subtitle_es TEXT;

