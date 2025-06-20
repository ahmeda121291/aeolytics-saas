import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface EmailRequest {
  userId: string;
  to: string;
  subject: string;
  template: 'weekly_summary' | 'citation_alert' | 'performance_report';
  data: any;
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

    const { userId, to, subject, template, data }: EmailRequest = await req.json();

    if (!userId || !to || !subject || !template) {
      throw new Error('Missing required fields');
    }

    // Generate email content based on template
    const emailContent = generateEmailContent(template, data);

    // In a real implementation, you would integrate with an email service like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Resend
    
    // For now, we'll simulate sending the email
    console.log('Sending email:', {
      to,
      subject,
      template,
      content: emailContent.substring(0, 100) + '...'
    });

    // Store email log in database
    const { error: logError } = await supabaseClient
      .from('email_logs')
      .insert({
        user_id: userId,
        to,
        subject,
        template,
        status: 'sent',
        sent_at: new Date().toISOString()
      });

    if (logError) {
      console.warn('Failed to log email:', logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Email sending error:', error);
    
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

function generateEmailContent(template: string, data: any): string {
  switch (template) {
    case 'weekly_summary':
      return `
        <h1>Weekly Citation Performance Report</h1>
        <h2>Summary for ${data.timeRange}</h2>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Key Metrics</h3>
          <ul>
            <li><strong>Visibility Score:</strong> ${data.visibilityScore}%</li>
            <li><strong>Citations Found:</strong> ${data.citedQueries}</li>
            <li><strong>Total Queries:</strong> ${data.totalQueries}</li>
            <li><strong>Top Engine:</strong> ${data.topEngine}</li>
          </ul>
        </div>
        
        <p>This week your brand visibility ${data.visibilityScore >= 50 ? 'performed well' : 'has room for improvement'} 
        with ${data.citedQueries} queries receiving citations out of ${data.totalQueries} total tracked queries.</p>
        
        <p>Your strongest performance was on ${data.topEngine}.</p>
        
        <p style="margin-top: 30px;">
          <a href="https://aeolytics.com/dashboard" style="background: #0052CC; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View Full Dashboard
          </a>
        </p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          Generated by AEOlytics - AI Citation Analytics Platform<br>
          Report generated on ${data.generatedOn}
        </p>
      `;

    case 'citation_alert':
      return `
        <h1>New Citations Found!</h1>
        <p>We found ${data.totalNew} new citations for your brand.</p>
        
        <div style="background: #f0f9ff; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #0052CC;">
          <h3>Recent Citations:</h3>
          ${data.newCitations.map((citation: any) => `
            <div style="margin: 15px 0; padding: 10px; background: white; border-radius: 4px;">
              <strong>${citation.engine}</strong> - ${citation.query?.query_text}<br>
              <span style="color: #10B981;">✓ Brand mentioned</span>
              ${citation.position ? `(${citation.position} position)` : ''}
            </div>
          `).join('')}
        </div>
        
        <p>
          <a href="https://aeolytics.com/dashboard/citations" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View All Citations
          </a>
        </p>
      `;

    case 'performance_report':
      return `
        <h1>Monthly Performance Report</h1>
        <p>Here's your monthly citation performance summary.</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0;">
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; color: #0052CC;">${data.visibilityScore}%</h3>
            <p style="margin: 5px 0; color: #666;">Visibility Score</p>
          </div>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; color: #10B981;">${data.citedQueries}</h3>
            <p style="margin: 5px 0; color: #666;">Cited Queries</p>
          </div>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; color: #00FFE0;">${data.totalDomains}</h3>
            <p style="margin: 5px 0; color: #666;">Tracked Domains</p>
          </div>
        </div>
        
        <p>Keep up the great work! Your brand presence in AI search results is ${data.visibilityScore >= 60 ? 'strong' : 'growing'}.</p>
      `;

    default:
      return '<p>Email content not available</p>';
  }
}