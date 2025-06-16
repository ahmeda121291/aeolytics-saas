import { useState } from 'react';
import { useCitations } from './useCitations';
import { useQueries } from './useQueries';
import { useDomains } from './useDomains';
import toast from 'react-hot-toast';

type ExportFormat = 'csv' | 'json' | 'xlsx';
type ExportType = 'citations' | 'queries' | 'domains' | 'all';

export function useExport() {
  const { citations } = useCitations();
  const { queries } = useQueries();
  const { domains } = useDomains();
  const [exporting, setExporting] = useState(false);

  const exportToCsv = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJson = (data: any[], filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportData = async (type: ExportType, format: ExportFormat = 'csv') => {
    try {
      setExporting(true);
      
      let data: any[] = [];
      let filename = '';

      switch (type) {
        case 'citations':
          data = citations.map(citation => ({
            id: citation.id,
            query: citation.query?.query_text || 'Unknown',
            engine: citation.engine,
            cited: citation.cited ? 'Yes' : 'No',
            position: citation.position || 'N/A',
            confidence_score: citation.confidence_score,
            response_text: citation.response_text.substring(0, 100) + '...',
            run_date: new Date(citation.run_date).toLocaleDateString(),
            created_at: new Date(citation.created_at).toLocaleDateString()
          }));
          filename = `citations-export-${new Date().toISOString().split('T')[0]}`;
          break;

        case 'queries':
          data = queries.map(query => ({
            id: query.id,
            query_text: query.query_text,
            domain: query.domain?.domain || 'All domains',
            engines: query.engines.join(', '),
            intent_tags: query.intent_tags.join(', '),
            status: query.status,
            last_run: query.last_run ? new Date(query.last_run).toLocaleDateString() : 'Never',
            created_at: new Date(query.created_at).toLocaleDateString()
          }));
          filename = `queries-export-${new Date().toISOString().split('T')[0]}`;
          break;

        case 'domains':
          data = domains.map(domain => ({
            id: domain.id,
            domain: domain.domain,
            status: domain.status,
            queries_count: domain.queries_count,
            citations_count: domain.citations_count,
            last_check: domain.last_check ? new Date(domain.last_check).toLocaleDateString() : 'Never',
            created_at: new Date(domain.created_at).toLocaleDateString()
          }));
          filename = `domains-export-${new Date().toISOString().split('T')[0]}`;
          break;

        case 'all':
          const allData = {
            citations: citations.map(c => ({
              ...c,
              query_text: c.query?.query_text || 'Unknown'
            })),
            queries,
            domains,
            exported_at: new Date().toISOString(),
            total_records: citations.length + queries.length + domains.length
          };
          data = [allData];
          filename = `aeolytics-full-export-${new Date().toISOString().split('T')[0]}`;
          break;
      }

      if (format === 'csv') {
        exportToCsv(data, filename);
      } else if (format === 'json') {
        exportToJson(data, filename);
      }

      toast.success(`Successfully exported ${data.length} records as ${format.toUpperCase()}`);
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message || 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const exportCitationReport = async () => {
    const reportData = {
      summary: {
        total_citations: citations.length,
        cited_count: citations.filter(c => c.cited).length,
        visibility_score: citations.length > 0 ? 
          Math.round((citations.filter(c => c.cited).length / citations.length) * 100) : 0,
        engines: [...new Set(citations.map(c => c.engine))],
        date_range: {
          from: citations.length > 0 ? 
            new Date(Math.min(...citations.map(c => new Date(c.run_date).getTime()))).toLocaleDateString() : 'N/A',
          to: citations.length > 0 ? 
            new Date(Math.max(...citations.map(c => new Date(c.run_date).getTime()))).toLocaleDateString() : 'N/A'
        }
      },
      citations: citations,
      generated_at: new Date().toISOString()
    };

    exportToJson([reportData], `citation-analysis-report-${new Date().toISOString().split('T')[0]}`);
  };

  return {
    exporting,
    exportData,
    exportCitationReport,
    exportToCsv,
    exportToJson
  };
}