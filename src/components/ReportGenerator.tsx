import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Eye, 
  Settings, 
  Image,
  Palette,
  Globe,
  Calendar,
  BarChart3,
  TrendingUp,
  Users,
  X,
  Upload
} from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { useAuth } from '../contexts/AuthContext';

interface BrandConfig {
  logo?: string;
  primaryColor?: string;
  companyName?: string;
  website?: string;
}

const ReportGenerator = () => {
  const { user } = useAuth();
  const { generating, previewUrl, generateReport, previewReport, clearPreview, getReportMetrics } = useReports();
  
  const [config, setConfig] = useState({
    timeRange: '30d' as '7d' | '30d' | '90d' | 'all',
    includeCharts: true,
    includeRecommendations: true,
    includeDetailedAnalysis: true,
    brandConfig: {
      companyName: user?.profile?.full_name || 'Your Company',
      website: 'yourwebsite.com',
      primaryColor: '#0052CC',
      logo: undefined
    } as BrandConfig
  });

  const [showBrandSettings, setShowBrandSettings] = useState(false);

  const handleGenerateReport = () => {
    generateReport(config);
  };

  const handlePreviewReport = () => {
    previewReport(config);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setConfig(prev => ({
          ...prev,
          brandConfig: {
            ...prev.brandConfig,
            logo: e.target?.result as string
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const metrics = getReportMetrics(config.timeRange);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Professional Reports</h2>
          <p className="text-gray-400">Generate white-label PDF reports for stakeholders</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBrandSettings(true)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Brand Settings
          </button>
          
          <button
            onClick={handlePreviewReport}
            disabled={generating}
            className="bg-accent-500 hover:bg-accent-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-dark-900 px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {generating ? 'Generating...' : 'Preview'}
          </button>
          
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {generating ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Time Range */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Time Period
            </h3>
            <div className="space-y-3">
              {[
                { value: '7d', label: 'Last 7 Days' },
                { value: '30d', label: 'Last 30 Days' },
                { value: '90d', label: 'Last 90 Days' },
                { value: 'all', label: 'All Time' }
              ].map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="timeRange"
                    value={option.value}
                    checked={config.timeRange === option.value}
                    onChange={(e) => setConfig(prev => ({ ...prev, timeRange: e.target.value as any }))}
                    className="w-4 h-4 text-primary-500 border-gray-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Report Features */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Report Features
            </h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.includeCharts}
                  onChange={(e) => setConfig(prev => ({ ...prev, includeCharts: e.target.checked }))}
                  className="w-4 h-4 text-primary-500 border-gray-600 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-gray-300">Performance Charts</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.includeRecommendations}
                  onChange={(e) => setConfig(prev => ({ ...prev, includeRecommendations: e.target.checked }))}
                  className="w-4 h-4 text-primary-500 border-gray-600 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-gray-300">Strategic Recommendations</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.includeDetailedAnalysis}
                  onChange={(e) => setConfig(prev => ({ ...prev, includeDetailedAnalysis: e.target.checked }))}
                  className="w-4 h-4 text-primary-500 border-gray-600 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-gray-300">Detailed Analysis</span>
              </label>
            </div>
          </div>

          {/* Brand Preview */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Brand Preview
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                {config.brandConfig?.logo ? (
                  <img src={config.brandConfig.logo} alt="Logo" className="w-8 h-8 object-contain" />
                ) : (
                  <div className="w-8 h-8 bg-primary-500 rounded flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                )}
                <div>
                  <div className="font-medium text-white text-sm">{config.brandConfig?.companyName}</div>
                  <div className="text-xs text-gray-400">{config.brandConfig?.website}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Preview / Metrics */}
        <div className="lg:col-span-2">
          {previewUrl ? (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Report Preview</h3>
                <button
                  onClick={clearPreview}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <iframe
                src={previewUrl}
                className="w-full h-96 border border-gray-600 rounded-lg"
                title="Report Preview"
              />
            </div>
          ) : (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Report Overview</h3>
              
              {metrics && (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary-400">{metrics.visibilityScore}%</div>
                      <div className="text-sm text-gray-400">Visibility Score</div>
                    </div>
                    <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                      <div className="text-2xl font-bold text-white">{metrics.totalCitations}</div>
                      <div className="text-sm text-gray-400">Total Citations</div>
                    </div>
                    <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">{metrics.citedQueries}</div>
                      <div className="text-sm text-gray-400">Cited Queries</div>
                    </div>
                    <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                      <div className="text-2xl font-bold text-accent-500">{metrics.topEngines.length}</div>
                      <div className="text-sm text-gray-400">AI Engines</div>
                    </div>
                  </div>

                  {/* Top Engines */}
                  <div>
                    <h4 className="text-md font-semibold text-white mb-3">Engine Performance</h4>
                    <div className="space-y-2">
                      {metrics.topEngines.map((engine, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                          <span className="text-gray-300">{engine.name}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-primary-500 h-2 rounded-full"
                                style={{ width: `${engine.percentage}%` }}
                              />
                            </div>
                            <span className="text-white font-medium text-sm w-12 text-right">
                              {engine.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sample Recommendations */}
                  <div>
                    <h4 className="text-md font-semibold text-white mb-3">Key Recommendations</h4>
                    <div className="space-y-2">
                      {metrics.recommendations.slice(0, 3).map((rec, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
                          <TrendingUp className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Brand Settings Modal */}
      {showBrandSettings && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowBrandSettings(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Brand Settings</h3>
              <button
                onClick={() => setShowBrandSettings(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={config.brandConfig?.companyName || ''}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    brandConfig: { ...prev.brandConfig, companyName: e.target.value }
                  }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                  placeholder="Your Company Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Website
                </label>
                <input
                  type="text"
                  value={config.brandConfig?.website || ''}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    brandConfig: { ...prev.brandConfig, website: e.target.value }
                  }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                  placeholder="yourwebsite.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.brandConfig?.primaryColor || '#0052CC'}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      brandConfig: { ...prev.brandConfig, primaryColor: e.target.value }
                    }))}
                    className="w-12 h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.brandConfig?.primaryColor || '#0052CC'}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      brandConfig: { ...prev.brandConfig, primaryColor: e.target.value }
                    }))}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Logo
                </label>
                <div className="flex items-center gap-3">
                  {config.brandConfig?.logo && (
                    <img src={config.brandConfig.logo} alt="Logo" className="w-12 h-12 object-contain bg-white rounded border" />
                  )}
                  <label className="flex-1 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg px-3 py-2 text-white cursor-pointer transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Logo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Recommended: PNG or JPG, max 2MB
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <button
                onClick={() => setShowBrandSettings(false)}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg font-medium transition-all"
              >
                Save Settings
              </button>
              <button
                onClick={() => setShowBrandSettings(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ReportGenerator;