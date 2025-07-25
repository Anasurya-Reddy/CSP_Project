/*
  # Create recommendations table

  1. New Tables
    - `recommendations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `recommended_foods` (text array)
      - `foods_to_avoid` (text array)
      - `supplements` (text array)
      - `explanations` (jsonb)
      - `warnings` (text array)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `recommendations` table
    - Add policy for users to manage their own recommendations
*/

CREATE TABLE IF NOT EXISTS public.recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recommended_foods text[] NOT NULL DEFAULT '{}',
  foods_to_avoid text[] NOT NULL DEFAULT '{}',
  supplements text[] NOT NULL DEFAULT '{}',
  explanations jsonb NOT NULL DEFAULT '{}',
  warnings text[] NOT NULL DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own recommendations"
  ON public.recommendations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);