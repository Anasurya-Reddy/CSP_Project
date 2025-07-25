/*
  # Create user profiles table

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `full_name` (text)
      - `age` (integer)
      - `gender` (text)
      - `dietary_preference` (text)
      - `location` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policy for users to manage their own profiles
*/

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  age integer NOT NULL,
  gender text NOT NULL,
  dietary_preference text NOT NULL,
  location text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own profiles"
  ON public.user_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);