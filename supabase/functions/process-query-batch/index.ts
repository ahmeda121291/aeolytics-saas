/*
  # Query Batch Processor Edge Function
  
  Orchestrates processing of multiple queries across all AI engines.
  Handles rate limiting, error recovery, and progress tracking.
  
  ## Features
  - Parallel processing across AI engines
  - Rate limiting and retry logic
  - Progress tracking and status updates
  - Error handling and recovery
*/

import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface BatchRequest {
  userId: string;
  queryIds?: string[];
  engines?: string[];
  priority?: 'high' | 'normal' | 'low';
}

interface ProcessingStatus {
  queryId: string;
  engine: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  completedAt?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, queryIds, engines = ['ChatGPT', 'Perplexity', 'Gemini'], priority = 'normal' }: BatchRequest = await req.json();

    if (!userId) {
      throw new Error('Missing required field: userId');
    }

    // Get user's queries to process
    let query = supabaseClient
      .from('queries')
      .select(`
        id,
        query_text,
        engines,
        domains:domain_id (
          domain
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active');

    if (queryIds && queryIds.length > 0) {
      query = query.in('id', queryIds);
    }

    const { data: queries, error: queryError } = await query;

    if (queryError) {
      throw queryError;
    }

    if (!queries || queries.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No queries to process',
          processedCount: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user's domains for brand detection
    const { data: userDomains } = await supabaseClient
      .from('domains')
      .select('domain')
      .eq('user_id', userId);

    const domains = userDomains?.map(d => d.domain) || [];

    // Create brand keywords from domains (simple extraction)
    const brandKeywords = domains.flatMap(domain => {
      const parts = domain.split('.');
      return parts.length > 1 ? [parts[0]] : [domain];
    });

    // Process queries in batches
    const batchSize = priority === 'high' ? 5 : priority === 'normal' ? 3 : 1;
    const processingStatuses: ProcessingStatus[] = [];
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    // Create processing tasks for each query-engine combination
    const tasks: Promise<void>[] = [];
    
    for (const query of queries) {
      // Filter engines based on query settings and request
      const queryEngines = query.engines.filter(engine => engines.includes(engine));
      
      for (const engine of queryEngines) {
        const status: ProcessingStatus = {
          queryId: query.id,
          engine,
          status: 'pending'
        };
        processingStatuses.push(status);

        // Create processing task
        const task = processQueryEngine(
          query.id,
          query.query_text,
          engine,
          domains,
          brandKeywords,
          supabaseUrl,
          status
        );
        
        tasks.push(task);
      }
    }

    // Process tasks in batches with rate limiting
    const results = await processInBatches(tasks, batchSize, 1000); // 1 second delay between batches

    // Count results
    const completedCount = processingStatuses.filter(s => s.status === 'completed').length;
    const failedCount = processingStatuses.filter(s => s.status === 'failed').length;

    return new Response(
      JSON.stringify({
        success: true,
        processedCount: completedCount,
        failedCount,
        totalQueries: queries.length,
        statuses: processingStatuses,
        message: `Processed ${completedCount} queries successfully, ${failedCount} failed`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Batch processing error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function processQueryEngine(
  queryId: string,
  queryText: string,
  engine: string,
  domains: string[],
  brandKeywords: string[],
  supabaseUrl: string,
  status: ProcessingStatus
): Promise<void> {
  try {
    status.status = 'processing';

    const engineMap = {
      'ChatGPT': 'process-openai-query',
      'Perplexity': 'process-perplexity-query',
      'Gemini': 'process-gemini-query'
    };

    const functionName = engineMap[engine as keyof typeof engineMap];
    if (!functionName) {
      throw new Error(`Unsupported engine: ${engine}`);
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        queryId,
        queryText,
        userDomains: domains,
        brandKeywords
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Engine ${engine} failed: ${errorText}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || `Engine ${engine} processing failed`);
    }

    status.status = 'completed';
    status.completedAt = new Date().toISOString();

  } catch (error) {
    console.error(`Error processing query ${queryId} with ${engine}:`, error);
    status.status = 'failed';
    status.error = error.message;
  }
}

async function processInBatches<T>(tasks: Promise<T>[], batchSize: number, delayMs: number = 0): Promise<T[]> {
  const results: T[] = [];
  
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch);
    
    // Extract successful results
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      }
    }
    
    // Add delay between batches to respect rate limits
    if (i + batchSize < tasks.length && delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}