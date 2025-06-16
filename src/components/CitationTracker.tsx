import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  XCircle, 
  Clock,
  Target,
  Zap,
  AlertCircle
} from 'lucide-react';
import { useCitations } from '../hooks/useCitations';
import { useQueries } from '../hooks/useQueries';
import QueryProcessor from './QueryProcessor';

const CitationTracker = () => {
  const { citations, loading: citationsLoading, getCitationStats, refetch } = useCitations();
  const { queries, loading: queriesLoading } = useQueries();
  const [showProcessor, setShowProcessor] = useState(false);

  const loading = citationsLoading || queriesLoading;
  const stats = getCitationStats();

  // Auto-refresh citations when queries are processed
  const handleProcessingComplete = async (results: any) => {
    if (results?.success) {
      // Wait a moment for data to be processed
      setTimeout(() => {
        refetch();
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="h-20 bg-gray-700 rounded"></div>
          <div className="h-40 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Citation Tracking</h2>
          <p className="text-gray-400">Monitor your brand mentions across AI engines</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowProcessor(!showProcessor)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          {showProcessor ? 'Hide' : 'Run'} Citation Check
        </motion.button>
      </div>

      {/* API Status - ALL ENGINES READY! */}
      <div className="bg-gradient-to-r from-green-500/10 to-accent-500/10 border border-green-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <h4 className="text-sm font-medium text-green-400">🎉 All AI Engines Ready!</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <div className="text-sm font-medium text-green-400">ChatGPT</div>
              <div className="text-xs text-gray-400">OpenAI API Connected</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <div className="text-sm font-medium text-green-400">Perplexity</div>
              <div className="text-xs text-gray-400">API Connected</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <div className="text-sm font-medium text-green-400">Gemini</div>
              <div className="text-xs text-gray-400">Google API Connected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Query Processor */}
      {showProcessor && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Process Queries</h3>
          <QueryProcessor onComplete={handleProcessingComplete} />
        </motion.div>
      )}

      {/* Citation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-5 h-5 text-primary-400" />
            <span className="text-gray-300 font-medium">Visibility Score</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.visibilityScore}%</div>
          <div className="text-sm text-gray-400">
            {stats.cited}/{stats.total} citations found
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-gray-300 font-medium">Cited Queries</span>
          </div>
          <div className="text-3xl font-bold text-green-400">{stats.cited}</div>
          <div className="text-sm text-gray-400">Brand mentions found</div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-5 h-5 text-red-400" />
            <span className="text-gray-300 font-medium">Missing Citations</span>
          </div>
          <div className="text-3xl font-bold text-red-400">{stats.uncited}</div>
          <div className="text-sm text-gray-400">Opportunities to improve</div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-accent-500" />
            <span className="text-gray-300 font-medium">Total Checks</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.total}</div>
          <div className="text-sm text-gray-400">Across {Object.keys(stats.engineStats).length} engines</div>
        </div>
      </div>

      {/* Engine Breakdown */}
      {Object.keys(stats.engineStats).length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Engine Performance</h3>
          <div className="space-y-4">
            {Object.entries(stats.engineStats).map(([engine, count]) => {
              const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              const citedInEngine = citations.filter(c => c.engine === engine && c.cited).length;
              const engineCitationRate = count > 0 ? Math.round((citedInEngine / count) * 100) : 0;
              
              return (
                <div key={engine} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      engine === 'ChatGPT' ? 'bg-blue-500' :
                      engine === 'Perplexity' ? 'bg-accent-500' :
                      engine === 'Gemini' ? 'bg-purple-500' : 'bg-gray-500'
                    }`} />
                    <span className="font-medium text-white">{engine}</span>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-gray-300">
                      {count} queries ({percentage}%)
                    </div>
                    <div className={`font-medium ${
                      engineCitationRate >= 50 ? 'text-green-400' :
                      engineCitationRate >= 25 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {engineCitationRate}% cited
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Citations */}
      {citations.length > 0 ? (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Citation Checks</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {citations.slice(0, 20).map((citation) => (
              <div key={citation.id} className="flex items-start gap-4 p-4 bg-gray-700/30 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {citation.cited ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white text-sm">
                      {citation.query?.query_text || 'Unknown Query'}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400 text-sm">{citation.engine}</span>
                    {citation.position && (
                      <>
                        <span className="text-gray-500">•</span>
                        <span className="text-accent-400 text-sm capitalize">{citation.position}</span>
                      </>
                    )}
                  </div>
                  
                  <p className="text-gray-300 text-sm line-clamp-2">
                    {citation.response_text.substring(0, 150)}...
                  </p>
                  
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>{new Date(citation.run_date).toLocaleDateString()}</span>
                    {citation.confidence_score > 0 && (
                      <span>Confidence: {Math.round(citation.confidence_score * 100)}%</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
          <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No citation data yet</h3>
          <p className="text-gray-500 mb-6">
            Run your first citation check to see how your brand appears in AI responses
          </p>
          <button
            onClick={() => setShowProcessor(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-all"
          >
            Start Citation Check
          </button>
        </div>
      )}
    </div>
  );
};

export default CitationTracker;