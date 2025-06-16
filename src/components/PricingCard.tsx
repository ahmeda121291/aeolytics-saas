import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, Crown, Building, ArrowRight, Sparkles } from 'lucide-react';
import { STRIPE_CONFIG, formatPrice, calculateSavings, type PlanType, type BillingInterval } from '../lib/stripe';
import { useSubscription } from '../hooks/useSubscription';

interface PricingCardProps {
  plan: PlanType;
  interval: BillingInterval;
  currentPlan?: PlanType;
  popular?: boolean;
  className?: string;
}

const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  interval,
  currentPlan,
  popular = false,
  className = ''
}) => {
  const { createCheckoutSession, processing } = useSubscription();
  const planConfig = STRIPE_CONFIG.plans[plan];
  
  const iconMap = {
    free: Zap,
    pro: Crown,
    agency: Building
  };
  
  const colorMap = {
    free: 'border-gray-600',
    pro: 'border-primary-500',
    agency: 'border-accent-500'
  };

  const buttonColorMap = {
    free: 'bg-gray-700 hover:bg-gray-600',
    pro: 'bg-primary-500 hover:bg-primary-600',
    agency: 'bg-accent-500 hover:bg-accent-600 text-dark-900'
  };

  const Icon = iconMap[plan];
  const price = planConfig.price[interval];
  const isCurrentPlan = currentPlan === plan;
  const isDowngrade = currentPlan === 'agency' && plan === 'pro';
  const isUpgrade = (currentPlan === 'free' && plan !== 'free') || 
                    (currentPlan === 'pro' && plan === 'agency');

  const savings = interval === 'annual' && plan !== 'free' 
    ? calculateSavings(planConfig.price.monthly, planConfig.price.annual)
    : null;

  const handleSelectPlan = () => {
    if (isCurrentPlan) return;
    createCheckoutSession(plan, interval);
  };

  const getButtonText = () => {
    if (processing) return 'Processing...';
    if (isCurrentPlan) return 'Current Plan';
    if (plan === 'free') return 'Downgrade to Free';
    if (isUpgrade) return 'Upgrade';
    if (isDowngrade) return 'Downgrade';
    return 'Select Plan';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-gray-800/50 rounded-2xl p-8 border-2 ${colorMap[plan]} ${
        popular ? 'scale-105 shadow-2xl shadow-primary-500/25' : ''
      } hover:scale-105 transition-all duration-300 group ${className}`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-500 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Most Popular
        </div>
      )}

      <div className="text-center mb-8">
        <Icon className="w-12 h-12 text-accent-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">{planConfig.name}</h3>
        
        <div className="mb-6">
          <div className="text-5xl font-bold text-white">
            {price === 0 ? 'Free' : formatPrice(price)}
          </div>
          {price > 0 && (
            <div className="text-gray-400 text-sm">
              per month{interval === 'annual' && ', billed annually'}
            </div>
          )}
          {savings && interval === 'annual' && (
            <div className="text-accent-500 text-sm font-medium mt-1">
              Save {savings.percentage}% (${savings.amount}/year)
            </div>
          )}
        </div>

        <motion.button
          whileHover={{ scale: isCurrentPlan ? 1 : 1.05 }}
          whileTap={{ scale: isCurrentPlan ? 1 : 0.95 }}
          onClick={handleSelectPlan}
          disabled={processing || isCurrentPlan}
          className={`w-full ${buttonColorMap[plan]} ${
            isCurrentPlan ? 'opacity-50 cursor-not-allowed' : ''
          } text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group-hover:shadow-lg`}
        >
          {processing && (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {getButtonText()}
          {!isCurrentPlan && !processing && <ArrowRight className="w-4 h-4" />}
        </motion.button>
      </div>

      <div className="space-y-4">
        <div className="text-sm font-medium text-gray-300 mb-3">What's included:</div>
        {planConfig.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-accent-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-300 text-sm">{feature}</span>
          </div>
        ))}
      </div>

      {isUpgrade && (
        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="text-green-400 text-sm font-medium">
            ✨ Recommended upgrade for your usage
          </div>
        </div>
      )}

      {plan === 'pro' && interval === 'annual' && (
        <div className="mt-4 p-3 bg-primary-500/10 border border-primary-500/30 rounded-lg">
          <div className="text-primary-400 text-xs">
            💡 Best value - save ${calculateSavings(49, 39).amount} per year
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PricingCard;