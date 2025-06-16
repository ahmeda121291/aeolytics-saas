import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';

type Citation = Database['public']['Tables']['citations']['Row'];

interface CitationWithQuery extends Citation {
  query?: {
    id: string;
    query_text: string;
  };
}

export function useCitations() {
  const { user } = useAuth();
  const [citations, setCitations] = useState<CitationWithQuery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCitations();
    }
  }, [user]);

  const fetchCitations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('citations')
        .select(`
          *,
          queries:query_id (
            id,
            query_text
          )
        `)
        .eq('user_id', user!.id)
        .order('run_date', { ascending: false })
        .limit(100);

      if (error) throw error;
      setCitations(data || []);
    } catch (error) {
      console.error('Error fetching citations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVisibilityScore = () => {
    if (citations.length === 0) return 0;
    const citedCount = citations.filter(c => c.cited).length;
    return Math.round((citedCount / citations.length) * 100);
  };

  const getCitationStats = () => {
    const totalCitations = citations.length;
    const citedCount = citations.filter(c => c.cited).length;
    const uncitedCount = totalCitations - citedCount;
    
    const engineStats = citations.reduce((acc, citation) => {
      acc[citation.engine] = (acc[citation.engine] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: totalCitations,
      cited: citedCount,
      uncited: uncitedCount,
      visibilityScore: getVisibilityScore(),
      engineStats
    };
  };

  const getRecentActivity = () => {
    return citations
      .slice(0, 10)
      .map(citation => ({
        id: citation.id,
        type: citation.cited ? 'citation' : 'missing',
        message: citation.cited 
          ? `New citation found for "${citation.query?.query_text}"` 
          : `Brand missing from "${citation.query?.query_text}" query`,
        engine: citation.engine,
        time: new Date(citation.run_date).toLocaleString(),
        status: citation.cited ? 'positive' : 'negative'
      }));
  };

  return {
    citations,
    loading,
    refetch: fetchCitations,
    getVisibilityScore,
    getCitationStats,
    getRecentActivity
  };
}