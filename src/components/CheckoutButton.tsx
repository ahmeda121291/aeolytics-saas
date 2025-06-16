import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface CheckoutButtonProps {
  priceId: string;
  mode: 'payment' | 'subscription';
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export default function CheckoutButton({ 
  priceId, 
  mode, 
  children, 
  className = '',
  disabled = false 
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (disabled || loading) return;

    try {
      setLoading(true);

      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast.error('Please sign in to continue');
        return;
      }

      const successUrl = `${window.location.origin}/dashboard?checkout=success`;
      const cancelUrl = `${window.location.origin}/dashboard?checkout=canceled`;

      // Call the checkout edge function
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          price_id: priceId,
          mode,
          success_url: successUrl,
          cancel_url: cancelUrl,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Checkout error:', error);
        toast.error(error.message || 'Failed to start checkout');
        return;
      }

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      onClick={handleCheckout}
      disabled={disabled || loading}
      className={`
        relative overflow-hidden transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          {children}
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </motion.button>
  );
}