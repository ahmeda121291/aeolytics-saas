import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, pdf, Image } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import type { Database } from './database.types';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type Citation = Database['public']['Tables']['citations']['Row'];
type Query = Database['public']['Tables']['queries']['Row'];
type Domain = Database['public']['Tables']['domains']['Row'];

interface ReportData {
  user: UserProfile;
  citations: Citation[];
  queries: Query[];
  domains: Domain[];
  timeRange: string;
  brandConfig?: {
    logo?: string;
    primaryColor?: string;
    companyName?: string;
    website?: string;
  };
}

interface ReportMetrics {
  visibilityScore: number;
  totalCitations: number;
  citedQueries: number;
  topEngines: Array<{ name: string; percentage: number; citations: number }>;
  improvements: string[];
  recommendations: string[];
  trends: Array<{ date: string; score: number }>;
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  logo: {
    width: 120,
    height: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  executiveSummary: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 8,
    marginBottom: 25,
  },
  metric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  metricValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  recommendation: {
    marginBottom: 8,
    paddingLeft: 12,
  },
  recommendationText: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 15,
  },
  footerText: {
    fontSize: 10,
    color: '#6B7280',
  },
  chart: {
    width: '100%',
    height: 200,
    marginVertical: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 8,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    fontSize: 10,
    color: '#6B7280',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 4,
  },
});

// Main PDF Document Component
const ReportDocument: React.FC<{ data: ReportData; metrics: ReportMetrics }> = ({ data, metrics }) => (
  <Document>
    <Page style={styles.page} size="A4">
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            {data.brandConfig?.companyName ? 
              `${data.brandConfig.companyName} Citation Report` : 
              'AI Citation Analytics Report'
            }
          </Text>
          <Text style={styles.subtitle}>
            Generated on {new Date().toLocaleDateString()} • {data.timeRange}
          </Text>
        </View>
        {data.brandConfig?.logo && (
          <Image style={styles.logo} src={data.brandConfig.logo} />
        )}
      </View>

      {/* Executive Summary */}
      <View style={styles.executiveSummary}>
        <Text style={[styles.sectionTitle, { borderBottomWidth: 0, marginBottom: 15 }]}>
          Executive Summary
        </Text>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Overall Visibility Score</Text>
          <Text style={[styles.metricValue, { fontSize: 16, color: getScoreColor(metrics.visibilityScore) }]}>
            {metrics.visibilityScore}%
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Total Citation Checks</Text>
          <Text style={styles.metricValue}>{metrics.totalCitations}</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Queries with Citations</Text>
          <Text style={styles.metricValue}>{metrics.citedQueries} of {data.queries.length}</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Top Performing Engine</Text>
          <Text style={styles.metricValue}>
            {metrics.topEngines[0]?.name || 'N/A'} ({metrics.topEngines[0]?.percentage || 0}%)
          </Text>
        </View>
      </View>

      {/* Key Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        
        {/* AI Engine Performance Table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, { flex: 2 }]}>AI Engine</Text>
          <Text style={styles.tableCell}>Citations</Text>
          <Text style={styles.tableCell}>Percentage</Text>
          <Text style={styles.tableCell}>Performance</Text>
        </View>
        
        {metrics.topEngines.map((engine, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>{engine.name}</Text>
            <Text style={styles.tableCell}>{engine.citations}</Text>
            <Text style={styles.tableCell}>{engine.percentage}%</Text>
            <Text style={styles.tableCell}>
              {engine.percentage >= 50 ? 'Excellent' : 
               engine.percentage >= 25 ? 'Good' : 'Needs Improvement'}
            </Text>
          </View>
        ))}
      </View>

      {/* Recommendations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Strategic Recommendations</Text>
        {metrics.recommendations.map((rec, index) => (
          <View key={index} style={styles.recommendation}>
            <Text style={styles.recommendationText}>
              {index + 1}. {rec}
            </Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {data.brandConfig?.companyName || 'AEOlytics'} - AI Citation Analytics
        </Text>
        <Text style={styles.footerText}>
          {data.brandConfig?.website || 'aeolytics.com'}
        </Text>
      </View>
    </Page>

    {/* Detailed Analysis Page */}
    <Page style={styles.page} size="A4">
      <Text style={styles.title}>Detailed Citation Analysis</Text>
      
      {/* Domain Performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Domain Performance</Text>
        
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, { flex: 3 }]}>Domain</Text>
          <Text style={styles.tableCell}>Queries</Text>
          <Text style={styles.tableCell}>Citations</Text>
          <Text style={styles.tableCell}>Status</Text>
        </View>
        
        {data.domains.map((domain, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 3 }]}>{domain.domain}</Text>
            <Text style={styles.tableCell}>{domain.queries_count}</Text>
            <Text style={styles.tableCell}>{domain.citations_count}</Text>
            <Text style={styles.tableCell}>{domain.status}</Text>
          </View>
        ))}
      </View>

      {/* Query Analysis */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Performing Queries</Text>
        
        {data.queries.slice(0, 10).map((query, index) => {
          const queryCitations = data.citations.filter(c => c.query_id === query.id);
          const citationRate = queryCitations.length > 0 ? 
            Math.round((queryCitations.filter(c => c.cited).length / queryCitations.length) * 100) : 0;
          
          return (
            <View key={index} style={styles.recommendation}>
              <Text style={[styles.recommendationText, { fontWeight: 'bold', marginBottom: 4 }]}>
                {query.query_text}
              </Text>
              <Text style={styles.recommendationText}>
                Citation Rate: {citationRate}% • Engines: {query.engines.join(', ')}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Improvement Opportunities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Improvement Opportunities</Text>
        {metrics.improvements.map((improvement, index) => (
          <View key={index} style={styles.recommendation}>
            <Text style={styles.recommendationText}>
              • {improvement}
            </Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

function getScoreColor(score: number): string {
  if (score >= 70) return '#10B981'; // Green
  if (score >= 50) return '#F59E0B'; // Yellow
  return '#EF4444'; // Red
}

// Report Generation Functions
export function calculateMetrics(data: ReportData): ReportMetrics {
  const { citations, queries } = data;
  
  // Calculate visibility score
  const totalCitations = citations.length;
  const citedCount = citations.filter(c => c.cited).length;
  const visibilityScore = totalCitations > 0 ? Math.round((citedCount / totalCitations) * 100) : 0;
  
  // Engine performance
  const engineStats: Record<string, number> = {};
  citations.forEach(citation => {
    engineStats[citation.engine] = (engineStats[citation.engine] || 0) + 1;
  });
  
  const topEngines = Object.entries(engineStats)
    .map(([name, citations]) => ({
      name,
      citations,
      percentage: Math.round((citations / totalCitations) * 100)
    }))
    .sort((a, b) => b.citations - a.citations);
  
  // Generate recommendations
  const recommendations = generateRecommendations(data, visibilityScore, topEngines);
  const improvements = generateImprovements(data, citations);
  
  // Mock trend data (in real implementation, this would come from historical data)
  const trends = Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    score: Math.max(0, visibilityScore + (Math.random() - 0.5) * 20)
  }));
  
  return {
    visibilityScore,
    totalCitations,
    citedQueries: new Set(citations.filter(c => c.cited).map(c => c.query_id)).size,
    topEngines,
    recommendations,
    improvements,
    trends
  };
}

function generateRecommendations(data: ReportData, visibilityScore: number, topEngines: any[]): string[] {
  const recommendations = [];
  
  if (visibilityScore < 30) {
    recommendations.push("Implement comprehensive SEO strategy focusing on Answer Engine Optimization (AEO)");
    recommendations.push("Create detailed FAQ sections for your most important product pages");
    recommendations.push("Develop content that directly answers common customer questions");
  } else if (visibilityScore < 60) {
    recommendations.push("Optimize existing content with structured data markup to improve AI citations");
    recommendations.push("Expand content depth on pages with existing citations");
    recommendations.push("Target long-tail keywords that align with voice search queries");
  } else {
    recommendations.push("Maintain current content quality while expanding to new topic areas");
    recommendations.push("Monitor competitor citation performance and identify content gaps");
    recommendations.push("Consider creating thought leadership content for emerging industry topics");
  }
  
  // Engine-specific recommendations
  const lowPerformingEngines = topEngines.filter(e => e.percentage < 20);
  if (lowPerformingEngines.length > 0) {
    recommendations.push(`Focus on improving performance in ${lowPerformingEngines.map(e => e.name).join(' and ')} through targeted content optimization`);
  }
  
  return recommendations.slice(0, 5);
}

function generateImprovements(data: ReportData, citations: any[]): string[] {
  const improvements = [];
  const uncitedQueries = data.queries.filter(q => 
    !citations.some(c => c.query_id === q.id && c.cited)
  );
  
  if (uncitedQueries.length > 0) {
    improvements.push(`${uncitedQueries.length} queries need content optimization for better AI citations`);
  }
  
  const enginesWithLowPerformance = ['ChatGPT', 'Perplexity', 'Gemini'].filter(engine => {
    const engineCitations = citations.filter(c => c.engine === engine);
    const citationRate = engineCitations.length > 0 ? 
      engineCitations.filter(c => c.cited).length / engineCitations.length : 0;
    return citationRate < 0.3;
  });
  
  if (enginesWithLowPerformance.length > 0) {
    improvements.push(`Improve content strategy for ${enginesWithLowPerformance.join(', ')} optimization`);
  }
  
  improvements.push("Add schema markup to increase structured data visibility");
  improvements.push("Create comprehensive buyer's guide content");
  improvements.push("Develop comparison pages for competitive keywords");
  
  return improvements.slice(0, 6);
}

// Generate and download PDF
export async function generatePDFReport(data: ReportData, fileName?: string): Promise<void> {
  const metrics = calculateMetrics(data);
  const doc = <ReportDocument data={data} metrics={metrics} />;
  
  const blob = await pdf(doc).toBlob();
  const downloadFileName = fileName || `citation-report-${new Date().toISOString().split('T')[0]}.pdf`;
  
  saveAs(blob, downloadFileName);
}

// Generate report preview URL
export async function generateReportPreview(data: ReportData): Promise<string> {
  const metrics = calculateMetrics(data);
  const doc = <ReportDocument data={data} metrics={metrics} />;
  
  const blob = await pdf(doc).toBlob();
  return URL.createObjectURL(blob);
}