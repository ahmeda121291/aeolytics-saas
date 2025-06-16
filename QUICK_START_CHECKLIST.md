# ✅ QUICK START CHECKLIST - STRIPE PRODUCTION

## 🎯 Goal: Get your app making money in 30 minutes!

### Step 1: Stripe Account (5 minutes)
- [ ] Go to [stripe.com](https://stripe.com) 
- [ ] Create account with business details
- [ ] Verify email address

### Step 2: Get API Keys (2 minutes)  
- [ ] Go to Dashboard → Developers → API keys
- [ ] Copy **Publishable key** (`pk_test_...`)
- [ ] Copy **Secret key** (`sk_test_...`)

### Step 3: Create Products (10 minutes)
Go to Dashboard → Products → Add product

**Pro Plan:**
- [ ] Name: "AEOlytics Pro"
- [ ] Monthly price: $49.00
- [ ] Annual price: $39.00 (yearly billing)
- [ ] Copy both Price IDs

**Agency Plan:**  
- [ ] Name: "AEOlytics Agency"
- [ ] Monthly price: $199.00
- [ ] Annual price: $159.00 (yearly billing)
- [ ] Copy both Price IDs

### Step 4: Setup Webhooks (5 minutes)
- [ ] Go to Dashboard → Webhooks → Add endpoint
- [ ] URL: `https://YOUR-PROJECT.supabase.co/functions/v1/stripe-webhooks`
- [ ] Select these 6 events:
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted` 
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
  - [ ] `customer.created`
- [ ] Copy webhook secret (`whsec_...`)

### Step 5: Configure App (5 minutes)
- [ ] Add all keys to your `.env` file (see .env.example)
- [ ] Restart your development server

### Step 6: Test Payment (3 minutes)
- [ ] Go to your pricing page
- [ ] Click "Upgrade to Pro"
- [ ] Use test card: `4242424242424242`
- [ ] Check if upgrade works

## 🎉 YOU'RE LIVE!

**Test Cards:**
- Success: `4242424242424242`
- Declined: `4000000000000002`
- Expires: Any future date
- CVC: Any 3 digits

**When ready for production:**
- Switch to live keys in Stripe dashboard
- Update `.env` with live keys (`pk_live_...`, `sk_live_...`)

**Your Revenue Model:**
- Free: $0 (50 queries, 1 domain)
- Pro: $49/month or $39/month annual (1K queries, 5 domains)  
- Agency: $199/month or $159/month annual (10K queries, 10 domains)

**You keep ~97% of revenue** (Stripe takes ~3%)

---

Need help? Check `STRIPE_STEP_BY_STEP_SETUP.md` for detailed instructions!