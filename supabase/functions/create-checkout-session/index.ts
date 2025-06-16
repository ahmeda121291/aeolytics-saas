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

    const { priceId, userId, successUrl, cancelUrl } = await req.json();

    if (!priceId || !userId) {
      throw new Error('Missing required parameters');
    }

    // Get user profile
    const { data: userProfile, error: userError } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userProfile) {
      throw new Error('User not found');
    }

    let customerId = userProfile.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userProfile.email,
        name: userProfile.full_name || undefined,
        metadata: {
          supabase_user_id: userId,
        },
      });

      customerId = customer.id;

      // Update user profile with customer ID
      await supabaseClient
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      subscription_data: {
        metadata: {
          supabase_user_id: userId,
        },
        trial_period_days: 14, // 14-day free trial
      },
      metadata: {
        supabase_user_id: userId,
      },
    });

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Checkout session creation error:', error);
    
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