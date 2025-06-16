import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';
import toast from 'react-hot-toast';

type Query = Database['public']['Tables']['queries']['Row'];
type QueryInsert = Database['public']['Tables']['queries']['Insert'];

interface QueryWithDomain extends Query {
  domain?: {
    id: string;
    domain: string;
  };
}

export function useQueries() {
  const { user } = useAuth();
  const [queries, setQueries] = useState<QueryWithDomain[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchQueries();
    }
  }, [user]);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('queries')
        .select(`
          *,
          domains:domain_id (
            id,
            domain
          )
        `)
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQueries(data || []);
    } catch (error) {
      console.error('Error fetching queries:', error);
      toast.error('Failed to load queries');
    } finally {
      setLoading(false);
    }
  };

  const addQuery = async (queryData: {
    query_text: string;
    domain_id?: string;
    intent_tags?: string[];
    engines?: string[];
  }) => {
    try {
      if (!user) throw new Error('User not authenticated');

      // Check plan limits
      const planLimits = { free: 50, pro: 1000, agency: 10000 };
      const currentLimit = planLimits[user.profile?.plan || 'free'];
      
      if (queries.length >= currentLimit) {
        toast.error(`Query limit reached (${currentLimit}). Upgrade your plan for more queries.`);
        return;
      }

      const newQuery: QueryInsert = {
        user_id: user.id,
        query_text: queryData.query_text,
        domain_id: queryData.domain_id || null,
        intent_tags: queryData.intent_tags || [],
        engines: queryData.engines || ['ChatGPT', 'Perplexity', 'Gemini'],
      };

      const { data, error } = await supabase
        .from('queries')
        .insert(newQuery)
        .select(`
          *,
          domains:domain_id (
            id,
            domain
          )
        `)
        .single();

      if (error) throw error;

      setQueries(prev => [data, ...prev]);
      toast.success('Query added successfully');
      
      // Update user usage
      await supabase
        .from('user_profiles')
        .update({ usage_queries: queries.length + 1 })
        .eq('id', user.id);

    } catch (error: any) {
      console.error('Error adding query:', error);
      toast.error(error.message || 'Failed to add query');
    }
  };

  const deleteQuery = async (queryId: string) => {
    try {
      const { error } = await supabase
        .from('queries')
        .update({ status: 'deleted' })
        .eq('id', queryId);

      if (error) throw error;

      setQueries(prev => prev.filter(q => q.id !== queryId));
      toast.success('Query deleted successfully');

      // Update user usage
      if (user) {
        await supabase
          .from('user_profiles')
          .update({ usage_queries: queries.length - 1 })
          .eq('id', user.id);
      }
    } catch (error: any) {
      console.error('Error deleting query:', error);
      toast.error(error.message || 'Failed to delete query');
    }
  };

  const updateQuery = async (queryId: string, updates: Partial<Query>) => {
    try {
      const { data, error } = await supabase
        .from('queries')
        .update(updates)
        .eq('id', queryId)
        .select(`
          *,
          domains:domain_id (
            id,
            domain
          )
        `)
        .single();

      if (error) throw error;

      setQueries(prev => prev.map(q => q.id === queryId ? data : q));
      toast.success('Query updated successfully');
    } catch (error: any) {
      console.error('Error updating query:', error);
      toast.error(error.message || 'Failed to update query');
    }
  };

  return {
    queries,
    loading,
    addQuery,
    deleteQuery,
    updateQuery,
    refetch: fetchQueries
  };
}