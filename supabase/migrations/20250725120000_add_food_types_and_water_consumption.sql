ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS food_types text[] DEFAULT '{}';

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS water_consumption text; 