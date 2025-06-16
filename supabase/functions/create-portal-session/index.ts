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

    const { userId, customerId, returnUrl } = await req.json();

    if (!userId || !returnUrl) {
      throw new Error('Missing required parameters');
    }

    let stripeCustomerId = customerId;

    // If no customer ID provided, get it from user profile
    if (!stripeCustomerId) {
      const { data: userProfile, error } = await supabaseClient
        .from('user_profiles')
        .select('stripe_customer_id, email, full_name')
        .eq('id', userId)
        .single();

      if (error || !userProfile) {
        throw new Error('User not found');
      }

      stripeCustomerId = userProfile.stripe_customer_id;

      // Create customer if doesn't exist
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: userProfile.email,
          name: userProfile.full_name || undefined,
          metadata: {
            supabase_user_id: userId,
          },
        });

        stripeCustomerId = customer.id;

        // Update user profile with customer ID
        await supabaseClient
          .from('user_profiles')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('id', userId);
      }
    }

    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    return new Response(
      JSON.stringify({
        url: portalSession.url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Portal session creation error:', error);
    
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