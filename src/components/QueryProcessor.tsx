import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Zap
} from 'lucide-react';
import { useQueryProcessor } from '../hooks/useQueryProcessor';

interface QueryProcessorProps {
  queryIds?: string[];
  onComplete?: (results: any) => void;
  showEngineSelection?: boolean;
}

const QueryProcessor: React.FC<QueryProcessorProps> = ({
  queryIds,
  onComplete,
  showEngineSelection = true
}) => {
  const { processing, statuses, processQueries } = useQueryProcessor();
  const [selectedEngines, setSelectedEngines] = useState(['ChatGPT', 'Perplexity', 'Gemini']);

  const handleProcess = async () => {
    try {
      const results = await processQueries(queryIds, selectedEngines);
      onComplete?.(results);
    } catch (error) {
      console.error('Processing failed:', error);
    }
  };

  const toggleEngine = (engine: string) => {
    setSelectedEngines(prev => 
      prev.includes(engine)
        ? prev.filter(e => e !== engine)
        : [...prev, engine]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-primary-400 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const completedCount = statuses.filter(s => s.status === 'completed').length;
  const failedCount = statuses.filter(s => s.status === 'failed').length;
  const totalCount = statuses.length;

  return (
    <div className="space-y-4">
      {/* Engine Selection */}
      {showEngineSelection && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Select AI Engines</h4>
          <div className="flex flex-wrap gap-2">
            {['ChatGPT', 'Perplexity', 'Gemini'].map((engine) => (
              <button
                key={engine}
                onClick={() => toggleEngine(engine)}
                disabled={processing}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedEngines.includes(engine)
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {engine}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Process Button */}
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: processing ? 1 : 1.05 }}
          whileTap={{ scale: processing ? 1 : 0.95 }}
          onClick={handleProcess}
          disabled={processing || selectedEngines.length === 0}
          className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2"
        >
          {processing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Run Citation Check
            </>
          )}
        </motion.button>

        {totalCount > 0 && (
          <div className="text-sm text-gray-400">
            {completedCount}/{totalCount} completed
            {failedCount > 0 && (
              <span className="text-red-400 ml-2">({failedCount} failed)</span>
            )}
          </div>
        )}
      </div>

      {/* Processing Status */}
      {processing && statuses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-4"
        >
          <h4 className="text-sm font-medium text-gray-300 mb-3">Processing Status</h4>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>{Math.round(((completedCount + failedCount) / totalCount) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-primary-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${((completedCount + failedCount) / totalCount) * 100}%` 
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Status List */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {statuses.map((status, index) => (
              <div key={`${status.queryId}-${status.engine}`} className="flex items-center gap-3 text-sm">
                {getStatusIcon(status.status)}
                <span className="text-gray-300 flex-1">
                  Query {index + 1} - {status.engine}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  status.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  status.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                  status.status === 'processing' ? 'bg-primary-500/20 text-primary-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {status.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Results Summary */}
      {!processing && statuses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-4"
        >
          <h4 className="text-sm font-medium text-gray-300 mb-3">Processing Complete</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">{completedCount}</div>
              <div className="text-xs text-gray-400">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">{failedCount}</div>
              <div className="text-xs text-gray-400">Failed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-400">{totalCount}</div>
              <div className="text-xs text-gray-400">Total</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default QueryProcessor;