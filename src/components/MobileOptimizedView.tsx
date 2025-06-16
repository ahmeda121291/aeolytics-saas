import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Menu, 
  X, 
  BarChart3, 
  Search, 
  Eye, 
  Target,
  Bell,
  Download,
  Settings,
  ChevronRight,
  TrendingUp,
  CheckCircle,
  Plus
} from 'lucide-react';
import { useCitations } from '../hooks/useCitations';
import { useQueries } from '../hooks/useQueries';
import { useAuth } from '../contexts/AuthContext';

const MobileOptimizedView = () => {
  const { user } = useAuth();
  const { getCitationStats } = useCitations();
  const { queries } = useQueries();
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const stats = getCitationStats();

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'citations', label: 'Citations', icon: Eye },
    { id: 'queries', label: 'Queries', icon: Search },
    { id: 'domains', label: 'Domains', icon: Target },
    { id: 'reports', label: 'Reports', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const quickStats = [
    {
      label: 'Visibility Score',
      value: `${stats.visibilityScore}%`,
      icon: Eye,
      color: 'text-primary-400',
      bgColor: 'bg-primary-500/20'
    },
    {
      label: 'Citations Found',
      value: stats.cited.toString(),
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      label: 'Active Queries',
      value: queries.length.toString(),
      icon: Search,
      color: 'text-accent-400',
      bgColor: 'bg-accent-500/20'
    }
  ];

  const recentActivity = [
    { type: 'citation', message: 'New citation found in ChatGPT', time: '2 min ago', positive: true },
    { type: 'query', message: 'Query "best tools" processed', time: '5 min ago', positive: false },
    { type: 'citation', message: 'Cited in Perplexity response', time: '15 min ago', positive: true },
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-white lg:hidden">
      {/* Mobile Header */}
      <header className="bg-gray-800/90 backdrop-blur-lg border-b border-gray-700 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">AEOlytics</h1>
              <p className="text-xs text-gray-400 capitalize">{user?.profile?.plan || 'Free'} Plan</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowMenu(true)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {showMenu && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          onClick={() => setShowMenu(false)}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute right-0 top-0 h-full w-80 bg-gray-800 border-l border-gray-700 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">Menu</h2>
              <button 
                onClick={() => setShowMenu(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setShowMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeTab === item.id
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-8 border-t border-gray-700">
              <div className="text-sm text-gray-400 mb-2">Account</div>
              <div className="text-white font-medium">{user?.profile?.full_name || user?.email}</div>
              <div className="text-accent-400 text-sm capitalize">{user?.profile?.plan || 'Free'} Plan</div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Mobile Content */}
      <main className="p-4 space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 gap-4">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-primary-500 hover:bg-primary-600 text-white p-4 rounded-lg font-medium transition-all flex flex-col items-center gap-2">
              <Plus className="w-5 h-5" />
              <span className="text-sm">Add Query</span>
            </button>
            
            <button className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg font-medium transition-all flex flex-col items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm">Run Check</span>
            </button>
            
            <button className="bg-accent-500 hover:bg-accent-600 text-dark-900 p-4 rounded-lg font-medium transition-all flex flex-col items-center gap-2">
              <Download className="w-5 h-5" />
              <span className="text-sm">Export</span>
            </button>
            
            <button className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg font-medium transition-all flex flex-col items-center gap-2">
              <Target className="w-5 h-5" />
              <span className="text-sm">Add Domain</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.positive ? 'bg-green-400' : 'bg-gray-400'
                }`} />
                
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.message}</p>
                  <p className="text-gray-400 text-xs mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-500/30 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-white mb-3">This Week's Performance</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Visibility Score</span>
              <span className="text-primary-400 font-bold">{stats.visibilityScore}%</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Citations Found</span>
              <span className="text-green-400 font-bold">{stats.cited}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Improvement</span>
              <span className="text-accent-400 font-bold">+12%</span>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-lg border-t border-gray-700 px-4 py-2">
          <div className="flex items-center justify-around">
            {menuItems.slice(0, 4).map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 p-2 transition-colors ${
                  activeTab === item.id ? 'text-primary-400' : 'text-gray-400'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom spacing for fixed navigation */}
        <div className="h-20" />
      </main>
    </div>
  );
};

export default MobileOptimizedView;