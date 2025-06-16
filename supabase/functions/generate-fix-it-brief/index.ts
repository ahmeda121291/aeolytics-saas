/*
  # Generate Fix-It Brief Edge Function
  
  Creates AI-powered content optimization briefs based on citation analysis.
  Generates meta descriptions, schema markup, FAQ entries, and content recommendations.
  
  ## Features
  - Citation gap analysis across AI engines
  - SEO-optimized content suggestions
  - Schema markup generation
  - FAQ entries for better AI citations
  - Meta description optimization
*/

import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface BriefRequest {
  queryId: string;
  userId: string;
  customPrompt?: string;
}

interface CitationAnalysis {
  query: string;
  totalCitations: number;
  citedEngines: string[];
  uncitedEngines: string[];
  citationGaps: string[];
  topPerformingContent: string[];
  missingKeywords: string[];
}

interface FixItBrief {
  title: string;
  metaDescription: string;
  schemaMarkup: string;
  contentBrief: string;
  faqEntries: Array<{
    question: string;
    answer: string;
    keywords: string[];
  }>;
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

    const { queryId, userId, customPrompt }: BriefRequest = await req.json();

    if (!queryId || !userId) {
      throw new Error('Missing required fields: queryId, userId');
    }

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Fetch query and citation data
    const { data: queryData, error: queryError } = await supabaseClient
      .from('queries')
      .select(`
        id,
        query_text,
        intent_tags,
        engines,
        domains:domain_id (
          domain
        ),
        citations:citations!citations_query_id_fkey (
          engine,
          cited,
          position,
          response_text,
          confidence_score
        )
      `)
      .eq('id', queryId)
      .eq('user_id', userId)
      .single();

    if (queryError || !queryData) {
      throw new Error('Query not found or access denied');
    }

    // Analyze citation performance
    const analysis = analyzeCitations(queryData);

    // Generate AI-powered brief
    const brief = await generateBrief(analysis, openaiApiKey, customPrompt);

    // Store the brief in database
    const { data: savedBrief, error: saveError } = await supabaseClient
      .from('fix_it_briefs')
      .insert({
        query_id: queryId,
        user_id: userId,
        title: brief.title,
        meta_description: brief.metaDescription,
        schema_markup: brief.schemaMarkup,
        content_brief: brief.contentBrief,
        faq_entries: brief.faqEntries,
        status: 'generated'
      })
      .select()
      .single();

    if (saveError) {
      throw saveError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        brief: savedBrief,
        analysis,
        message: 'Fix-It brief generated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Fix-It brief generation error:', error);
    
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

function analyzeCitations(queryData: any): CitationAnalysis {
  const citations = queryData.citations || [];
  const engines = ['ChatGPT', 'Perplexity', 'Gemini'];
  
  const citedEngines = [...new Set(citations.filter((c: any) => c.cited).map((c: any) => c.engine))];
  const uncitedEngines = engines.filter(engine => !citedEngines.includes(engine));
  
  // Identify citation gaps and opportunities
  const citationGaps = [];
  const topPerformingContent = [];
  
  if (uncitedEngines.length > 0) {
    citationGaps.push(`Missing from ${uncitedEngines.join(', ')}`);
  }
  
  // Find top performing responses for pattern analysis
  const topCitations = citations
    .filter((c: any) => c.cited && c.confidence_score > 0.5)
    .sort((a: any, b: any) => b.confidence_score - a.confidence_score)
    .slice(0, 2);
  
  topPerformingContent.push(...topCitations.map((c: any) => c.response_text));
  
  // Extract missing keywords (simplified)
  const missingKeywords = queryData.intent_tags || [];
  
  return {
    query: queryData.query_text,
    totalCitations: citations.length,
    citedEngines,
    uncitedEngines,
    citationGaps,
    topPerformingContent,
    missingKeywords
  };
}

async function generateBrief(analysis: CitationAnalysis, apiKey: string, customPrompt?: string): Promise<FixItBrief> {
  const domain = analysis.citedEngines.length > 0 ? 'your brand' : 'your website';
  
  const systemPrompt = `You are an expert SEO and content strategist specializing in Answer Engine Optimization (AEO). Your task is to create comprehensive content optimization briefs that help brands get cited by AI engines like ChatGPT, Perplexity, and Gemini.

Focus on:
1. Creating content that directly answers user questions
2. Using structured data and schema markup
3. Including FAQ sections that AI engines love to cite
4. Optimizing for both traditional SEO and AI search

Respond with a JSON object containing:
- title: SEO-optimized page title (max 60 chars)
- metaDescription: Compelling meta description (max 160 chars)
- schemaMarkup: JSON-LD schema markup (FAQPage or Article)
- contentBrief: Detailed content strategy (200-400 words)
- faqEntries: Array of 3-5 FAQ objects with question, answer, and keywords`;

  const userPrompt = `
Query Analysis:
- Search Query: "${analysis.query}"
- Currently cited by: ${analysis.citedEngines.join(', ') || 'None'}
- Missing from: ${analysis.uncitedEngines.join(', ') || 'None'}
- Citation gaps: ${analysis.citationGaps.join(', ') || 'General optimization needed'}

${customPrompt ? `Additional Requirements: ${customPrompt}` : ''}

Create a comprehensive Fix-It brief that will help ${domain} get cited by AI engines for this query. Focus on actionable, specific recommendations.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '';

  try {
    // Try to parse as JSON first
    const brief = JSON.parse(content);
    return {
      title: brief.title || `Optimized Content for "${analysis.query}"`,
      metaDescription: brief.metaDescription || `Learn about ${analysis.query} with comprehensive insights and expert recommendations.`,
      schemaMarkup: brief.schemaMarkup || generateDefaultSchema(analysis),
      contentBrief: brief.contentBrief || `Create comprehensive content targeting "${analysis.query}" to improve AI citations.`,
      faqEntries: brief.faqEntries || generateDefaultFAQs(analysis)
    };
  } catch (parseError) {
    // Fallback if JSON parsing fails
    console.warn('Failed to parse AI response as JSON, using fallback');
    return generateFallbackBrief(analysis, content);
  }
}

function generateDefaultSchema(analysis: CitationAnalysis): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": analysis.query,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Comprehensive answer to ${analysis.query} with detailed insights and recommendations.`
        }
      }
    ]
  }, null, 2);
}

function generateDefaultFAQs(analysis: CitationAnalysis) {
  return [
    {
      question: analysis.query,
      answer: `Detailed answer addressing ${analysis.query} with specific insights and actionable recommendations.`,
      keywords: analysis.missingKeywords.slice(0, 3)
    },
    {
      question: `What are the best practices for ${analysis.query.toLowerCase()}?`,
      answer: `Best practices include comprehensive research, expert insights, and following industry standards.`,
      keywords: ['best practices', 'expert', 'recommendations']
    }
  ];
}

function generateFallbackBrief(analysis: CitationAnalysis, aiContent: string): FixItBrief {
  return {
    title: `Complete Guide to ${analysis.query}`,
    metaDescription: `Expert insights and comprehensive information about ${analysis.query}. Get the answers you need.`,
    schemaMarkup: generateDefaultSchema(analysis),
    contentBrief: aiContent.substring(0, 500) + '...',
    faqEntries: generateDefaultFAQs(analysis)
  };
}