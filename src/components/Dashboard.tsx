import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Search,
  Plus,
  Settings,
  Bell,
  User,
  Eye,
  Target,
  Zap,
  ChevronDown,
  Filter,
  Download,
  RefreshCw,
  FileText,
  Mail,
  Activity,
  Smartphone,
  CreditCard,
  CheckCircle,
  X,
  Users
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardHeader from './DashboardHeader';
import MetricsOverview from './MetricsOverview';
import QueryTable from './QueryTable';
import DomainManager from './DomainManager';
import CitationTracker from './CitationTracker';
import FixItBriefs from './FixItBriefs';
import ReportGenerator from './ReportGenerator';
import EmailReportCenter from './EmailReportCenter';
import ExportCenter from './ExportCenter';
import EnhancedAnalytics from './EnhancedAnalytics';
import MobileOptimizedView from './MobileOptimizedView';
import BillingManagement from './BillingManagement';
import SubscriptionStatus from './SubscriptionStatus';
import TeamManagement from './TeamManagement';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [searchParams] = useSearchParams();

  // Handle checkout success/cancel
  useEffect(() => {
    const checkout = searchParams.get('checkout');
    if (checkout === 'success') {
      toast.success('Payment successful! Your subscription is now active.');
    } else if (checkout === 'canceled') {
      toast.error('Payment was canceled. You can try again anytime.');
    }
  }, [searchParams]);

  // Listen for window resize to toggle mobile view
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show mobile optimized view on smaller screens
  if (isMobile) {
    return <MobileOptimizedView />;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'analytics', label: 'Enhanced Analytics', icon: Activity },
    { id: 'citations', label: 'Citations', icon: Eye },
    { id: 'queries', label: 'Queries', icon: Search },
    { id: 'domains', label: 'Domains', icon: Target },
    { id: 'briefs', label: 'Fix-It Briefs', icon: FileText },
    { id: 'reports', label: 'Professional Reports', icon: Download },
    { id: 'email', label: 'Email Reports', icon: Mail },
    { id: 'export', label: 'Data Export', icon: Download },
    { id: 'teams', label: 'Team Collaboration', icon: Users },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-dark-100">
      <DashboardHeader />
      
      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-64 bg-gray-800/50 border-r border-gray-700 min-h-screen p-6"
        >
          {/* Subscription Status */}
          <div className="mb-6">
            <SubscriptionStatus />
          </div>

          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
                {(tab.id === 'briefs' || tab.id === 'analytics' || tab.id === 'email') && (
                  <span className="ml-auto px-2 py-1 bg-accent-500/20 text-accent-400 rounded-full text-xs font-medium">
                    New
                  </span>
                )}
                {tab.id === 'reports' && (
                  <span className="ml-auto px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                    Pro
                  </span>
                )}
                {tab.id === 'teams' && (
                  <span className="ml-auto px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                    Agency
                  </span>
                )}
                {tab.id === 'billing' && (
                  <span className="ml-auto px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                    💳
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Domain Filter */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Filter by Domain</h3>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Domains</option>
              <option value="example.com">example.com</option>
              <option value="mybrand.com">mybrand.com</option>
            </select>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('domains')}
                className="w-full flex items-center gap-2 text-gray-400 hover:text-accent-500 text-sm py-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Domain
              </button>
              <button
                onClick={() => setActiveTab('queries')}
                className="w-full flex items-center gap-2 text-gray-400 hover:text-accent-500 text-sm py-2 transition-colors"
              >
                <Search className="w-4 h-4" />
                New Query
              </button>
              <button
                onClick={() => setActiveTab('citations')}
                className="w-full flex items-center gap-2 text-gray-400 hover:text-accent-500 text-sm py-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Run Citation Check
              </button>
              <button
                onClick={() => setActiveTab('briefs')}
                className="w-full flex items-center gap-2 text-gray-400 hover:text-accent-500 text-sm py-2 transition-colors"
              >
                <Zap className="w-4 h-4" />
                Generate Brief
              </button>
              <button
                onClick={() => setActiveTab('teams')}
                className="w-full flex items-center gap-2 text-gray-400 hover:text-blue-500 text-sm py-2 transition-colors"
              >
                <Users className="w-4 h-4" />
                Manage Team
              </button>
            </div>
          </div>

          {/* Mobile View Toggle (for testing) */}
          <div className="mt-8 pt-8 border-t border-gray-700">
            <button
              onClick={() => setIsMobile(true)}
              className="w-full flex items-center gap-2 text-gray-400 hover:text-accent-500 text-sm py-2 transition-colors"
            >
              <Smartphone className="w-4 h-4" />
              Preview Mobile
            </button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === 'overview' && <MetricsOverview />}
            {activeTab === 'analytics' && <EnhancedAnalytics />}
            {activeTab === 'citations' && <CitationTracker />}
            {activeTab === 'queries' && <QueryTable />}
            {activeTab === 'domains' && <DomainManager />}
            {activeTab === 'briefs' && <FixItBriefs />}
            {activeTab === 'reports' && <ReportGenerator />}
            {activeTab === 'email' && <EmailReportCenter />}
            {activeTab === 'export' && <ExportCenter />}
            {activeTab === 'teams' && <TeamManagement />}
            {activeTab === 'billing' && <BillingManagement />}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;