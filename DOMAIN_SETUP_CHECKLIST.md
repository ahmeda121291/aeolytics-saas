# 🌐 DOMAIN SETUP CHECKLIST

## **Quick Domain Setup (30 minutes total)**

### **Step 1: Buy Domain (10 minutes)**
- [ ] Go to [Namecheap.com](https://namecheap.com) or [GoDaddy.com](https://godaddy.com)
- [ ] Search for your desired domain
- [ ] Purchase (usually $10-15/year)
- [ ] Note down your domain name

### **Step 2: Deploy App (10 minutes)**
- [ ] Go to [Vercel.com](https://vercel.com)
- [ ] Sign up with GitHub
- [ ] Import your repository
- [ ] Add environment variables from your `.env`
- [ ] Deploy

### **Step 3: Connect Domain (10 minutes)**
- [ ] In Vercel: Go to Project → Settings → Domains
- [ ] Add your custom domain
- [ ] Copy the DNS records Vercel provides
- [ ] In your domain registrar: Add those DNS records
- [ ] Wait 5-10 minutes

## **Environment Variables for Production**

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe LIVE keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Your Price IDs (same as before)
VITE_STRIPE_PRO_MONTHLY_PRICE_ID=price_1RadHCIjzkLyDZ6KtGZyrkzV
VITE_STRIPE_PRO_ANNUAL_PRICE_ID=price_1RadHrIjzkLyDZ6Ky6HxJtI7
VITE_STRIPE_AGENCY_MONTHLY_PRICE_ID=price_1RadJ0IjzkLyDZ6KZCZzkCFf
VITE_STRIPE_AGENCY_ANNUAL_PRICE_ID=price_1RadJTIjzkLyDZ6KVGIJa3XM
```

## **After Domain is Live**

### **Update Stripe Webhook:**
- [ ] Go to Stripe Dashboard → Webhooks
- [ ] Edit your webhook
- [ ] Change URL to: `https://yourdomain.com/api/stripe-webhook`
- [ ] Update webhook secret in environment variables

### **Test Production:**
- [ ] Visit your domain
- [ ] Sign up for account
- [ ] Try upgrading to Pro with real card
- [ ] Verify payment in Stripe dashboard
- [ ] Cancel subscription if testing

## **🎉 You're Live!**

Once these steps are complete, you have a **real business** that can accept payments!