/*
  # Add Billing and Subscription Fields

  1. New Tables
    - `billing_events` - Track Stripe webhook events
    
  2. Table Updates  
    - `user_profiles` - Add Stripe and subscription fields
    
  3. Security
    - Enable RLS on new tables
    - Add policies for billing data access
*/

-- Add billing fields to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS subscription_status text CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS billing_interval text CHECK (billing_interval IN ('monthly', 'annual'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS current_period_start timestamptz;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS current_period_end timestamptz;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS trial_end timestamptz;

-- Create billing_events table
CREATE TABLE IF NOT EXISTS billing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  stripe_event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  subscription_id text,
  customer_id text,
  amount integer,
  currency text,
  status text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

-- Policies for billing_events
CREATE POLICY "Users can read own billing events"
  ON billing_events
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admin policy for billing events (for webhook processing)
CREATE POLICY "Service role can manage billing events"
  ON billing_events
  FOR ALL
  TO service_role
  USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_billing_events_user_id ON billing_events(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_stripe_event_id ON billing_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_subscription_id ON billing_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer_id ON user_profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_subscription_id ON user_profiles(stripe_subscription_id);