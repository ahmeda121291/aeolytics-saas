# 🚀 FINAL STRIPE SETUP - YOU'RE 99% DONE!

## ✅ **What You've Completed:**
- ✅ Pro Plan: Monthly ($49) + Annual ($39/month)  
- ✅ Agency Plan: Monthly ($199) + Annual ($159/month)
- ✅ All Price IDs collected

## 🔑 **STEP 1: Get Your API Keys (2 minutes)**

1. **In your Stripe dashboard**, click **"Developers"** in the left sidebar
2. Click **"API keys"**
3. **Copy these 2 keys:**
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - Click "Reveal" to see it

## 📡 **STEP 2: Setup Webhooks (3 minutes)**

1. **In Stripe dashboard**, click **"Webhooks"** in the left sidebar
2. Click **"+ Add endpoint"**
3. **Endpoint URL**: `https://YOUR-PROJECT-ID.supabase.co/functions/v1/stripe-webhooks`

   **🔍 To find YOUR-PROJECT-ID:**
   - Go to your Supabase dashboard
   - Look at the URL: the part after `/project/` is your project ID
   - Example: `https://supabase.com/dashboard/project/abcd1234` → use `abcd1234`

4. **Click "Select events" and choose exactly these 6:**
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `customer.created`

5. **Click "Add endpoint"**
6. **Copy the webhook secret** (starts with `whsec_`)

## ⚙️ **STEP 3: Update Your .env File**

Create/update your `.env` file with:

```bash
# Supabase (you already have these)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe API Keys (from Step 1)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Your Exact Price IDs (I got these from your dashboard!)
VITE_STRIPE_PRO_MONTHLY_PRICE_ID=price_1RadHCIjzkLyDZ6KtGZyrkzV
VITE_STRIPE_PRO_ANNUAL_PRICE_ID=price_1RadHrIjzkLyDZ6Ky6HxJtI7
VITE_STRIPE_AGENCY_MONTHLY_PRICE_ID=price_1RadJ0IjzkLyDZ6KZCZzkCFf
VITE_STRIPE_AGENCY_ANNUAL_PRICE_ID=price_1RadJTIjzkLyDZ6KVGIJa3XM
```

## 🧪 **STEP 4: Test Your Setup (2 minutes)**

1. **Save your .env file**
2. **Restart your development server** (`npm run dev`)
3. **Go to your app's pricing page**
4. **Click "Upgrade to Pro"** 
5. **Use test credit card:**
   - Card: `4242424242424242`
   - Expires: `12/25`
   - CVC: `123`
   - Name: Any name
6. **Complete checkout**
7. **Check if your user gets upgraded!**

## 🎉 **SUCCESS INDICATORS:**

After testing, you should see:
- ✅ User plan changes from "Free" to "Pro" in your dashboard
- ✅ Stripe shows a successful payment in your dashboard
- ✅ User sees upgraded features in your app

## 🚀 **GO LIVE WHEN READY:**

**For Production (Real Money):**
1. In Stripe dashboard, toggle to **"Live mode"**
2. Get your **live API keys** (`pk_live_...` and `sk_live_...`)
3. Update your `.env` with live keys
4. Test with a real credit card

## 💰 **Your Revenue Model:**

- **Free**: $0 (50 queries, 1 domain)
- **Pro**: $49/month or $39/month annual (1,000 queries, 5 domains)
- **Agency**: $199/month or $159/month annual (10,000 queries, 10 domains)

**You keep ~97% of revenue** (Stripe takes ~2.9% + 30¢ per transaction)

---

## 🆘 **Need Help?**

**Common Issues:**
- "Invalid price ID" → Double-check your .env file
- "Webhook failed" → Make sure your Supabase URL is correct
- Payment not working → Make sure you're using test keys with test cards

**You're literally 3 steps away from making money! 💰**