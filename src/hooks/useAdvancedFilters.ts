import { useState, useMemo } from 'react';

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

export function useAdvancedFilters<T extends Record<string, any>>(
  data: T[],
  filterConfig: {
    searchFields?: (keyof T)[];
    dateField?: keyof T;
    domainField?: keyof T;
    engineField?: keyof T;
    citedField?: keyof T;
    positionField?: keyof T;
    confidenceField?: keyof T;
    tagsField?: keyof T;
  }
) {
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

  const filteredData = useMemo(() => {
    let result = [...data];

    // Search term filter
    if (filters.searchTerm && filterConfig.searchFields) {
      const searchTerm = filters.searchTerm.toLowerCase();
      result = result.filter(item => 
        filterConfig.searchFields!.some(field => 
          String(item[field]).toLowerCase().includes(searchTerm)
        )
      );
    }

    // Engine filter
    if (filters.engines.length > 0 && filterConfig.engineField) {
      result = result.filter(item => 
        filters.engines.includes(String(item[filterConfig.engineField!]))
      );
    }

    // Citation status filter
    if (filters.citationStatus !== 'all' && filterConfig.citedField) {
      const shouldBeCited = filters.citationStatus === 'cited';
      result = result.filter(item => 
        Boolean(item[filterConfig.citedField!]) === shouldBeCited
      );
    }

    // Date range filter
    if (filters.dateRange !== 'all' && filterConfig.dateField) {
      const now = new Date();
      let cutoffDate: Date;

      switch (filters.dateRange) {
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
          cutoffDate = new Date(0);
      }

      result = result.filter(item => {
        const itemDate = new Date(String(item[filterConfig.dateField!]));
        return itemDate >= cutoffDate;
      });
    }

    // Domain filter
    if (filters.domains.length > 0 && filterConfig.domainField) {
      result = result.filter(item => 
        filters.domains.includes(String(item[filterConfig.domainField!]))
      );
    }

    // Position filter
    if (filters.position.length > 0 && filterConfig.positionField) {
      result = result.filter(item => 
        filters.position.includes(String(item[filterConfig.positionField!]))
      );
    }

    // Confidence range filter
    if (filterConfig.confidenceField && 
        (filters.confidenceRange[0] > 0 || filters.confidenceRange[1] < 100)) {
      result = result.filter(item => {
        const confidence = Number(item[filterConfig.confidenceField!]) * 100;
        return confidence >= filters.confidenceRange[0] && 
               confidence <= filters.confidenceRange[1];
      });
    }

    // Intent tags filter
    if (filters.intentTags.length > 0 && filterConfig.tagsField) {
      result = result.filter(item => {
        const itemTags = item[filterConfig.tagsField!] as string[] || [];
        return filters.intentTags.some(tag => itemTags.includes(tag));
      });
    }

    return result;
  }, [data, filters, filterConfig]);

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      engines: [],
      citationStatus: 'all',
      dateRange: 'all',
      domains: [],
      intentTags: [],
      position: [],
      confidenceRange: [0, 100]
    });
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

  return {
    filters,
    setFilters,
    filteredData,
    clearFilters,
    activeFilterCount: getActiveFilterCount()
  };
}