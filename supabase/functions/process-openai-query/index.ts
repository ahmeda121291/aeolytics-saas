/*
  # OpenAI Query Processing Edge Function
  
  Processes a single query through ChatGPT and detects brand citations.
  
  ## Features
  - GPT-4 integration with custom prompts
  - Citation detection algorithm
  - Position tracking (top/middle/bottom)
  - Confidence scoring
  - Rate limiting and error handling
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get request data
    const { queryId, queryText, userDomains, brandKeywords }: QueryRequest = await req.json();

    if (!queryId || !queryText) {
      throw new Error('Missing required fields: queryId, queryText');
    }

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Query ChatGPT
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant. Provide comprehensive, informative answers to user questions. Include specific company names, products, and services when relevant.'
          },
          {
            role: 'user',
            content: queryText
          }
        ],
        max_tokens: 500,
        temperature: 0.1,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const openaiData = await openaiResponse.json();
    const responseText = openaiData.choices[0]?.message?.content || '';

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
        engine: 'ChatGPT',
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
        engine: 'ChatGPT',
        queryId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('OpenAI processing error:', error);
    
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

  // Determine position based on where citations appear
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

  // Calculate confidence score
  const confidenceScore = cited ? Math.min(0.5 + (totalMatches * 0.2), 1.0) : 0;

  return {
    cited,
    position,
    confidenceScore,
    responseText,
    matchedKeywords: [...new Set(matchedKeywords)] // Remove duplicates
  };
}