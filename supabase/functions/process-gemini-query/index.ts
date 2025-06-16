/*
  # Gemini Query Processing Edge Function
  
  Processes a single query through Google's Gemini AI and detects brand citations.
  
  ## Features
  - Google Gemini API integration
  - Advanced citation detection
  - Position tracking and confidence scoring
  - Real-time web grounding (when available)
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

    // Get Gemini API key
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Query Google Gemini
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a helpful assistant. Provide comprehensive, informative answers to user questions. Include specific company names, products, and services when relevant. Here's the question: ${queryText}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 500,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      }),
    });

    if (!geminiResponse.ok) {
      const error = await geminiResponse.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!responseText) {
      throw new Error('No response from Gemini API');
    }

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
        engine: 'Gemini',
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
        engine: 'Gemini',
        queryId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Gemini processing error:', error);
    
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

  // Calculate confidence score
  const confidenceScore = cited ? Math.min(0.55 + (totalMatches * 0.2), 1.0) : 0;

  return {
    cited,
    position,
    confidenceScore,
    responseText,
    matchedKeywords: [...new Set(matchedKeywords)]
  };
}