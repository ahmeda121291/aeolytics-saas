import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Target, 
  Zap,
  Calendar,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, AreaChart, Area } from 'recharts';
import { useCitations } from '../hooks/useCitations';
import { useQueries } from '../hooks/useQueries';

const EnhancedAnalytics = () => {
  const { citations, getCitationStats } = useCitations();
  const { queries } = useQueries();
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('visibility');

  const stats = getCitationStats();

  // Generate trend data based on citations
  const generateTrendData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dayCitations = citations.filter(c => {
        const citationDate = new Date(c.run_date);
        return citationDate.toDateString() === date.toDateString();
      });
      
      const citedCount = dayCitations.filter(c => c.cited).length;
      const visibilityScore = dayCitations.length > 0 ? (citedCount / dayCitations.length) * 100 : 0;
      
      data.push({
        date: date.toLocaleDateString(),
        visibility: Math.round(visibilityScore),
        citations: dayCitations.length,
        cited: citedCount,
        uncited: dayCitations.length - citedCount
      });
    }
    
    return data;
  };

  // Engine performance data
  const engineData = Object.entries(stats.engineStats).map(([name, value]) => ({
    name,
    value: Math.round((value / stats.total) * 100),
    citations: value,
    color: name === 'ChatGPT' ? '#0052CC' : 
           name === 'Perplexity' ? '#00FFE0' : 
           name === 'Gemini' ? '#9333EA' : '#F97316'
  })).filter(item => item.value > 0);

  // Top performing queries
  const topQueries = queries
    .map(query => {
      const queryCitations = citations.filter(c => c.query_id === query.id);
      const citationRate = queryCitations.length > 0 ? 
        (queryCitations.filter(c => c.cited).length / queryCitations.length) * 100 : 0;
      
      return {
        ...query,
        citationRate: Math.round(citationRate),
        totalCitations: queryCitations.length,
        citedCount: queryCitations.filter(c => c.cited).length
      };
    })
    .sort((a, b) => b.citationRate - a.citationRate)
    .slice(0, 5);

  const trendData = generateTrendData();

  // Position distribution
  const positionData = [
    { name: 'Top', value: citations.filter(c => c.position === 'top').length, color: '#10B981' },
    { name: 'Middle', value: citations.filter(c => c.position === 'middle').length, color: '#F59E0B' },
    { name: 'Bottom', value: citations.filter(c => c.position === 'bottom').length, color: '#EF4444' },
    { name: 'Not Cited', value: citations.filter(c => !c.cited).length, color: '#6B7280' }
  ].filter(item => item.value > 0);

  const metrics = [
    {
      id: 'visibility',
      label: 'Visibility Score',
      value: stats.visibilityScore,
      unit: '%',
      change: '+12%',
      changeType: 'positive' as const,
      icon: Eye,
      color: 'text-primary-400'
    },
    {
      id: 'citations',
      label: 'Total Citations',
      value: stats.total,
      unit: '',
      change: '+5',
      changeType: 'positive' as const,
      icon: Target,
      color: 'text-green-400'
    },
    {
      id: 'queries',
      label: 'Active Queries',
      value: queries.length,
      unit: '',
      change: '+2',
      changeType: 'positive' as const,
      icon: Zap,
      color: 'text-accent-400'
    },
    {
      id: 'engines',
      label: 'AI Engines',
      value: Object.keys(stats.engineStats).length,
      unit: '',
      change: '0',
      changeType: 'neutral' as const,
      icon: Activity,
      color: 'text-purple-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Enhanced Analytics</h2>
          <p className="text-gray-400">Deep insights into your citation performance</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-primary-500/30 transition-all group cursor-pointer"
            onClick={() => setSelectedMetric(metric.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2 rounded-lg bg-opacity-20 ${
                metric.id === selectedMetric ? 'bg-primary-500' : 'bg-gray-700'
              }`}>
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                metric.changeType === 'positive' ? 'text-green-400' :
                metric.changeType === 'negative' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {metric.changeType === 'positive' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : metric.changeType === 'negative' ? (
                  <TrendingDown className="w-3 h-3" />
                ) : null}
                {metric.change}
              </div>
            </div>
            
            <div className="mb-2">
              <h3 className="text-2xl font-bold text-white">
                {metric.value}{metric.unit}
              </h3>
            </div>
            
            <p className="text-gray-400 text-sm">{metric.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Performance Trends</h3>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-accent-500 rounded-full" />
              <span className="text-sm text-gray-400">Visibility Score</span>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="visibility"
                  stroke="#00FFE0"
                  fill="#00FFE0"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engine Distribution */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Engine Performance</h3>
          
          {engineData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engineData}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  />
                  <Bar dataKey="value" radius={4}>
                    {engineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No citation data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Queries */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Top Performing Queries</h3>
          
          <div className="space-y-4">
            {topQueries.map((query, index) => (
              <div key={query.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate">{query.query_text}</h4>
                  <p className="text-gray-400 text-sm">
                    {query.citedCount}/{query.totalCitations} citations
                  </p>
                </div>
                <div className="ml-4 text-right">
                  <div className={`text-lg font-bold ${
                    query.citationRate >= 70 ? 'text-green-400' :
                    query.citationRate >= 40 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {query.citationRate}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Position Distribution */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Citation Position Distribution</h3>
          
          {positionData.length > 0 ? (
            <div className="space-y-4">
              {positionData.map((position, index) => (
                <div key={position.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: position.color }}
                    />
                    <span className="text-gray-300">{position.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          backgroundColor: position.color,
                          width: `${(position.value / citations.length) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-white font-medium text-sm w-8 text-right">
                      {position.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <PieChart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No position data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-400 mb-1">
              {stats.visibilityScore >= 70 ? 'Excellent' : 
               stats.visibilityScore >= 50 ? 'Good' : 
               stats.visibilityScore >= 30 ? 'Fair' : 'Needs Work'}
            </div>
            <div className="text-sm text-gray-400">Overall Performance</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-400 mb-1">
              {Math.round((stats.cited / Math.max(queries.length, 1)) * 100)}%
            </div>
            <div className="text-sm text-gray-400">Query Coverage</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {engineData.length > 0 ? engineData[0].name : 'N/A'}
            </div>
            <div className="text-sm text-gray-400">Best Performing Engine</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAnalytics;