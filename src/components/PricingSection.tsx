import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, Crown, Building } from 'lucide-react';
import CheckoutButton from './CheckoutButton';
import { useAuth } from '../contexts/AuthContext';

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const { user } = useAuth();

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
      color: 'border-gray-600',
      buttonColor: 'bg-gray-700 hover:bg-gray-600',
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
        'All AI engines (ChatGPT, Perplexity, Gemini)',
        'Advanced analytics & trends',
        'Fix-It briefs generation',
        'Weekly email reports',
        'Priority support'
      ],
      color: 'border-primary-500',
      buttonColor: 'bg-primary-500 hover:bg-primary-600',
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
        'All AI engines + early access',
        'Advanced analytics & trends',
        'White-label PDF reports',
        'Unlimited Fix-It briefs',
        'Team collaboration',
        'Dedicated account manager'
      ],
      color: 'border-accent-500',
      buttonColor: 'bg-accent-500 hover:bg-accent-600 text-dark-900',
      priceId: {
        monthly: 'price_1RadJ0IjzkLyDZ6KZCZzkCFf',
        annual: 'price_1RadJTIjzkLyDZ6KVGIJa3XM'
      }
    }
  ];

  const calculateSavings = (monthly: number, annual: number) => {
    const yearlyMonthly = monthly * 12;
    const yearlyAnnual = annual * 12;
    const savings = yearlyMonthly - yearlyAnnual;
    const percentage = Math.round((savings / yearlyMonthly) * 100);
    return { amount: savings, percentage };
  };

  return (
    <section id="pricing" className="py-20 px-4 bg-gradient-to-b from-gray-900 to-dark-900">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Start free, scale as you grow. No hidden fees, no surprises.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`font-medium ${!isAnnual ? 'text-white' : 'text-gray-400'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative w-16 h-8 rounded-full transition-colors ${
                  isAnnual ? 'bg-primary-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    isAnnual ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`font-medium ${isAnnual ? 'text-white' : 'text-gray-400'}`}>
                Annual
                <span className="ml-2 text-xs bg-accent-500 text-dark-900 px-2 py-1 rounded-full font-bold">
                  Save 20%
                </span>
              </span>
            </div>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const price = plan.price[isAnnual ? 'annual' : 'monthly'];
            const savings = isAnnual && plan.price.monthly > 0 
              ? calculateSavings(plan.price.monthly, plan.price.annual)
              : null;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative bg-gray-800/50 rounded-2xl p-8 border-2 ${plan.color} ${
                  plan.popular ? 'scale-105 shadow-2xl shadow-primary-500/25' : ''
                } hover:scale-105 transition-all duration-300 group`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-500 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-8">
                  <Icon className="w-12 h-12 text-accent-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  
                  <div className="mb-6">
                    <div className="text-5xl font-bold text-white">
                      {price === 0 ? 'Free' : `$${price}`}
                    </div>
                    {price > 0 && (
                      <div className="text-gray-400 text-sm">
                        per month{isAnnual && ', billed annually'}
                      </div>
                    )}
                    {savings && isAnnual && (
                      <div className="text-accent-500 text-sm font-medium mt-1">
                        Save {savings.percentage}% (${savings.amount}/year)
                      </div>
                    )}
                  </div>

                  {plan.priceId ? (
                    <CheckoutButton
                      priceId={plan.priceId[isAnnual ? 'annual' : 'monthly']}
                      mode="subscription"
                      className={`w-full ${plan.buttonColor} text-white font-semibold py-3 px-6 rounded-xl transition-all group-hover:shadow-lg`}
                      disabled={!user}
                    >
                      {!user ? 'Sign up to continue' : `Choose ${plan.name}`}
                    </CheckoutButton>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-600 text-gray-400 font-semibold py-3 px-6 rounded-xl cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="text-sm font-medium text-gray-300 mb-3">What's included:</div>
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-accent-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.id === 'pro' && isAnnual && (
                  <div className="mt-4 p-3 bg-primary-500/10 border border-primary-500/30 rounded-lg">
                    <div className="text-primary-400 text-xs">
                      💡 Best value - save ${calculateSavings(49, 39).amount} per year
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Enterprise CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-400 mb-4">
            Need something custom? Enterprise plans start at $500/month.
          </p>
          <button className="text-accent-500 hover:text-accent-400 font-medium underline">
            Contact Sales
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;