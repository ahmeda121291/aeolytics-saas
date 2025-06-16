import { createClient } from 'npm:@supabase/supabase-js@2.39.0';
import Stripe from 'npm:stripe@14.14.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    });

    const { userId, subscriptionId } = await req.json();

    if (!userId || !subscriptionId) {
      throw new Error('Missing required parameters');
    }

    // Verify the subscription belongs to the user
    const { data: userProfile, error } = await supabaseClient
      .from('user_profiles')
      .select('stripe_subscription_id')
      .eq('id', userId)
      .single();

    if (error || !userProfile || userProfile.stripe_subscription_id !== subscriptionId) {
      throw new Error('Subscription not found or does not belong to user');
    }

    // Cancel the subscription at the end of the current period
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // Update user profile
    await supabaseClient
      .from('user_profiles')
      .update({ 
        subscription_status: 'canceled',
        // Keep the current period end so user retains access until then
      })
      .eq('id', userId);

    return new Response(
      JSON.stringify({
        success: true,
        subscription: subscription,
        message: 'Subscription will be canceled at the end of the current billing period',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Subscription cancellation error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});