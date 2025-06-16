import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  X, 
  Calendar, 
  Search, 
  Tag,
  CheckCircle,
  XCircle,
  Target,
  Zap
} from 'lucide-react';

interface FilterState {
  searchTerm: string;
  engines: string[];
  citationStatus: 'all' | 'cited' | 'uncited';
  dateRange: string;
  domains: string[];
  intentTags: string[];
  position: string[];
  confidenceRange: [number, number];
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  domains: Array<{ id: string; domain: string }>;
  availableTags: string[];
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  onFiltersChange,
  domains,
  availableTags
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    engines: [],
    citationStatus: 'all',
    dateRange: 'all',
    domains: [],
    intentTags: [],
    position: [],
    confidenceRange: [0, 100]
  });

  const engines = ['ChatGPT', 'Perplexity', 'Gemini'];
  const positions = ['top', 'middle', 'bottom'];
  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      searchTerm: '',
      engines: [],
      citationStatus: 'all',
      dateRange: 'all',
      domains: [],
      intentTags: [],
      position: [],
      confidenceRange: [0, 100]
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const toggleArrayFilter = (array: string[], value: string) => {
    return array.includes(value)
      ? array.filter(item => item !== value)
      : [...array, value];
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.engines.length > 0) count++;
    if (filters.citationStatus !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.domains.length > 0) count++;
    if (filters.intentTags.length > 0) count++;
    if (filters.position.length > 0) count++;
    if (filters.confidenceRange[0] > 0 || filters.confidenceRange[1] < 100) count++;
    return count;
  };

  const activeCount = getActiveFilterCount();

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
      >
        <Filter className="w-4 h-4" />
        Filters
        {activeCount > 0 && (
          <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
            {activeCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-12 left-0 z-50 bg-gray-800 border border-gray-700 rounded-xl p-6 w-96 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Advanced Filters</h3>
              <div className="flex items-center gap-2">
                {activeCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-accent-400 hover:text-accent-300 text-sm transition-colors"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Search Term */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Search Query Text
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.searchTerm}
                    onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                    placeholder="Search in query text..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              {/* AI Engines */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  AI Engines
                </label>
                <div className="space-y-2">
                  {engines.map((engine) => (
                    <label key={engine} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.engines.includes(engine)}
                        onChange={() => updateFilters({ 
                          engines: toggleArrayFilter(filters.engines, engine) 
                        })}
                        className="w-4 h-4 text-primary-500 border-gray-600 rounded focus:ring-primary-500"
                      />
                      <span className="ml-2 text-gray-300">{engine}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Citation Status */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Citation Status
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All Citations', icon: Target },
                    { value: 'cited', label: 'Cited Only', icon: CheckCircle },
                    { value: 'uncited', label: 'Not Cited', icon: XCircle }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="citationStatus"
                        value={option.value}
                        checked={filters.citationStatus === option.value}
                        onChange={() => updateFilters({ citationStatus: option.value as any })}
                        className="w-4 h-4 text-primary-500 border-gray-600 focus:ring-primary-500"
                      />
                      <option.icon className="w-4 h-4 ml-2 mr-1 text-gray-400" />
                      <span className="text-gray-300">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => updateFilters({ dateRange: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                >
                  {dateRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Domains */}
              {domains.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Domains
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {domains.map((domain) => (
                      <label key={domain.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.domains.includes(domain.id)}
                          onChange={() => updateFilters({ 
                            domains: toggleArrayFilter(filters.domains, domain.id) 
                          })}
                          className="w-4 h-4 text-primary-500 border-gray-600 rounded focus:ring-primary-500"
                        />
                        <span className="ml-2 text-gray-300">{domain.domain}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Citation Position */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Citation Position
                </label>
                <div className="space-y-2">
                  {positions.map((position) => (
                    <label key={position} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.position.includes(position)}
                        onChange={() => updateFilters({ 
                          position: toggleArrayFilter(filters.position, position) 
                        })}
                        className="w-4 h-4 text-primary-500 border-gray-600 rounded focus:ring-primary-500"
                      />
                      <span className="ml-2 text-gray-300 capitalize">{position}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Confidence Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confidence Score Range
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.confidenceRange[0]}
                      onChange={(e) => updateFilters({ 
                        confidenceRange: [parseInt(e.target.value), filters.confidenceRange[1]] 
                      })}
                      className="flex-1"
                    />
                    <span className="text-white text-sm w-12">{filters.confidenceRange[0]}%</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.confidenceRange[1]}
                      onChange={(e) => updateFilters({ 
                        confidenceRange: [filters.confidenceRange[0], parseInt(e.target.value)] 
                      })}
                      className="flex-1"
                    />
                    <span className="text-white text-sm w-12">{filters.confidenceRange[1]}%</span>
                  </div>
                </div>
              </div>

              {/* Intent Tags */}
              {availableTags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Intent Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => updateFilters({ 
                          intentTags: toggleArrayFilter(filters.intentTags, tag) 
                        })}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                          filters.intentTags.includes(tag)
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-primary-500 hover:text-white'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedFilters;