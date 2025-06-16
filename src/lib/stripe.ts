import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found. Payment features will be disabled.');
}

export const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

// Stripe configuration - PRODUCTION READY
export const STRIPE_CONFIG = {
  prices: {
    pro_monthly: import.meta.env.VITE_STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
    pro_annual: import.meta.env.VITE_STRIPE_PRO_ANNUAL_PRICE_ID || 'price_pro_annual',
    agency_monthly: import.meta.env.VITE_STRIPE_AGENCY_MONTHLY_PRICE_ID || 'price_agency_monthly',
    agency_annual: import.meta.env.VITE_STRIPE_AGENCY_ANNUAL_PRICE_ID || 'price_agency_annual',
  },
  plans: {
    free: {
      name: 'Free',
      price: { monthly: 0, annual: 0 },
      features: [
        '50 queries/month', 
        '1 domain tracking', 
        'Basic dashboard', 
        'ChatGPT tracking only',
        'Email support'
      ],
      limits: { queries: 50, domains: 1 }
    },
    pro: {
      name: 'Pro',
      price: { monthly: 49, annual: 39 }, // $39/month when billed annually
      features: [
        '1,000 queries/month', 
        '5 domains tracking', 
        'All AI engines (ChatGPT, Perplexity, Gemini)', 
        'Advanced analytics & trends',
        'Fix-It briefs generation',
        'Slack/Notion integrations',
        'Weekly email reports',
        'Priority support'
      ],
      limits: { queries: 1000, domains: 5 },
      stripeIds: {
        monthly: import.meta.env.VITE_STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
        annual: import.meta.env.VITE_STRIPE_PRO_ANNUAL_PRICE_ID || 'price_pro_annual'
      }
    },
    agency: {
      name: 'Agency',
      price: { monthly: 199, annual: 159 }, // $159/month when billed annually
      features: [
        '10,000 queries/month', 
        '10 domains tracking', 
        'All AI engines + early access',
        'White-label PDF reports',
        'Unlimited Fix-It briefs',
        'API access',
        'Team collaboration',
        'Dedicated account manager',
        'Custom integrations'
      ],
      limits: { queries: 10000, domains: 10 },
      stripeIds: {
        monthly: import.meta.env.VITE_STRIPE_AGENCY_MONTHLY_PRICE_ID || 'price_agency_monthly',
        annual: import.meta.env.VITE_STRIPE_AGENCY_ANNUAL_PRICE_ID || 'price_agency_annual'
      }
    }
  }
} as const;

export type PlanType = keyof typeof STRIPE_CONFIG.plans;
export type BillingInterval = 'monthly' | 'annual';

// Utility functions
export function getPlanConfig(plan: PlanType) {
  return STRIPE_CONFIG.plans[plan];
}

export function getStripePrice(plan: PlanType, interval: BillingInterval) {
  if (plan === 'free') return null;
  const planConfig = getPlanConfig(plan);
  return planConfig.stripeIds?.[interval] || null;
}

export function formatPrice(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function calculateSavings(monthlyPrice: number, annualPrice: number) {
  const yearlyMonthly = monthlyPrice * 12;
  const yearlyAnnual = annualPrice * 12;
  const savings = yearlyMonthly - yearlyAnnual;
  const percentage = Math.round((savings / yearlyMonthly) * 100);
  return { amount: savings, percentage };
}

// Production ready helper functions
export function getCheckoutSuccessUrl() {
  return `${window.location.origin}/dashboard?checkout=success`;
}

export function getCheckoutCancelUrl() {
  return `${window.location.origin}/dashboard?checkout=canceled`;
}

export function getPlanSavings(plan: PlanType) {
  if (plan === 'free') return null;
  const config = getPlanConfig(plan);
  return calculateSavings(config.price.monthly, config.price.annual);
}