import { createClient } from 'npm:@supabase/supabase-js@2.39.0';
import Stripe from 'npm:stripe@14.14.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
});

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const signature = req.headers.get('stripe-signature');
    if (!signature || !endpointSecret) {
      throw new Error('Missing stripe signature or webhook secret');
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);

    console.log('Processing webhook event:', event.type);

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(supabaseClient, event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(supabaseClient, event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabaseClient, event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(supabaseClient, event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(supabaseClient, event.data.object);
        break;

      case 'customer.created':
        await handleCustomerCreated(supabaseClient, event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Log the event
    await logWebhookEvent(supabaseClient, event);

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function handleSubscriptionCreated(supabaseClient: any, subscription: any) {
  const userId = subscription.metadata?.supabase_user_id;
  if (!userId) {
    console.error('No user ID found in subscription metadata');
    return;
  }

  const plan = getPlanFromPrice(subscription.items.data[0].price.id);
  const billingInterval = subscription.items.data[0].price.recurring?.interval === 'year' ? 'annual' : 'monthly';

  await supabaseClient
    .from('user_profiles')
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      plan: plan,
      billing_interval: billingInterval,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    })
    .eq('id', userId);

  console.log(`Subscription created for user ${userId}, plan: ${plan}`);
}

async function handleSubscriptionUpdated(supabaseClient: any, subscription: any) {
  const userId = subscription.metadata?.supabase_user_id;
  if (!userId) {
    console.error('No user ID found in subscription metadata');
    return;
  }

  const plan = getPlanFromPrice(subscription.items.data[0].price.id);
  const billingInterval = subscription.items.data[0].price.recurring?.interval === 'year' ? 'annual' : 'monthly';

  await supabaseClient
    .from('user_profiles')
    .update({
      subscription_status: subscription.status,
      plan: plan,
      billing_interval: billingInterval,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    })
    .eq('id', userId);

  console.log(`Subscription updated for user ${userId}, status: ${subscription.status}, plan: ${plan}`);
}

async function handleSubscriptionDeleted(supabaseClient: any, subscription: any) {
  const userId = subscription.metadata?.supabase_user_id;
  if (!userId) {
    console.error('No user ID found in subscription metadata');
    return;
  }

  await supabaseClient
    .from('user_profiles')
    .update({
      subscription_status: 'canceled',
      plan: 'free',
      billing_interval: null,
      current_period_start: null,
      current_period_end: null,
      trial_end: null,
    })
    .eq('id', userId);

  console.log(`Subscription canceled for user ${userId}`);
}

async function handlePaymentSucceeded(supabaseClient: any, invoice: any) {
  const subscriptionId = invoice.subscription;
  
  if (subscriptionId) {
    // Update subscription status to active
    await supabaseClient
      .from('user_profiles')
      .update({ subscription_status: 'active' })
      .eq('stripe_subscription_id', subscriptionId);

    console.log(`Payment succeeded for subscription ${subscriptionId}`);
  }
}

async function handlePaymentFailed(supabaseClient: any, invoice: any) {
  const subscriptionId = invoice.subscription;
  
  if (subscriptionId) {
    // Update subscription status to past_due
    await supabaseClient
      .from('user_profiles')
      .update({ subscription_status: 'past_due' })
      .eq('stripe_subscription_id', subscriptionId);

    // Here you could also send an email notification to the user
    console.log(`Payment failed for subscription ${subscriptionId}`);
  }
}

async function handleCustomerCreated(supabaseClient: any, customer: any) {
  const userId = customer.metadata?.supabase_user_id;
  if (!userId) {
    console.log('Customer created without user ID metadata');
    return;
  }

  await supabaseClient
    .from('user_profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId);

  console.log(`Customer ${customer.id} linked to user ${userId}`);
}

async function logWebhookEvent(supabaseClient: any, event: any) {
  try {
    const userId = event.data.object.metadata?.supabase_user_id || 
                   event.data.object.customer || 
                   null;

    await supabaseClient
      .from('billing_events')
      .insert({
        user_id: userId,
        stripe_event_id: event.id,
        event_type: event.type,
        subscription_id: event.data.object.subscription || null,
        customer_id: event.data.object.customer || null,
        amount: event.data.object.amount_paid || event.data.object.amount || null,
        currency: event.data.object.currency || null,
        status: event.data.object.status || 'processed',
        metadata: event.data.object,
      });

  } catch (error) {
    console.error('Failed to log webhook event:', error);
  }
}

function getPlanFromPrice(priceId: string): 'free' | 'pro' | 'agency' {
  // Map your actual Stripe price IDs to plans
  const priceMapping: Record<string, 'free' | 'pro' | 'agency'> = {
    'price_pro_monthly': 'pro',
    'price_pro_annual': 'pro',
    'price_agency_monthly': 'agency',
    'price_agency_annual': 'agency',
  };

  return priceMapping[priceId] || 'free';
}