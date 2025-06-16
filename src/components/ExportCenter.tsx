import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  FileText, 
  Database, 
  Globe, 
  Search,
  Calendar,
  Filter,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useExport } from '../hooks/useExport';

const ExportCenter = () => {
  const { exporting, exportData, exportCitationReport } = useExport();
  const [selectedType, setSelectedType] = useState<'citations' | 'queries' | 'domains' | 'all'>('citations');
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json'>('csv');

  const exportOptions = [
    {
      type: 'citations' as const,
      icon: CheckCircle,
      title: 'Citations Data',
      description: 'All citation results with engine responses and scores',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      type: 'queries' as const,
      icon: Search,
      title: 'Queries',
      description: 'Your tracked queries with settings and metadata',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      type: 'domains' as const,
      icon: Globe,
      title: 'Domains',
      description: 'Domain tracking data and performance metrics',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    {
      type: 'all' as const,
      icon: Database,
      title: 'Complete Export',
      description: 'All data including citations, queries, and domains',
      color: 'text-accent-400',
      bgColor: 'bg-accent-500/20'
    }
  ];

  const formatOptions = [
    { value: 'csv', label: 'CSV', description: 'Spreadsheet compatible format' },
    { value: 'json', label: 'JSON', description: 'Machine readable format' }
  ];

  const handleExport = () => {
    exportData(selectedType, selectedFormat);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Data Export</h2>
          <p className="text-gray-400">Export your citation data and analytics</p>
        </div>
        
        <button
          onClick={exportCitationReport}
          disabled={exporting}
          className="bg-accent-500 hover:bg-accent-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-dark-900 px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Export Analysis Report
        </button>
      </div>

      {/* Export Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Type Selection */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Select Data Type</h3>
          
          <div className="space-y-3">
            {exportOptions.map((option) => (
              <motion.button
                key={option.type}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedType(option.type)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedType === option.type
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${option.bgColor}`}>
                    <option.icon className={`w-5 h-5 ${option.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{option.title}</h4>
                    <p className="text-gray-400 text-sm">{option.description}</p>
                  </div>
                  {selectedType === option.type && (
                    <CheckCircle className="w-5 h-5 text-primary-400" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Format and Options */}
        <div className="space-y-6">
          {/* Format Selection */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Export Format</h3>
            
            <div className="space-y-3">
              {formatOptions.map((format) => (
                <label key={format.value} className="flex items-center">
                  <input
                    type="radio"
                    name="format"
                    value={format.value}
                    checked={selectedFormat === format.value}
                    onChange={(e) => setSelectedFormat(e.target.value as 'csv' | 'json')}
                    className="w-4 h-4 text-primary-500 border-gray-600 focus:ring-primary-500"
                  />
                  <div className="ml-3">
                    <span className="text-white font-medium">{format.label}</span>
                    <p className="text-gray-400 text-sm">{format.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Export Preview */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Export Preview</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Data Type:</span>
                <span className="text-white capitalize">{selectedType}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Format:</span>
                <span className="text-white uppercase">{selectedFormat}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">File Name:</span>
                <span className="text-white text-xs">
                  {selectedType}-export-{new Date().toISOString().split('T')[0]}.{selectedFormat}
                </span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExport}
              disabled={exporting}
              className="w-full mt-4 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              {exporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export Data
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Quick Export Actions */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Export Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => exportData('citations', 'csv')}
            disabled={exporting}
            className="p-4 bg-gray-700/50 hover:bg-gray-700 disabled:bg-gray-600 rounded-lg transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="font-medium text-white">Citations CSV</span>
            </div>
            <p className="text-gray-400 text-sm">Download all citation data as spreadsheet</p>
          </button>
          
          <button
            onClick={() => exportData('queries', 'json')}
            disabled={exporting}
            className="p-4 bg-gray-700/50 hover:bg-gray-700 disabled:bg-gray-600 rounded-lg transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <Search className="w-5 h-5 text-blue-400" />
              <span className="font-medium text-white">Queries JSON</span>
            </div>
            <p className="text-gray-400 text-sm">Export query configurations for backup</p>
          </button>
          
          <button
            onClick={exportCitationReport}
            disabled={exporting}
            className="p-4 bg-gray-700/50 hover:bg-gray-700 disabled:bg-gray-600 rounded-lg transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-accent-400" />
              <span className="font-medium text-white">Analysis Report</span>
            </div>
            <p className="text-gray-400 text-sm">Comprehensive citation analysis report</p>
          </button>
        </div>
      </div>

      {/* Export Guidelines */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-400 mb-2">Export Guidelines</h4>
            <ul className="text-blue-300 text-sm space-y-1">
              <li>• CSV files can be opened in Excel, Google Sheets, or other spreadsheet applications</li>
              <li>• JSON files are ideal for data integration and backup purposes</li>
              <li>• Large exports may take a few moments to generate</li>
              <li>• Exported data includes all historical records within your plan limits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportCenter;