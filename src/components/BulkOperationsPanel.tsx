import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckSquare, 
  Trash2, 
  Edit, 
  Play, 
  X,
  AlertTriangle,
  RefreshCw,
  Settings
} from 'lucide-react';
import { useBulkOperations } from '../hooks/useBulkOperations';

interface BulkOperationsPanelProps {
  selectedItems: string[];
  itemType: 'queries' | 'domains' | 'citations';
  onClearSelection: () => void;
  onRefresh?: () => void;
}

const BulkOperationsPanel: React.FC<BulkOperationsPanelProps> = ({
  selectedItems,
  itemType,
  onClearSelection,
  onRefresh
}) => {
  const { 
    processing, 
    progress, 
    bulkDeleteQueries, 
    bulkUpdateQueries, 
    bulkProcessQueries,
    bulkDeleteDomains,
    bulkDeleteCitations
  } = useBulkOperations();
  
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [updateData, setUpdateData] = useState<any>({});

  const handleBulkOperation = async (operation: string) => {
    try {
      switch (operation) {
        case 'delete':
          if (itemType === 'queries') {
            await bulkDeleteQueries(selectedItems);
          } else if (itemType === 'domains') {
            await bulkDeleteDomains(selectedItems);
          } else if (itemType === 'citations') {
            await bulkDeleteCitations(selectedItems);
          }
          break;
        
        case 'process':
          if (itemType === 'queries') {
            await bulkProcessQueries(selectedItems);
          }
          break;
        
        case 'update':
          if (itemType === 'queries') {
            await bulkUpdateQueries(selectedItems, updateData);
          }
          break;
      }
      
      onClearSelection();
      onRefresh?.();
    } catch (error) {
      console.error('Bulk operation failed:', error);
    } finally {
      setShowConfirm(null);
    }
  };

  const getOperations = () => {
    const operations = [
      {
        id: 'delete',
        label: 'Delete Selected',
        icon: Trash2,
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        hoverColor: 'hover:bg-red-500/30',
        dangerous: true
      }
    ];

    if (itemType === 'queries') {
      operations.unshift(
        {
          id: 'process',
          label: 'Process Citations',
          icon: Play,
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          hoverColor: 'hover:bg-green-500/30',
          dangerous: false
        }
      );
    }

    return operations;
  };

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
      >
        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-4 min-w-96">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <CheckSquare className="w-5 h-5 text-primary-400" />
              <span className="font-medium text-white">
                {selectedItems.length} {itemType} selected
              </span>
            </div>
            
            <button
              onClick={onClearSelection}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {processing && (
            <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                <span className="text-blue-400 text-sm font-medium">Processing...</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                />
              </div>
              <div className="text-xs text-blue-300 mt-1">
                {progress.current} of {progress.total} completed
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            {getOperations().map((operation) => (
              <button
                key={operation.id}
                onClick={() => setShowConfirm(operation.id)}
                disabled={processing}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  operation.bgColor
                } ${operation.hoverColor}`}
              >
                <operation.icon className={`w-4 h-4 ${operation.color}`} />
                <span className={`text-sm font-medium ${operation.color}`}>
                  {operation.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowConfirm(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-bold text-white">Confirm Bulk Operation</h3>
            </div>

            <p className="text-gray-300 mb-6">
              Are you sure you want to {showConfirm} {selectedItems.length} {itemType}? 
              {showConfirm === 'delete' && ' This action cannot be undone.'}
            </p>

            {showConfirm === 'update' && (
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={updateData.status || ''}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="">Keep current</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleBulkOperation(showConfirm)}
                disabled={processing}
                className={`flex-1 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  showConfirm === 'delete' 
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-primary-500 hover:bg-primary-600 text-white'
                }`}
              >
                {processing ? 'Processing...' : `Confirm ${showConfirm}`}
              </button>
              <button
                onClick={() => setShowConfirm(null)}
                disabled={processing}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default BulkOperationsPanel;