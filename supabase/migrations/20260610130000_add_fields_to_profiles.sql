ALTER TABLE public.profiles
ADD COLUMN full_name text,
ADD COLUMN email text,
ADD COLUMN phone text,
ADD COLUMN skills text[] DEFAULT '{}'::text[],
ADD COLUMN twitter_url text,
ADD COLUMN instagram_url text,
ADD COLUMN experience jsonb DEFAULT '[]'::jsonb;
