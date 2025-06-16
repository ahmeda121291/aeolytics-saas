/*
  # Initial AEOlytics Database Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `plan` (text, default 'free')
      - `usage_queries` (integer, default 0)
      - `usage_domains` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `domains`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `domain` (text, unique per user)
      - `favicon_url` (text, nullable)
      - `status` (text, default 'pending')
      - `queries_count` (integer, default 0)
      - `citations_count` (integer, default 0)
      - `last_check` (timestamp, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `queries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `domain_id` (uuid, references domains, nullable)
      - `query_text` (text)
      - `intent_tags` (text array)
      - `engines` (text array, default ChatGPT,Perplexity,Gemini)
      - `status` (text, default 'active')
      - `last_run` (timestamp, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `citations`
      - `id` (uuid, primary key)
      - `query_id` (uuid, references queries)
      - `user_id` (uuid, references user_profiles)
      - `engine` (text)
      - `response_text` (text)
      - `cited` (boolean, default false)
      - `position` (text, nullable)
      - `confidence_score` (float, default 0)
      - `run_date` (timestamp)
      - `created_at` (timestamp)

    - `fix_it_briefs`
      - `id` (uuid, primary key)
      - `query_id` (uuid, references queries)
      - `user_id` (uuid, references user_profiles)
      - `title` (text)
      - `meta_description` (text)
      - `schema_markup` (text)
      - `content_brief` (text)
      - `faq_entries` (jsonb)
      - `status` (text, default 'generated')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for user data isolation
    - Add policies for authenticated users only
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  plan text DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'agency')),
  usage_queries integer DEFAULT 0,
  usage_domains integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create domains table
CREATE TABLE IF NOT EXISTS domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  domain text NOT NULL,
  favicon_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'error')),
  queries_count integer DEFAULT 0,
  citations_count integer DEFAULT 0,
  last_check timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, domain)
);

-- Create queries table
CREATE TABLE IF NOT EXISTS queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  domain_id uuid REFERENCES domains(id) ON DELETE SET NULL,
  query_text text NOT NULL,
  intent_tags text[] DEFAULT '{}',
  engines text[] DEFAULT ARRAY['ChatGPT', 'Perplexity', 'Gemini'],
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'deleted')),
  last_run timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create citations table
CREATE TABLE IF NOT EXISTS citations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id uuid REFERENCES queries(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  engine text NOT NULL,
  response_text text NOT NULL,
  cited boolean DEFAULT false,
  position text CHECK (position IN ('top', 'middle', 'bottom')),
  confidence_score float DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  run_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create fix_it_briefs table
CREATE TABLE IF NOT EXISTS fix_it_briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id uuid REFERENCES queries(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  meta_description text,
  schema_markup text,
  content_brief text,
  faq_entries jsonb DEFAULT '[]',
  status text DEFAULT 'generated' CHECK (status IN ('generated', 'downloaded', 'implemented')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fix_it_briefs ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- User Profiles Policies
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Domains Policies
CREATE POLICY "Users can read own domains"
  ON domains
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own domains"
  ON domains
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own domains"
  ON domains
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own domains"
  ON domains
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Queries Policies
CREATE POLICY "Users can read own queries"
  ON queries
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own queries"
  ON queries
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own queries"
  ON queries
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own queries"
  ON queries
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Citations Policies
CREATE POLICY "Users can read own citations"
  ON citations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own citations"
  ON citations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Fix-It Briefs Policies
CREATE POLICY "Users can read own fix-it briefs"
  ON fix_it_briefs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own fix-it briefs"
  ON fix_it_briefs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own fix-it briefs"
  ON fix_it_briefs
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_user_profiles
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER set_updated_at_domains
  BEFORE UPDATE ON domains
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER set_updated_at_queries
  BEFORE UPDATE ON queries
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

-- Create indexes for performance
CREATE INDEX idx_domains_user_id ON domains(user_id);
CREATE INDEX idx_queries_user_id ON queries(user_id);
CREATE INDEX idx_queries_domain_id ON queries(domain_id);
CREATE INDEX idx_citations_query_id ON citations(query_id);
CREATE INDEX idx_citations_user_id ON citations(user_id);
CREATE INDEX idx_citations_run_date ON citations(run_date);
CREATE INDEX idx_fix_it_briefs_query_id ON fix_it_briefs(query_id);
CREATE INDEX idx_fix_it_briefs_user_id ON fix_it_briefs(user_id);