/*
  # Team Collaboration Schema
  
  1. New Tables
    - `teams`
      - `id` (uuid, primary key)
      - `name` (text)
      - `owner_id` (uuid, foreign key to user_profiles)
      - `plan` (text, constrained to 'agency')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `team_members`
      - `id` (uuid, primary key)
      - `team_id` (uuid, foreign key to teams)
      - `user_id` (uuid, foreign key to user_profiles)
      - `role` (text, constrained to owner/admin/editor/viewer)
      - `permissions` (jsonb)
      - `invited_by` (uuid, foreign key to user_profiles)
      - `joined_at` (timestamp)
    
    - `team_invitations`
      - `id` (uuid, primary key)
      - `team_id` (uuid, foreign key to teams)
      - `email` (text)
      - `role` (text, constrained to admin/editor/viewer)
      - `invited_by` (uuid, foreign key to user_profiles)
      - `token` (text, unique)
      - `expires_at` (timestamp)
      - `accepted_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for team access control
    - Team owners can manage their teams
    - Team members can view teams they belong to
    - Team admins can manage members and invitations

  3. Functions & Triggers
    - Auto-add team owner as member when team is created
    - Auto-update updated_at timestamp on teams
*/

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  plan text DEFAULT 'agency' CHECK (plan = 'agency'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Team members table  
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  permissions jsonb DEFAULT '{}',
  invited_by uuid REFERENCES user_profiles(id),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Team invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  invited_by uuid NOT NULL REFERENCES user_profiles(id),
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teams
CREATE POLICY "Team owners can manage teams"
  ON teams FOR ALL
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Team members can view teams"
  ON teams FOR SELECT
  TO authenticated
  USING (id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

-- RLS Policies for team_members
CREATE POLICY "Team members can view team membership"
  ON team_members FOR SELECT
  TO authenticated
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Team admins can manage members"
  ON team_members FOR ALL
  TO authenticated
  USING (team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- RLS Policies for team_invitations
CREATE POLICY "Team admins can manage invitations"
  ON team_invitations FOR ALL
  TO authenticated
  USING (team_id IN (
    SELECT team_id FROM team_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);

-- Function to automatically add team owner as member
CREATE OR REPLACE FUNCTION add_team_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO team_members (team_id, user_id, role, invited_by)
  VALUES (NEW.id, NEW.owner_id, 'owner', NEW.owner_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to add owner as team member
DROP TRIGGER IF EXISTS add_team_owner_trigger ON teams;
CREATE TRIGGER add_team_owner_trigger
  AFTER INSERT ON teams
  FOR EACH ROW
  EXECUTE FUNCTION add_team_owner_as_member();

-- Update function for teams (reuse existing function if available)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at'
  ) THEN
    CREATE FUNCTION handle_updated_at()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at_teams ON teams;
CREATE TRIGGER set_updated_at_teams
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();