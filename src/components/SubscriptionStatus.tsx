import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertTriangle, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SubscriptionData {
  subscription_status: string | null;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
}

export default function SubscriptionStatus() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status, price_id, current_period_end, cancel_at_period_end')
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
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!subscription || !subscription.subscription_status) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          <span className="text-gray-300 text-sm">Free Plan</span>
        </div>
      </div>
    );
  }

  const getStatusInfo = () => {
    const status = subscription.subscription_status;
    
    switch (status) {
      case 'active':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          label: 'Active',
          description: subscription.cancel_at_period_end 
            ? 'Cancels at period end' 
            : 'Subscription active'
        };
      case 'trialing':
        return {
          icon: Clock,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          label: 'Trial',
          description: 'Free trial active'
        };
      case 'past_due':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          label: 'Past Due',
          description: 'Payment required'
        };
      case 'canceled':
        return {
          icon: X,
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          label: 'Canceled',
          description: 'Subscription canceled'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          label: status,
          description: 'Subscription status'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const Icon = statusInfo.icon;

  const getPlanName = () => {
    if (!subscription.price_id) return 'Unknown Plan';
    
    // Map price IDs to plan names
    const priceMap: Record<string, string> = {
      'price_1RadHCIjzkLyDZ6KtGZyrkzV': 'Pro Monthly',
      'price_1RadHrIjzkLyDZ6Ky6HxJtI7': 'Pro Annual',
      'price_1RadJ0IjzkLyDZ6KZCZzkCFf': 'Agency Monthly',
      'price_1RadJTIjzkLyDZ6KVGIJa3XM': 'Agency Annual',
    };

    return priceMap[subscription.price_id] || 'Pro Plan';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border border-gray-700 rounded-xl p-4 ${statusInfo.bgColor}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${statusInfo.color}`} />
          <div>
            <div className="font-medium text-white">{getPlanName()}</div>
            <div className={`text-sm ${statusInfo.color}`}>{statusInfo.description}</div>
          </div>
        </div>
        
        {subscription.current_period_end && (
          <div className="text-right">
            <div className="text-xs text-gray-400">
              {subscription.cancel_at_period_end ? 'Ends' : 'Renews'}
            </div>
            <div className="text-sm text-gray-300">
              {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}