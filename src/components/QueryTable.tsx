import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  X, 
  CheckCircle, 
  AlertCircle,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  MoreVertical,
  Download,
  Edit,
  Trash2,
  Lock
} from 'lucide-react';
import { useQueries } from '../hooks/useQueries';
import { useDomains } from '../hooks/useDomains';
import { useAuth } from '../contexts/AuthContext';
import { usePlanRestrictions } from '../hooks/usePlanRestrictions';
import { useAdvancedFilters } from '../hooks/useAdvancedFilters';
import { useBulkOperations } from '../hooks/useBulkOperations';
import { useExport } from '../hooks/useExport';
import AdvancedFilters from './AdvancedFilters';
import BulkOperationsPanel from './BulkOperationsPanel';

const QueryTable = () => {
  const { user } = useAuth();
  const { queries, loading, addQuery, deleteQuery } = useQueries();
  const { domains } = useDomains();
  const { exportData } = useExport();
  const { canUseEngine, getAvailableEngines, currentPlan } = usePlanRestrictions();
  
  const [selectedQueries, setSelectedQueries] = useState<string[]>([]);
  const [showAddQuery, setShowAddQuery] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [newQuery, setNewQuery] = useState({
    query_text: '',
    domain_id: '',
    intent_tags: [] as string[],
    engines: getAvailableEngines() // 🔒 RESTRICTED: Based on plan
  });

  // Advanced filtering
  const { filters, setFilters, filteredData, activeFilterCount } = useAdvancedFilters(
    queries,
    {
      searchFields: ['query_text'],
      dateField: 'created_at',
      domainField: 'domain_id',
      tagsField: 'intent_tags'
    }
  );

  // Available tags from all queries
  const availableTags = [...new Set(queries.flatMap(q => q.intent_tags))];
  const availableEngines = getAvailableEngines();

  const toggleQuerySelection = (id: string) => {
    setSelectedQueries(prev => 
      prev.includes(id) 
        ? prev.filter(qId => qId !== id)
        : [...prev, id]
    );
  };

  const selectAllQueries = () => {
    setSelectedQueries(
      selectedQueries.length === filteredData.length 
        ? [] 
        : filteredData.map(q => q.id)
    );
  };

  const handleAddQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addQuery({
        query_text: newQuery.query_text,
        domain_id: newQuery.domain_id || undefined,
        intent_tags: newQuery.intent_tags,
        engines: newQuery.engines.filter(engine => canUseEngine(engine)) // 🔒 Filter by plan
      });
      
      setShowAddQuery(false);
      setNewQuery({
        query_text: '',
        domain_id: '',
        intent_tags: [],
        engines: getAvailableEngines()
      });
    } catch (error) {
      console.error('Error adding query:', error);
    }
  };

  const handleDeleteQuery = async (queryId: string) => {
    if (window.confirm('Are you sure you want to delete this query?')) {
      await deleteQuery(queryId);
    }
  };

  const toggleIntentTag = (tag: string) => {
    setNewQuery(prev => ({
      ...prev,
      intent_tags: prev.intent_tags.includes(tag)
        ? prev.intent_tags.filter(t => t !== tag)
        : [...prev.intent_tags, tag]
    }));
  };

  const planLimits = { free: 50, pro: 1000, agency: 10000 };
  const maxQueries = planLimits[currentPlan];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4"></div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6">
            <div className="h-10 bg-gray-700 rounded"></div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl">
            <div className="h-64 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Query Management</h1>
          <p className="text-gray-400">Monitor and optimize your tracked queries</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportData('queries', 'csv')}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddQuery(true)}
            disabled={queries.length >= maxQueries}
            className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Query
          </motion.button>
        </div>
      </div>

      {/* Plan Restriction Notice */}
      {currentPlan === 'free' && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-yellow-400" />
            <div>
              <div className="text-yellow-400 font-medium">Free Plan Limitations</div>
              <div className="text-yellow-300 text-sm">
                Free accounts are limited to ChatGPT tracking only. 
                <button className="text-primary-400 hover:text-primary-300 ml-1 underline">
                  Upgrade to Pro
                </button> for all AI engines.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="flex items-center justify-between bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <div className="flex items-center gap-4">
          <AdvancedFilters
            onFiltersChange={setFilters}
            domains={domains}
            availableTags={availableTags}
          />
          
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search queries..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-primary-500 w-64"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'table' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'cards' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400">
            {filteredData.length} of {queries.length} queries
            {activeFilterCount > 0 && ` (${activeFilterCount} filters active)`}
          </div>
          
          <div className="text-sm text-gray-400">
            {queries.length}/{maxQueries} queries used
          </div>
          
          {selectedQueries.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">
                {selectedQueries.length} selected
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Query Display */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        {filteredData.length > 0 ? (
          viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50 border-b border-gray-600">
                  <tr>
                    <th className="text-left p-4 text-gray-300 font-medium text-sm">
                      <input
                        type="checkbox"
                        className="rounded border-gray-600"
                        checked={selectedQueries.length === filteredData.length && filteredData.length > 0}
                        onChange={selectAllQueries}
                      />
                    </th>
                    <th className="text-left p-4 text-gray-300 font-medium text-sm">Query</th>
                    <th className="text-left p-4 text-gray-300 font-medium text-sm">Domain</th>
                    <th className="text-left p-4 text-gray-300 font-medium text-sm">Engines</th>
                    <th className="text-left p-4 text-gray-300 font-medium text-sm">Status</th>
                    <th className="text-left p-4 text-gray-300 font-medium text-sm">Last Run</th>
                    <th className="text-left p-4 text-gray-300 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((query, index) => (
                    <motion.tr
                      key={query.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors"
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-600"
                          checked={selectedQueries.includes(query.id)}
                          onChange={() => toggleQuerySelection(query.id)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-white max-w-xs">
                          {query.query_text}
                        </div>
                        {query.intent_tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {query.intent_tags.map((tag) => (
                              <span key={tag} className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {query.domain ? (
                          <span className="text-gray-300">{query.domain.domain}</span>
                        ) : (
                          <span className="text-gray-500">All domains</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {query.engines.map((engine) => (
                            <span 
                              key={engine} 
                              className={`px-2 py-1 rounded-full text-xs ${
                                canUseEngine(engine) 
                                  ? 'bg-gray-700 text-gray-300' 
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {engine}
                              {!canUseEngine(engine) && (
                                <Lock className="w-3 h-3 inline ml-1" />
                              )}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                          query.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {query.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-400 text-sm">
                          {query.last_run ? new Date(query.last_run).toLocaleDateString() : 'Never'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button 
                            className="p-1 text-gray-400 hover:text-accent-500 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                            title="Edit query"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                            title="Delete query"
                            onClick={() => handleDeleteQuery(query.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Card View
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredData.map((query, index) => (
                <motion.div
                  key={query.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-gray-700/30 border border-gray-600 rounded-lg p-4 hover:border-primary-500/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <input
                      type="checkbox"
                      className="rounded border-gray-600 mt-1"
                      checked={selectedQueries.includes(query.id)}
                      onChange={() => toggleQuerySelection(query.id)}
                    />
                    <div className="flex gap-1">
                      <button 
                        className="p-1 text-gray-400 hover:text-accent-500 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete query"
                        onClick={() => handleDeleteQuery(query.id)}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-white mb-2 line-clamp-2">
                    {query.query_text}
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Domain:</span>
                      <span className="text-gray-300">
                        {query.domain?.domain || 'All'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={`capitalize ${
                        query.status === 'active' ? 'text-green-400' : 'text-gray-400'
                      }`}>
                        {query.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Run:</span>
                      <span className="text-gray-300">
                        {query.last_run ? new Date(query.last_run).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                  </div>
                  
                  {query.intent_tags.length > 0 && (
                    <div className="flex gap-1 mt-3">
                      {query.intent_tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                      {query.intent_tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs">
                          +{query.intent_tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-1 mt-3">
                    {query.engines.map((engine) => (
                      <span 
                        key={engine} 
                        className={`px-2 py-1 rounded text-xs ${
                          canUseEngine(engine) 
                            ? 'bg-gray-600 text-gray-300' 
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {engine}
                        {!canUseEngine(engine) && <Lock className="w-3 h-3 inline ml-1" />}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          <div className="p-12 text-center">
            <Search className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              {queries.length === 0 ? 'No queries yet' : 'No queries match your filters'}
            </h3>
            <p className="text-gray-500 mb-4">
              {queries.length === 0 
                ? 'Add your first query to start tracking citations'
                : 'Try adjusting your filters or search terms'
              }
            </p>
            {queries.length === 0 && (
              <button
                onClick={() => setShowAddQuery(true)}
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
              >
                Add Your First Query
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bulk Operations Panel */}
      <BulkOperationsPanel
        selectedItems={selectedQueries}
        itemType="queries"
        onClearSelection={() => setSelectedQueries([])}
        onRefresh={() => window.location.reload()}
      />

      {/* Add Query Modal */}
      {showAddQuery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowAddQuery(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Add New Query</h3>
              <button
                onClick={() => setShowAddQuery(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddQuery} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Query Text
                </label>
                <input
                  type="text"
                  value={newQuery.query_text}
                  onChange={(e) => setNewQuery(prev => ({ ...prev, query_text: e.target.value }))}
                  placeholder="e.g., best project management tools"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Associated Domain (Optional)
                </label>
                <select 
                  value={newQuery.domain_id}
                  onChange={(e) => setNewQuery(prev => ({ ...prev, domain_id: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                >
                  <option value="">All Domains</option>
                  {domains.map((domain) => (
                    <option key={domain.id} value={domain.id}>{domain.domain}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  AI Engines
                </label>
                <div className="space-y-2">
                  {['ChatGPT', 'Perplexity', 'Gemini', 'Copilot'].map((engine) => (
                    <label key={engine} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newQuery.engines.includes(engine)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewQuery(prev => ({ 
                              ...prev, 
                              engines: [...prev.engines, engine]
                            }));
                          } else {
                            setNewQuery(prev => ({ 
                              ...prev, 
                              engines: prev.engines.filter(e => e !== engine)
                            }));
                          }
                        }}
                        disabled={!canUseEngine(engine)} // 🔒 RESTRICTED: Based on plan
                        className="w-4 h-4 text-primary-500 border-gray-600 rounded focus:ring-primary-500 disabled:opacity-50"
                      />
                      <span className={`ml-2 ${
                        canUseEngine(engine) ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {engine}
                        {!canUseEngine(engine) && (
                          <Lock className="w-3 h-3 inline ml-1" />
                        )}
                      </span>
                    </label>
                  ))}
                </div>
                {currentPlan === 'free' && (
                  <div className="text-xs text-yellow-400 mt-2">
                    Free plan limited to ChatGPT only
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Intent Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {['brand', 'product', 'feature', 'competitor'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleIntentTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        newQuery.intent_tags.includes(tag)
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-primary-500 hover:text-white'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600">
                <div className="text-sm text-gray-300 mb-1">Query Limit</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all"
                      style={{ width: `${(queries.length / maxQueries) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{queries.length}/{maxQueries}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={!newQuery.query_text || newQuery.engines.length === 0 || queries.length >= maxQueries}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-all"
                >
                  Add Query
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddQuery(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default QueryTable;