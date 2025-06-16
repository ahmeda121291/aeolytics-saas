import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Eye, 
  Target, 
  Zap, 
  ArrowUp, 
  ArrowDown,
  MoreVertical
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useCitations } from '../hooks/useCitations';
import { useQueries } from '../hooks/useQueries';
import { useDomains } from '../hooks/useDomains';

const MetricsOverview = () => {
  const { citations, loading: citationsLoading, getCitationStats, getRecentActivity } = useCitations();
  const { queries, loading: queriesLoading } = useQueries();
  const { domains, loading: domainsLoading } = useDomains();

  const loading = citationsLoading || queriesLoading || domainsLoading;

  const stats = getCitationStats();
  const recentActivity = getRecentActivity();

  // Mock visibility data for the chart (replace with real data later)
  const visibilityData = [
    { date: 'Jan 1', score: 35 },
    { date: 'Jan 2', score: 42 },
    { date: 'Jan 3', score: 38 },
    { date: 'Jan 4', score: 51 },
    { date: 'Jan 5', score: 67 },
    { date: 'Jan 6', score: 73 },
    { date: 'Jan 7', score: stats.visibilityScore },
  ];

  const engineData = Object.entries(stats.engineStats).map(([name, value]) => ({
    name,
    value: Math.round((value / stats.total) * 100),
    color: name === 'ChatGPT' ? '#0052CC' : 
           name === 'Perplexity' ? '#00FFE0' : 
           name === 'Gemini' ? '#9333EA' : '#F97316'
  })).filter(item => item.value > 0);

  const metrics = [
    {
      title: 'Visibility Score',
      value: loading ? '...' : stats.visibilityScore.toString(),
      change: '+12',
      changeType: 'positive',
      icon: Eye,
      description: 'Overall citation rate across all engines'
    },
    {
      title: 'Citations This Week',
      value: loading ? '...' : stats.cited.toString(),
      change: '+5',
      changeType: 'positive',
      icon: Target,
      description: 'Brand mentions in AI responses'
    },
    {
      title: 'Queries Tracked',
      value: loading ? '...' : queries.length.toString(),
      change: '+8',
      changeType: 'positive',
      icon: TrendingUp,
      description: 'Active monitoring queries'
    },
    {
      title: 'Domains',
      value: loading ? '...' : domains.length.toString(),
      change: '0',
      changeType: 'neutral',
      icon: Zap,
      description: 'Tracked domains'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="h-16 bg-gray-700 rounded mb-4"></div>
                <div className="h-6 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-gray-400">Track your brand's AI citation performance</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-primary-500">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
          
          <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
            Generate Report
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-primary-500/30 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-primary-500/20 p-2 rounded-lg group-hover:bg-primary-500/30 transition-colors">
                <metric.icon className="w-5 h-5 text-primary-400" />
              </div>
              <button className="text-gray-500 hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-all">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mb-2">
              <h3 className="text-2xl font-bold text-white">{metric.value}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`flex items-center gap-1 text-sm font-medium ${
                  metric.changeType === 'positive' ? 'text-green-400' : 
                  metric.changeType === 'negative' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {metric.changeType === 'positive' ? (
                    <ArrowUp className="w-3 h-3" />
                  ) : metric.changeType === 'negative' ? (
                    <ArrowDown className="w-3 h-3" />
                  ) : null}
                  {metric.change}
                </span>
                <span className="text-gray-500 text-sm">vs last week</span>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm">{metric.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Visibility Score Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Visibility Score Trend</h3>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-accent-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-400">Live</span>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visibilityData}>
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
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#00FFE0"
                  strokeWidth={3}
                  dot={{ fill: '#00FFE0', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#00FFE0', strokeWidth: 2, fill: '#0F111A' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Engine Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-6">AI Engine Distribution</h3>
          
          {engineData.length > 0 ? (
            <>
              <div className="flex items-center justify-center">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={engineData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {engineData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                {engineData.map((engine) => (
                  <div key={engine.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: engine.color }}
                      />
                      <span className="text-gray-300">{engine.name}</span>
                    </div>
                    <span className="text-white font-medium">{engine.value}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">No citation data yet</div>
              <div className="text-sm text-gray-500">Start tracking queries to see engine distribution</div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Recent Activity</h3>
        
        {recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-700/30 transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'positive' ? 'bg-green-400' :
                  activity.status === 'negative' ? 'bg-red-400' : 'bg-accent-500'
                }`} />
                
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-400 text-xs">{activity.engine}</span>
                    <span className="text-gray-500 text-xs">•</span>
                    <span className="text-gray-500 text-xs">{activity.time}</span>
                  </div>
                </div>
                
                <button className="text-accent-500 hover:text-accent-400 text-sm font-medium">
                  View
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">No recent activity</div>
            <div className="text-sm text-gray-500">Citation activity will appear here as your queries are processed</div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MetricsOverview;