import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCitations } from './useCitations';
import { useQueries } from './useQueries';
import { useDomains } from './useDomains';
import { generatePDFReport, generateReportPreview, calculateMetrics } from '../lib/pdfGenerator';
import toast from 'react-hot-toast';

interface ReportConfig {
  timeRange: '7d' | '30d' | '90d' | 'all';
  includeCharts: boolean;
  includeRecommendations: boolean;
  includeDetailedAnalysis: boolean;
  brandConfig?: {
    logo?: string;
    primaryColor?: string;
    companyName?: string;
    website?: string;
  };
}

export function useReports() {
  const { user } = useAuth();
  const { citations } = useCitations();
  const { queries } = useQueries();
  const { domains } = useDomains();
  
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const filterDataByTimeRange = useCallback((timeRange: string) => {
    const now = new Date();
    let cutoffDate: Date;

    switch (timeRange) {
      case '7d':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        return { citations, queries, domains };
    }

    const filteredCitations = citations.filter(
      c => new Date(c.run_date) >= cutoffDate
    );

    return {
      citations: filteredCitations,
      queries,
      domains
    };
  }, [citations, queries, domains]);

  const generateReport = async (config: ReportConfig) => {
    if (!user?.profile) {
      toast.error('User profile not found');
      return;
    }

    try {
      setGenerating(true);
      
      const timeRangeLabels = {
        '7d': 'Last 7 Days',
        '30d': 'Last 30 Days', 
        '90d': 'Last 90 Days',
        'all': 'All Time'
      };

      const filteredData = filterDataByTimeRange(config.timeRange);
      
      const reportData = {
        user: user.profile,
        ...filteredData,
        timeRange: timeRangeLabels[config.timeRange],
        brandConfig: config.brandConfig
      };

      const fileName = `${config.brandConfig?.companyName || 'AEOlytics'}-Citation-Report-${config.timeRange}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      await generatePDFReport(reportData, fileName);
      toast.success('Report generated successfully!');
      
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast.error(error.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const previewReport = async (config: ReportConfig) => {
    if (!user?.profile) {
      toast.error('User profile not found');
      return;
    }

    try {
      setGenerating(true);
      
      const timeRangeLabels = {
        '7d': 'Last 7 Days',
        '30d': 'Last 30 Days',
        '90d': 'Last 90 Days', 
        'all': 'All Time'
      };

      const filteredData = filterDataByTimeRange(config.timeRange);
      
      const reportData = {
        user: user.profile,
        ...filteredData,
        timeRange: timeRangeLabels[config.timeRange],
        brandConfig: config.brandConfig
      };

      const url = await generateReportPreview(reportData);
      setPreviewUrl(url);
      
    } catch (error: any) {
      console.error('Error generating preview:', error);
      toast.error(error.message || 'Failed to generate preview');
    } finally {
      setGenerating(false);
    }
  };

  const getReportMetrics = useCallback((timeRange: string = 'all') => {
    if (!user?.profile) return null;

    const filteredData = filterDataByTimeRange(timeRange);
    const reportData = {
      user: user.profile,
      ...filteredData,
      timeRange,
      brandConfig: undefined
    };

    return calculateMetrics(reportData);
  }, [user, filterDataByTimeRange]);

  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return {
    generating,
    previewUrl,
    generateReport,
    previewReport,
    clearPreview,
    getReportMetrics
  };
}