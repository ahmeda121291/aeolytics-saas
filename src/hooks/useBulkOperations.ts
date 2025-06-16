import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface BulkOperation {
  type: 'delete' | 'update' | 'process';
  entityType: 'queries' | 'domains' | 'citations';
  entityIds: string[];
  updates?: Record<string, any>;
}

interface BulkOperationResult {
  success: boolean;
  successCount: number;
  failureCount: number;
  errors: string[];
}

export function useBulkOperations() {
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const executeBulkOperation = async (operation: BulkOperation): Promise<BulkOperationResult> => {
    try {
      setProcessing(true);
      setProgress({ current: 0, total: operation.entityIds.length });

      const result: BulkOperationResult = {
        success: true,
        successCount: 0,
        failureCount: 0,
        errors: []
      };

      const batchSize = 10; // Process in batches to avoid overwhelming the database
      
      for (let i = 0; i < operation.entityIds.length; i += batchSize) {
        const batch = operation.entityIds.slice(i, i + batchSize);
        
        try {
          let batchResult;
          
          switch (operation.type) {
            case 'delete':
              batchResult = await executeBulkDelete(operation.entityType, batch);
              break;
            case 'update':
              batchResult = await executeBulkUpdate(operation.entityType, batch, operation.updates!);
              break;
            case 'process':
              batchResult = await executeBulkProcess(batch);
              break;
            default:
              throw new Error(`Unknown operation type: ${operation.type}`);
          }

          result.successCount += batchResult.successCount;
          result.failureCount += batchResult.failureCount;
          result.errors.push(...batchResult.errors);

        } catch (error: any) {
          result.failureCount += batch.length;
          result.errors.push(`Batch ${i / batchSize + 1}: ${error.message}`);
        }

        setProgress({ current: Math.min(i + batchSize, operation.entityIds.length), total: operation.entityIds.length });
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      result.success = result.failureCount === 0;
      
      if (result.success) {
        toast.success(`Successfully ${operation.type}d ${result.successCount} items`);
      } else {
        toast.error(`Operation completed with ${result.failureCount} errors`);
      }

      return result;

    } catch (error: any) {
      console.error('Bulk operation error:', error);
      toast.error(error.message || 'Bulk operation failed');
      return {
        success: false,
        successCount: 0,
        failureCount: operation.entityIds.length,
        errors: [error.message]
      };
    } finally {
      setProcessing(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const executeBulkDelete = async (entityType: string, ids: string[]) => {
    const result = { successCount: 0, failureCount: 0, errors: [] as string[] };

    try {
      if (entityType === 'queries') {
        // Soft delete queries by setting status to 'deleted'
        const { error } = await supabase
          .from('queries')
          .update({ status: 'deleted' })
          .in('id', ids)
          .eq('user_id', user!.id);

        if (error) throw error;
        result.successCount = ids.length;
      } else if (entityType === 'domains') {
        const { error } = await supabase
          .from('domains')
          .delete()
          .in('id', ids)
          .eq('user_id', user!.id);

        if (error) throw error;
        result.successCount = ids.length;
      } else if (entityType === 'citations') {
        const { error } = await supabase
          .from('citations')
          .delete()
          .in('id', ids)
          .eq('user_id', user!.id);

        if (error) throw error;
        result.successCount = ids.length;
      }
    } catch (error: any) {
      result.failureCount = ids.length;
      result.errors.push(error.message);
    }

    return result;
  };

  const executeBulkUpdate = async (entityType: string, ids: string[], updates: Record<string, any>) => {
    const result = { successCount: 0, failureCount: 0, errors: [] as string[] };

    try {
      const { error } = await supabase
        .from(entityType)
        .update(updates)
        .in('id', ids)
        .eq('user_id', user!.id);

      if (error) throw error;
      result.successCount = ids.length;
    } catch (error: any) {
      result.failureCount = ids.length;
      result.errors.push(error.message);
    }

    return result;
  };

  const executeBulkProcess = async (queryIds: string[]) => {
    const result = { successCount: 0, failureCount: 0, errors: [] as string[] };

    try {
      const { data, error } = await supabase.functions.invoke('process-query-batch', {
        body: {
          userId: user!.id,
          queryIds,
          engines: ['ChatGPT', 'Perplexity', 'Gemini'],
          priority: 'normal'
        }
      });

      if (error) throw error;

      if (data.success) {
        result.successCount = data.processedCount || 0;
        result.failureCount = data.failedCount || 0;
      } else {
        throw new Error(data.error || 'Bulk processing failed');
      }
    } catch (error: any) {
      result.failureCount = queryIds.length;
      result.errors.push(error.message);
    }

    return result;
  };

  // Convenience methods for common operations
  const bulkDeleteQueries = (queryIds: string[]) => 
    executeBulkOperation({ type: 'delete', entityType: 'queries', entityIds: queryIds });

  const bulkUpdateQueries = (queryIds: string[], updates: Record<string, any>) =>
    executeBulkOperation({ type: 'update', entityType: 'queries', entityIds: queryIds, updates });

  const bulkProcessQueries = (queryIds: string[]) =>
    executeBulkOperation({ type: 'process', entityType: 'queries', entityIds: queryIds });

  const bulkDeleteDomains = (domainIds: string[]) =>
    executeBulkOperation({ type: 'delete', entityType: 'domains', entityIds: domainIds });

  const bulkDeleteCitations = (citationIds: string[]) =>
    executeBulkOperation({ type: 'delete', entityType: 'citations', entityIds: citationIds });

  return {
    processing,
    progress,
    executeBulkOperation,
    bulkDeleteQueries,
    bulkUpdateQueries,
    bulkProcessQueries,
    bulkDeleteDomains,
    bulkDeleteCitations
  };
}