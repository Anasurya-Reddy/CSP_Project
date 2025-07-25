/*
  # Create health conditions table

  1. New Tables
    - `health_conditions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `condition_name` (text)
      - `medications` (text, optional)
      - `allergies` (text, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `health_conditions` table
    - Add policy for users to manage their own health conditions
*/

CREATE TABLE IF NOT EXISTS public.health_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  condition_name text NOT NULL,
  medications text,
  allergies text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.health_conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own health conditions"
  ON public.health_conditions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);