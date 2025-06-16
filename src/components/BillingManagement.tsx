import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  X,
  ExternalLink,
  Download,
  RefreshCw,
  Gift,
  Zap,
  Crown,
  Building
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import CheckoutButton from './CheckoutButton';

interface SubscriptionData {
  subscription_status: string | null;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

const BillingManagement = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPlans, setShowPlans] = useState(false);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        return;
      }

      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="h-20 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const getCurrentPlan = () => {
    if (!subscription?.price_id) return 'Free';
    
    const priceMap: Record<string, string> = {
      'price_1RadHCIjzkLyDZ6KtGZyrkzV': 'Pro',
      'price_1RadHrIjzkLyDZ6Ky6HxJtI7': 'Pro',
      'price_1RadJ0IjzkLyDZ6KZCZzkCFf': 'Agency',
      'price_1RadJTIjzkLyDZ6KVGIJa3XM': 'Agency',
    };

    return priceMap[subscription.price_id] || 'Pro';
  };

  const getCurrentPrice = () => {
    if (!subscription?.price_id) return '$0';
    
    const priceMap: Record<string, string> = {
      'price_1RadHCIjzkLyDZ6KtGZyrkzV': '$49',
      'price_1RadHrIjzkLyDZ6Ky6HxJtI7': '$39',
      'price_1RadJ0IjzkLyDZ6KZCZzkCFf': '$199',
      'price_1RadJTIjzkLyDZ6KVGIJa3XM': '$159',
    };

    return priceMap[subscription.price_id] || '$49';
  };

  const getStatusBadge = () => {
    if (!subscription?.subscription_status) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm font-medium">
          <Zap className="w-4 h-4" />
          Free Plan
        </div>
      );
    }

    const status = subscription.subscription_status;
    
    switch (status) {
      case 'active':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Active
          </div>
        );
      case 'trialing':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
            <Gift className="w-4 h-4" />
            Trial
          </div>
        );
      case 'past_due':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
            <AlertTriangle className="w-4 h-4" />
            Past Due
          </div>
        );
      case 'canceled':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm font-medium">
            <X className="w-4 h-4" />
            Canceled
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm font-medium">
            {status}
          </div>
        );
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      icon: Zap,
      price: { monthly: 0, annual: 0 },
      features: [
        '50 queries/month',
        '1 domain tracking',
        'Basic dashboard',
        'ChatGPT tracking only',
        'Email support'
      ],
      priceId: null
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: Crown,
      price: { monthly: 49, annual: 39 },
      features: [
        '1,000 queries/month',
        '5 domains tracking',
        'All AI engines',
        'Advanced analytics',
        'Fix-It briefs',
        'Priority support'
      ],
      popular: true,
      priceId: {
        monthly: 'price_1RadHCIjzkLyDZ6KtGZyrkzV',
        annual: 'price_1RadHrIjzkLyDZ6Ky6HxJtI7'
      }
    },
    {
      id: 'agency',
      name: 'Agency',
      icon: Building,
      price: { monthly: 199, annual: 159 },
      features: [
        '10,000 queries/month',
        '10 domains tracking',
        'White-label reports',
        'API access',
        'Team collaboration',
        'Dedicated support'
      ],
      priceId: {
        monthly: 'price_1RadJ0IjzkLyDZ6KZCZzkCFf',
        annual: 'price_1RadJTIjzkLyDZ6KVGIJa3XM'
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Billing & Subscription</h2>
          <p className="text-gray-400">Manage your subscription and billing information</p>
        </div>
        
        <button
          onClick={() => setShowPlans(true)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Change Plan
        </button>
      </div>

      {/* Current Plan Overview */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Current Plan</h3>
          {getStatusBadge()}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {getCurrentPlan()}
            </div>
            <div className="text-gray-400 text-sm">Plan</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {getCurrentPrice()}
            </div>
            <div className="text-gray-400 text-sm">
              {subscription?.price_id ? 'per month' : 'Forever'}
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {getCurrentPlan() === 'Free' ? '50' : getCurrentPlan() === 'Pro' ? '1,000' : '10,000'}
            </div>
            <div className="text-gray-400 text-sm">Queries/month</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {getCurrentPlan() === 'Free' ? '1' : getCurrentPlan() === 'Pro' ? '5' : '10'}
            </div>
            <div className="text-gray-400 text-sm">Domains</div>
          </div>
        </div>

        {subscription?.current_period_end && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-400 mb-1">Current Period</div>
              <div className="text-white">
                {subscription.current_period_start 
                  ? new Date(subscription.current_period_start * 1000).toLocaleDateString()
                  : 'N/A'
                } - {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-400 mb-1">
                {subscription.cancel_at_period_end ? 'Ends On' : 'Next Billing Date'}
              </div>
              <div className="text-white">
                {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}

        {subscription?.payment_method_last4 && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Payment Method</div>
            <div className="text-white">
              {subscription.payment_method_brand?.toUpperCase()} •••• {subscription.payment_method_last4}
            </div>
          </div>
        )}
      </div>

      {/* Plan Selection Modal */}
      {showPlans && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowPlans(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Choose Your Plan</h3>
              <button
                onClick={() => setShowPlans(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <span className={`font-medium ${billingInterval === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
                  Monthly
                </span>
                <button
                  onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'annual' : 'monthly')}
                  className={`relative w-16 h-8 rounded-full transition-colors ${
                    billingInterval === 'annual' ? 'bg-primary-500' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      billingInterval === 'annual' ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`font-medium ${billingInterval === 'annual' ? 'text-white' : 'text-gray-400'}`}>
                  Annual
                  <span className="ml-2 text-xs bg-accent-500 text-dark-900 px-2 py-1 rounded-full font-bold">
                    Save 20%
                  </span>
                </span>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {plans.map((plan) => {
                  const Icon = plan.icon;
                  const price = plan.price[billingInterval];
                  const isCurrentPlan = getCurrentPlan().toLowerCase() === plan.id;

                  return (
                    <div
                      key={plan.id}
                      className={`relative bg-gray-700/50 rounded-xl p-6 border-2 ${
                        plan.popular ? 'border-primary-500' : 'border-gray-600'
                      } ${isCurrentPlan ? 'ring-2 ring-accent-500' : ''}`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                          Most Popular
                        </div>
                      )}

                      {isCurrentPlan && (
                        <div className="absolute -top-3 right-4 bg-accent-500 text-dark-900 px-3 py-1 rounded-full text-sm font-bold">
                          Current
                        </div>
                      )}

                      <div className="text-center mb-6">
                        <Icon className="w-10 h-10 text-accent-500 mx-auto mb-3" />
                        <h4 className="text-xl font-bold text-white mb-2">{plan.name}</h4>
                        <div className="text-3xl font-bold text-white mb-1">
                          {price === 0 ? 'Free' : `$${price}`}
                        </div>
                        {price > 0 && (
                          <div className="text-gray-400 text-sm">
                            per month{billingInterval === 'annual' && ', billed annually'}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-accent-500 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {plan.priceId && !isCurrentPlan ? (
                        <CheckoutButton
                          priceId={plan.priceId[billingInterval]}
                          mode="subscription"
                          className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg font-medium transition-all"
                        >
                          Upgrade to {plan.name}
                        </CheckoutButton>
                      ) : (
                        <button
                          disabled
                          className="w-full bg-gray-600 text-gray-400 py-2 rounded-lg font-medium cursor-not-allowed"
                        >
                          {isCurrentPlan ? 'Current Plan' : 'Free Plan'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default BillingManagement;