# 🎉 Stripe Activation Checklist

Your AEOlytics platform has **complete Stripe integration** already built! Follow this checklist to activate payments:

## ✅ **Step 1: Create Stripe Account**
1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete business verification (for live payments)
3. Get your API keys from the Dashboard

## ✅ **Step 2: Environment Variables**
Add these to your `.env` file:

```bash
# From Stripe Dashboard > Developers > API keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_SECRET_KEY=sk_test_51...

# You'll get this after setting up webhooks (Step 4)
STRIPE_WEBHOOK_SECRET=whsec_1...
```

## ✅ **Step 3: Create Products & Prices**
In your [Stripe Dashboard](https://dashboard.stripe.com/products), create:

### **Pro Plan**
- **Product Name**: "AEOlytics Pro"
- **Monthly Price**: $49.00 USD (recurring monthly)
- **Annual Price**: $39.00 USD (recurring yearly, billed as $468/year)

### **Agency Plan** 
- **Product Name**: "AEOlytics Agency"
- **Monthly Price**: $199.00 USD (recurring monthly)
- **Annual Price**: $159.00 USD (recurring yearly, billed as $1,908/year)

**Copy the Price IDs** and add them to your `.env`:
```bash
VITE_STRIPE_PRO_MONTHLY_PRICE_ID=price_1234...
VITE_STRIPE_PRO_ANNUAL_PRICE_ID=price_5678...
VITE_STRIPE_AGENCY_MONTHLY_PRICE_ID=price_9012...
VITE_STRIPE_AGENCY_ANNUAL_PRICE_ID=price_3456...
```

## ✅ **Step 4: Configure Webhooks**
1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. **Endpoint URL**: `https://your-project.supabase.co/functions/v1/stripe-webhooks`
4. **Events to send**:
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `customer.created`

5. **Copy the webhook secret** and add to `.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_1234...
   ```

## ✅ **Step 5: Test Integration**
1. Use Stripe test cards:
   - **Success**: `4242424242424242`
   - **Declined**: `4000000000000002`
   - **3D Secure**: `4000002760003184`

2. Test the flow:
   - Go to your pricing page
   - Click "Upgrade to Pro"
   - Complete checkout with test card
   - Verify user gets upgraded in dashboard

## 🎯 **Built-in Features Ready to Use**

### **💳 Subscription Management**
- ✅ Stripe Checkout integration
- ✅ Plan upgrades/downgrades
- ✅ Automatic renewals
- ✅ 14-day free trials
- ✅ Prorated billing

### **📊 Billing Dashboard**
- ✅ Current plan display
- ✅ Usage tracking
- ✅ Payment history
- ✅ Billing portal access
- ✅ Subscription cancellation

### **🔒 Access Control**
- ✅ Plan-based feature restrictions
- ✅ Usage quotas enforcement
- ✅ Automatic downgrades on cancellation

### **⚡ Webhook Processing**
- ✅ Real-time subscription updates
- ✅ Payment success/failure handling
- ✅ Automatic user plan synchronization

## 🚀 **Go Live Process**

### **For Testing (Recommended First)**
1. Use test API keys (`pk_test_...` and `sk_test_...`)
2. Test all subscription flows
3. Verify webhook processing

### **For Production**
1. Switch to live API keys (`pk_live_...` and `sk_live_...`)
2. Update webhook endpoint to production URL
3. Test with real payment methods

## 💰 **Revenue Model**

Your platform is ready to generate revenue with:

- **Free Plan**: 50 queries/month, 1 domain
- **Pro Plan**: $49/month ($39 annual) - 1,000 queries, 5 domains
- **Agency Plan**: $199/month ($159 annual) - 10,000 queries, 10 domains

**Annual plans save 20%** and you keep 97% of revenue (Stripe takes ~3%)

## 🎉 **You're Ready!**

Your AEOlytics platform has **enterprise-grade payment processing** built-in. Just add your Stripe credentials and you can start accepting payments immediately!

**Questions?** Check the [Stripe Documentation](https://stripe.com/docs) or contact Stripe support.