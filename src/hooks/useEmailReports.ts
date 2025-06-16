import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCitations } from './useCitations';
import { useQueries } from './useQueries';
import { useDomains } from './useDomains';
import toast from 'react-hot-toast';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  template: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
}

interface EmailReport {
  to: string;
  subject: string;
  template: 'weekly_summary' | 'citation_alert' | 'performance_report';
  data: any;
}

export function useEmailReports() {
  const { user } = useAuth();
  const { getCitationStats } = useCitations();
  const { queries } = useQueries();
  const { domains } = useDomains();
  const [sending, setSending] = useState(false);

  const generateWeeklySummary = () => {
    const stats = getCitationStats();
    const currentDate = new Date().toLocaleDateString();
    
    return {
      subject: `AEOlytics Weekly Report - ${currentDate}`,
      data: {
        visibilityScore: stats.visibilityScore,
        totalCitations: stats.total,
        citedQueries: stats.cited,
        uncitedQueries: stats.uncited,
        topEngine: Object.entries(stats.engineStats).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A',
        totalQueries: queries.length,
        totalDomains: domains.length,
        timeRange: 'Last 7 days',
        generatedOn: currentDate
      }
    };
  };

  const generateCitationAlert = (newCitations: any[]) => {
    return {
      subject: `New AI Citations Found - ${newCitations.length} updates`,
      data: {
        newCitations: newCitations.slice(0, 5),
        totalNew: newCitations.length,
        generatedOn: new Date().toLocaleDateString()
      }
    };
  };

  const sendEmailReport = async (report: EmailReport) => {
    try {
      setSending(true);
      
      const { data, error } = await supabase.functions.invoke('send-email-report', {
        body: {
          userId: user!.id,
          to: report.to,
          subject: report.subject,
          template: report.template,
          data: report.data
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Email report sent successfully!');
      } else {
        throw new Error(data.error || 'Failed to send email');
      }
    } catch (error: any) {
      console.error('Error sending email report:', error);
      toast.error(error.message || 'Failed to send email report');
    } finally {
      setSending(false);
    }
  };

  const sendWeeklySummary = async (email: string) => {
    const summary = generateWeeklySummary();
    await sendEmailReport({
      to: email,
      subject: summary.subject,
      template: 'weekly_summary',
      data: summary.data
    });
  };

  const sendCitationAlert = async (email: string, citations: any[]) => {
    const alert = generateCitationAlert(citations);
    await sendEmailReport({
      to: email,
      subject: alert.subject,
      template: 'citation_alert',
      data: alert.data
    });
  };

  const setupEmailNotifications = async (settings: {
    email: string;
    weeklyReports: boolean;
    citationAlerts: boolean;
    performanceReports: boolean;
  }) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          email_notifications: settings
        } as any)
        .eq('id', user!.id);

      if (error) throw error;
      toast.success('Email notification settings updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update settings');
    }
  };

  return {
    sending,
    sendWeeklySummary,
    sendCitationAlert,
    setupEmailNotifications,
    generateWeeklySummary,
    generateCitationAlert
  };
}