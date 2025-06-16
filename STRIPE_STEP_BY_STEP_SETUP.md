# 🚀 Stripe Setup for 5-Year-Olds (Production Ready)

## Step 1: Create Your Stripe Account 👶

### What to do:
1. Go to **[stripe.com](https://stripe.com)**
2. Click the big **"Start now"** button
3. Fill out the form with your business info
4. Verify your email address
5. Add your bank account (where you want money to go)

### Why: 
This is like opening a lemonade stand - you need a place for customers to pay you!

---

## Step 2: Get Your Magic Keys 🔑

### What to do:
1. After logging into Stripe, look for **"Developers"** in the left menu
2. Click **"API keys"**
3. You'll see two keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

### Important: 
- **Test keys** = Play money (for testing)
- **Live keys** = Real money (for production)

Start with **test keys** first!

---

## Step 3: Create Your Products (The Fun Part!) 💰

### What to do:
1. In Stripe dashboard, click **"Products"** in the left menu
2. Click **"+ Add product"**

### Create Product #1: AEOlytics Pro
```
Product name: AEOlytics Pro
Description: Professional AI citation tracking

Pricing:
✅ Recurring
✅ Monthly: $49.00 USD
✅ Add another price: Yearly $468.00 USD (saves $120/year!)
```

### Create Product #2: AEOlytics Agency  
```
Product name: AEOlytics Agency  
Description: Enterprise AI citation analytics

Pricing:
✅ Recurring
✅ Monthly: $199.00 USD
✅ Add another price: Yearly $1908.00 USD (saves $480/year!)
```

### Super Important: 
After creating each price, **copy the Price ID** (looks like `price_1abc123...`)

---

## Step 4: Setup Webhooks (Tell Your App When Money Comes In) 📡

### What to do:
1. In Stripe dashboard, click **"Webhooks"** in the left menu  
2. Click **"+ Add endpoint"**
3. For **Endpoint URL**, enter:
   ```
   https://YOUR-PROJECT-ID.supabase.co/functions/v1/stripe-webhooks
   ```
   
   **How to find YOUR-PROJECT-ID:**
   - Go to your Supabase dashboard
   - Look at the URL: `https://supabase.com/dashboard/project/YOUR-PROJECT-ID`
   - Copy that ID part

### Events to Listen For:
Click **"Select events"** and choose these 6 events:
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated` 
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`
- ✅ `customer.created`

### After Creating:
**Copy the webhook secret** (starts with `whsec_...`)

---

## Step 5: Add Your Keys to Your App 🔧

### What to do:
1. Open your `.env` file (or create one)
2. Add these lines with YOUR actual keys:

```bash
# Stripe API Keys (from Step 2)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_HERE  
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Price IDs (from Step 3)
VITE_STRIPE_PRO_MONTHLY_PRICE_ID=price_YOUR_PRO_MONTHLY_ID
VITE_STRIPE_PRO_ANNUAL_PRICE_ID=price_YOUR_PRO_ANNUAL_ID
VITE_STRIPE_AGENCY_MONTHLY_PRICE_ID=price_YOUR_AGENCY_MONTHLY_ID  
VITE_STRIPE_AGENCY_ANNUAL_PRICE_ID=price_YOUR_AGENCY_ANNUAL_ID
```

---

## Step 6: Test Everything! 🧪

### Test Credit Cards (Fake Money):
- **Success**: `4242424242424242`
- **Declined**: `4000000000000002`
- **Expires**: Any future date (like `12/25`)
- **CVC**: Any 3 numbers (like `123`)

### What to test:
1. Go to your pricing page
2. Click "Upgrade to Pro"  
3. Use the test credit card above
4. Check if user gets upgraded in your dashboard

---

## Step 7: Go Live! 🎉

### When you're ready for real money:
1. In Stripe, toggle from **"Test mode"** to **"Live mode"**
2. Copy your **live keys** (start with `pk_live_` and `sk_live_`)
3. Update your `.env` file with live keys
4. Update your webhook to use live endpoint

### That's it! You're making money! 💰

---

## 🆘 What If Something Breaks?

### Common Issues:
1. **"Invalid price ID"** → Double-check your price IDs in `.env`
2. **"Webhook failed"** → Make sure your Supabase URL is correct
3. **"Payment declined"** → Use test cards first, real cards for live mode

### Getting Help:
- Check Stripe dashboard for errors
- Look at Supabase functions logs
- Stripe has amazing support chat

---

## 🎯 Your Money Machine is Ready!

You now have:
- ✅ Professional subscription billing
- ✅ Automatic plan upgrades/downgrades  
- ✅ Free trial handling
- ✅ Payment failure recovery
- ✅ Customer billing portal

**Start with test mode, then flip to live when ready!**