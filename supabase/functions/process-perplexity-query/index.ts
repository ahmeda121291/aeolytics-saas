/*
  # Perplexity Query Processing Edge Function
  
  Processes a single query through Perplexity AI and detects brand citations.
  
  ## Features
  - Perplexity API integration
  - Real-time web search results
  - Citation detection with source tracking
  - Position and confidence scoring
*/

import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface QueryRequest {
  queryId: string;
  queryText: string;
  userDomains: string[];
  brandKeywords: string[];
}

interface CitationResult {
  cited: boolean;
  position: 'top' | 'middle' | 'bottom' | null;
  confidenceScore: number;
  responseText: string;
  matchedKeywords: string[];
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

    const { queryId, queryText, userDomains, brandKeywords }: QueryRequest = await req.json();

    if (!queryId || !queryText) {
      throw new Error('Missing required fields: queryId, queryText');
    }

    // Get Perplexity API key
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityApiKey) {
      throw new Error('Perplexity API key not configured');
    }

    // Query Perplexity AI
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant. Provide comprehensive answers with specific company names, products, and recommendations when relevant. Include current information and cite sources when possible.'
          },
          {
            role: 'user',
            content: queryText
          }
        ],
        max_tokens: 500,
        temperature: 0.2,
        search_domain_filter: [], // Allow all domains for comprehensive results
        return_citations: true,
        search_recency_filter: 'month'
      }),
    });

    if (!perplexityResponse.ok) {
      const error = await perplexityResponse.text();
      throw new Error(`Perplexity API error: ${error}`);
    }

    const perplexityData = await perplexityResponse.json();
    const responseText = perplexityData.choices[0]?.message?.content || '';

    // Detect citations
    const citationResult = detectCitations(responseText, userDomains, brandKeywords);

    // Get user ID from query
    const { data: queryData } = await supabaseClient
      .from('queries')
      .select('user_id')
      .eq('id', queryId)
      .single();

    if (!queryData) {
      throw new Error('Query not found');
    }

    // Store citation result
    const { error: insertError } = await supabaseClient
      .from('citations')
      .insert({
        query_id: queryId,
        user_id: queryData.user_id,
        engine: 'Perplexity',
        response_text: responseText,
        cited: citationResult.cited,
        position: citationResult.position,
        confidence_score: citationResult.confidenceScore,
        run_date: new Date().toISOString(),
      });

    if (insertError) {
      throw insertError;
    }

    // Update query last_run timestamp
    await supabaseClient
      .from('queries')
      .update({ last_run: new Date().toISOString() })
      .eq('id', queryId);

    return new Response(
      JSON.stringify({
        success: true,
        citation: citationResult,
        engine: 'Perplexity',
        queryId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Perplexity processing error:', error);
    
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

function detectCitations(responseText: string, userDomains: string[], brandKeywords: string[]): CitationResult {
  const text = responseText.toLowerCase();
  const matchedKeywords: string[] = [];
  let totalMatches = 0;
  let cited = false;

  // Check for domain mentions
  for (const domain of userDomains) {
    const domainRegex = new RegExp(domain.replace('.', '\\.'), 'gi');
    const matches = text.match(domainRegex);
    if (matches) {
      matchedKeywords.push(domain);
      totalMatches += matches.length;
      cited = true;
    }
  }

  // Check for brand keyword mentions
  for (const keyword of brandKeywords) {
    const keywordRegex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'gi');
    const matches = text.match(keywordRegex);
    if (matches) {
      matchedKeywords.push(keyword);
      totalMatches += matches.length;
      cited = true;
    }
  }

  // Determine position
  let position: 'top' | 'middle' | 'bottom' | null = null;
  
  if (cited) {
    const textLength = responseText.length;
    const firstMention = Math.min(
      ...matchedKeywords.map(keyword => 
        text.indexOf(keyword.toLowerCase())
      ).filter(index => index !== -1)
    );

    if (firstMention < textLength * 0.33) {
      position = 'top';
    } else if (firstMention < textLength * 0.66) {
      position = 'middle';
    } else {
      position = 'bottom';
    }
  }

  // Calculate confidence score (Perplexity tends to be more accurate)
  const confidenceScore = cited ? Math.min(0.6 + (totalMatches * 0.2), 1.0) : 0;

  return {
    cited,
    position,
    confidenceScore,
    responseText,
    matchedKeywords: [...new Set(matchedKeywords)]
  };
}