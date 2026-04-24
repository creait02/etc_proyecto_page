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
    about_text_en TEXT,
    about_text_es TEXT,
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
