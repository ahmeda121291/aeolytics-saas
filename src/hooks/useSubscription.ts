import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { stripePromise, getStripePrice, type PlanType, type BillingInterval } from '../lib/stripe';
import toast from 'react-hot-toast';

interface SubscriptionData {
  plan: PlanType;
  status: string | null;
  billingInterval: BillingInterval | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialEnd: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

export function useSubscription() {
  const { user, updateProfile } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      setSubscription({
        plan: user.profile.plan,
        status: user.profile.subscription_status,
        billingInterval: user.profile.billing_interval,
        currentPeriodStart: user.profile.current_period_start,
        currentPeriodEnd: user.profile.current_period_end,
        trialEnd: user.profile.trial_end,
        stripeCustomerId: user.profile.stripe_customer_id,
        stripeSubscriptionId: user.profile.stripe_subscription_id,
      });
    }
    setLoading(false);
  }, [user]);

  const createCheckoutSession = async (plan: PlanType, interval: BillingInterval) => {
    if (plan === 'free') {
      await updateToPlan('free');
      return;
    }

    try {
      setProcessing(true);
      
      const priceId = getStripePrice(plan, interval);
      if (!priceId) {
        throw new Error('Invalid plan or billing interval');
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId,
          userId: user!.id,
          successUrl: `${window.location.origin}/dashboard?checkout=success`,
          cancelUrl: `${window.location.origin}/dashboard?checkout=canceled`
        }
      });

      if (error) throw error;

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe not loaded');

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      });

      if (stripeError) throw stripeError;

    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to start checkout');
    } finally {
      setProcessing(false);
    }
  };

  const updateToPlan = async (plan: PlanType) => {
    try {
      setProcessing(true);

      const { error } = await supabase
        .from('user_profiles')
        .update({ plan })
        .eq('id', user!.id);

      if (error) throw error;

      // Update local state
      if (user?.profile) {
        await updateProfile({ plan });
      }

      toast.success(`Successfully updated to ${plan} plan`);
    } catch (error: any) {
      console.error('Plan update error:', error);
      toast.error(error.message || 'Failed to update plan');
    } finally {
      setProcessing(false);
    }
  };

  const cancelSubscription = async () => {
    try {
      setProcessing(true);

      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          userId: user!.id,
          subscriptionId: subscription?.stripeSubscriptionId
        }
      });

      if (error) throw error;

      toast.success('Subscription canceled. You can continue using your plan until the end of the billing period.');
      
      // Refresh user data
      const updatedUser = await supabase.auth.getUser();
      if (updatedUser.data.user) {
        // Trigger a refresh of user profile
        window.location.reload();
      }

    } catch (error: any) {
      console.error('Cancellation error:', error);
      toast.error(error.message || 'Failed to cancel subscription');
    } finally {
      setProcessing(false);
    }
  };

  const resumeSubscription = async () => {
    try {
      setProcessing(true);

      const { data, error } = await supabase.functions.invoke('resume-subscription', {
        body: {
          userId: user!.id,
          subscriptionId: subscription?.stripeSubscriptionId
        }
      });

      if (error) throw error;

      toast.success('Subscription resumed successfully');
      
      // Refresh user data
      window.location.reload();

    } catch (error: any) {
      console.error('Resume error:', error);
      toast.error(error.message || 'Failed to resume subscription');
    } finally {
      setProcessing(false);
    }
  };

  const openBillingPortal = async () => {
    try {
      setProcessing(true);

      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: {
          userId: user!.id,
          customerId: subscription?.stripeCustomerId,
          returnUrl: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;

      window.location.href = data.url;

    } catch (error: any) {
      console.error('Portal error:', error);
      toast.error(error.message || 'Failed to open billing portal');
    } finally {
      setProcessing(false);
    }
  };

  const updatePaymentMethod = async () => {
    if (!subscription?.stripeCustomerId) {
      toast.error('No customer ID found');
      return;
    }

    try {
      setProcessing(true);

      const { data, error } = await supabase.functions.invoke('create-setup-intent', {
        body: {
          customerId: subscription.stripeCustomerId,
          userId: user!.id
        }
      });

      if (error) throw error;

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe not loaded');

      const { error: confirmError } = await stripe.confirmCardSetup(data.clientSecret);

      if (confirmError) {
        toast.error(confirmError.message || 'Failed to update payment method');
      } else {
        toast.success('Payment method updated successfully');
      }

    } catch (error: any) {
      console.error('Payment method update error:', error);
      toast.error(error.message || 'Failed to update payment method');
    } finally {
      setProcessing(false);
    }
  };

  const isOnTrial = () => {
    if (!subscription?.trialEnd) return false;
    return new Date(subscription.trialEnd) > new Date();
  };

  const getDaysUntilTrialEnd = () => {
    if (!subscription?.trialEnd) return 0;
    const trialEnd = new Date(subscription.trialEnd);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const canAccessFeature = (feature: string) => {
    if (!subscription) return false;
    
    const plan = subscription.plan;
    const isActive = subscription.status === 'active' || subscription.status === 'trialing';
    
    if (!isActive && plan !== 'free') return false;
    
    switch (feature) {
      case 'advanced_analytics':
        return plan === 'pro' || plan === 'agency';
      case 'fix_it_briefs':
        return plan === 'pro' || plan === 'agency';
      case 'white_label_reports':
        return plan === 'agency';
      case 'api_access':
        return plan === 'agency';
      default:
        return true;
    }
  };

  return {
    subscription,
    loading,
    processing,
    createCheckoutSession,
    updateToPlan,
    cancelSubscription,
    resumeSubscription,
    openBillingPortal,
    updatePaymentMethod,
    isOnTrial,
    getDaysUntilTrialEnd,
    canAccessFeature
  };
}