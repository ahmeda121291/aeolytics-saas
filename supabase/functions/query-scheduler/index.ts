/*
  # Query Scheduler Edge Function
  
  Handles scheduled processing of queries for all users.
  Runs daily/weekly citation checks and manages user quotas.
  
  ## Features
  - Automated daily/weekly query processing
  - User plan quota management
  - Priority-based processing
  - Health monitoring and reporting
*/

import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface SchedulerRequest {
  type: 'daily' | 'weekly' | 'manual';
  userIds?: string[];
  priority?: 'high' | 'normal' | 'low';
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

    const { type = 'daily', userIds, priority = 'normal' }: SchedulerRequest = await req.json();

    console.log(`Starting ${type} query processing with priority: ${priority}`);

    // Get users to process
    let userQuery = supabaseClient
      .from('user_profiles')
      .select(`
        id,
        plan,
        usage_queries,
        queries:queries!queries_user_id_fkey (
          id,
          query_text,
          last_run,
          engines,
          status
        )
      `)
      .eq('queries.status', 'active');

    if (userIds && userIds.length > 0) {
      userQuery = userQuery.in('id', userIds);
    }

    const { data: users, error: userError } = await userQuery;

    if (userError) {
      throw userError;
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No users to process',
          processedUsers: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const processingSummary = {
      totalUsers: users.length,
      processedUsers: 0,
      skippedUsers: 0,
      totalQueries: 0,
      processedQueries: 0,
      errors: [] as string[]
    };

    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    // Process each user
    for (const user of users) {
      try {
        // Check user quota
        const planLimits = {
          free: { queries: 50, dailyRuns: 5 },
          pro: { queries: 1000, dailyRuns: 50 },
          agency: { queries: 10000, dailyRuns: 200 }
        };

        const userPlan = user.plan || 'free';
        const limits = planLimits[userPlan];

        // Get queries that need processing
        const queriesToProcess = user.queries?.filter(query => {
          if (query.status !== 'active') return false;

          const lastRun = query.last_run ? new Date(query.last_run) : null;
          const now = new Date();
          const hoursSinceLastRun = lastRun 
            ? (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60)
            : Infinity;

          // Process based on schedule type
          if (type === 'daily') {
            return hoursSinceLastRun >= 24;
          } else if (type === 'weekly') {
            return hoursSinceLastRun >= (24 * 7);
          } else {
            return true; // Manual processing
          }
        }) || [];

        if (queriesToProcess.length === 0) {
          processingSummary.skippedUsers++;
          continue;
        }

        // Limit queries based on plan
        const limitedQueries = queriesToProcess.slice(0, limits.dailyRuns);
        processingSummary.totalQueries += limitedQueries.length;

        // Determine processing priority based on plan
        const processingPriority = userPlan === 'agency' ? 'high' : 
                                  userPlan === 'pro' ? 'normal' : 'low';

        // Process user's queries
        const batchResponse = await fetch(`${supabaseUrl}/functions/v1/process-query-batch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({
            userId: user.id,
            queryIds: limitedQueries.map(q => q.id),
            priority: processingPriority
          })
        });

        if (batchResponse.ok) {
          const batchResult = await batchResponse.json();
          processingSummary.processedUsers++;
          processingSummary.processedQueries += batchResult.processedCount || 0;
          
          console.log(`Processed ${batchResult.processedCount} queries for user ${user.id}`);
        } else {
          const errorText = await batchResponse.text();
          processingSummary.errors.push(`User ${user.id}: ${errorText}`);
        }

        // Update user's usage tracking
        await supabaseClient
          .from('user_profiles')
          .update({
            usage_queries: (user.usage_queries || 0) + limitedQueries.length
          })
          .eq('id', user.id);

        // Small delay between users to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
        processingSummary.errors.push(`User ${user.id}: ${error.message}`);
      }
    }

    console.log('Scheduler processing completed:', processingSummary);

    return new Response(
      JSON.stringify({
        success: true,
        type,
        summary: processingSummary,
        message: `Processed ${processingSummary.processedUsers} users and ${processingSummary.processedQueries} queries`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Scheduler error:', error);
    
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