import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';
import toast from 'react-hot-toast';

type Domain = Database['public']['Tables']['domains']['Row'];
type DomainInsert = Database['public']['Tables']['domains']['Insert'];

export function useDomains() {
  const { user } = useAuth();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDomains();
    }
  }, [user]);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('domains')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDomains(data || []);
    } catch (error) {
      console.error('Error fetching domains:', error);
      toast.error('Failed to load domains');
    } finally {
      setLoading(false);
    }
  };

  const addDomain = async (domain: string) => {
    try {
      if (!user) throw new Error('User not authenticated');

      // Check if domain already exists
      const existingDomain = domains.find(d => d.domain === domain);
      if (existingDomain) {
        toast.error('Domain already exists');
        return;
      }

      // Check plan limits
      const planLimits = { free: 1, pro: 5, agency: 10 };
      const currentLimit = planLimits[user.profile?.plan || 'free'];
      
      if (domains.length >= currentLimit) {
        toast.error(`Domain limit reached (${currentLimit}). Upgrade your plan for more domains.`);
        return;
      }

      const newDomain: DomainInsert = {
        user_id: user.id,
        domain: domain.replace(/^https?:\/\//, '').replace(/\/$/, ''),
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('domains')
        .insert(newDomain)
        .select()
        .single();

      if (error) throw error;

      setDomains(prev => [data, ...prev]);
      toast.success('Domain added successfully');
      
      // Update user usage
      await supabase
        .from('user_profiles')
        .update({ usage_domains: domains.length + 1 })
        .eq('id', user.id);

    } catch (error: any) {
      console.error('Error adding domain:', error);
      toast.error(error.message || 'Failed to add domain');
    }
  };

  const deleteDomain = async (domainId: string) => {
    try {
      const { error } = await supabase
        .from('domains')
        .delete()
        .eq('id', domainId);

      if (error) throw error;

      setDomains(prev => prev.filter(d => d.id !== domainId));
      toast.success('Domain deleted successfully');

      // Update user usage
      if (user) {
        await supabase
          .from('user_profiles')
          .update({ usage_domains: domains.length - 1 })
          .eq('id', user.id);
      }
    } catch (error: any) {
      console.error('Error deleting domain:', error);
      toast.error(error.message || 'Failed to delete domain');
    }
  };

  const updateDomain = async (domainId: string, updates: Partial<Domain>) => {
    try {
      const { data, error } = await supabase
        .from('domains')
        .update(updates)
        .eq('id', domainId)
        .select()
        .single();

      if (error) throw error;

      setDomains(prev => prev.map(d => d.id === domainId ? data : d));
      toast.success('Domain updated successfully');
    } catch (error: any) {
      console.error('Error updating domain:', error);
      toast.error(error.message || 'Failed to update domain');
    }
  };

  return {
    domains,
    loading,
    addDomain,
    deleteDomain,
    updateDomain,
    refetch: fetchDomains
  };
}