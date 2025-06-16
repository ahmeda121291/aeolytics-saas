import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export interface QueryProcessingStatus {
  queryId: string;
  engine: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export function useQueryProcessor() {
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [statuses, setStatuses] = useState<QueryProcessingStatus[]>([]);

  const processQueries = async (queryIds?: string[], engines?: string[]) => {
    if (!user) {
      toast.error('Please log in to process queries');
      return;
    }

    try {
      setProcessing(true);
      setStatuses([]);

      const { data, error } = await supabase.functions.invoke('process-query-batch', {
        body: {
          userId: user.id,
          queryIds,
          engines,
          priority: 'normal'
        }
      });

      if (error) {
        throw error;
      }

      setStatuses(data.statuses || []);
      
      if (data.success) {
        toast.success(`Processed ${data.processedCount} queries successfully`);
        if (data.failedCount > 0) {
          toast.error(`${data.failedCount} queries failed to process`);
        }
      } else {
        toast.error(data.error || 'Failed to process queries');
      }

      return data;
    } catch (error: any) {
      console.error('Query processing error:', error);
      toast.error(error.message || 'Failed to process queries');
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  const processSingleQuery = async (queryId: string, engines?: string[]) => {
    return processQueries([queryId], engines);
  };

  const processAllQueries = async (engines?: string[]) => {
    return processQueries(undefined, engines);
  };

  return {
    processing,
    statuses,
    processQueries,
    processSingleQuery,
    processAllQueries
  };
}