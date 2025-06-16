import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Send, 
  Calendar, 
  Settings, 
  Bell,
  Clock,
  Users,
  FileText,
  CheckCircle,
  X,
  Plus
} from 'lucide-react';
import { useEmailReports } from '../hooks/useEmailReports';
import { useAuth } from '../contexts/AuthContext';

const EmailReportCenter = () => {
  const { user } = useAuth();
  const { sending, sendWeeklySummary, setupEmailNotifications, generateWeeklySummary } = useEmailReports();
  const [showSetup, setShowSetup] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [settings, setSettings] = useState({
    email: user?.email || '',
    weeklyReports: true,
    citationAlerts: true,
    performanceReports: false
  });

  const handleSendWeeklyReport = async () => {
    if (!settings.email) return;
    await sendWeeklySummary(settings.email);
  };

  const handlePreview = () => {
    const preview = generateWeeklySummary();
    setPreviewData(preview);
  };

  const handleSaveSettings = async () => {
    await setupEmailNotifications(settings);
    setShowSetup(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Email Reports</h2>
          <p className="text-gray-400">Automated reports and notification settings</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handlePreview}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Preview Report
          </button>
          
          <button
            onClick={() => setShowSetup(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 cursor-pointer"
          onClick={handleSendWeeklyReport}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white">Send Weekly Report</h3>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Generate and send this week's citation performance summary
          </p>
          <button 
            disabled={sending || !settings.email}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send Now
          </button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-500/20 p-2 rounded-lg">
              <Bell className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="font-semibold text-white">Citation Alerts</h3>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Get notified immediately when new citations are found
          </p>
          <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
            settings.citationAlerts 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-gray-600/20 text-gray-400'
          }`}>
            {settings.citationAlerts ? 'Enabled' : 'Disabled'}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-semibold text-white">Scheduled Reports</h3>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Automated weekly performance summaries
          </p>
          <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
            settings.weeklyReports 
              ? 'bg-purple-500/20 text-purple-400' 
              : 'bg-gray-600/20 text-gray-400'
          }`}>
            {settings.weeklyReports ? 'Every Monday' : 'Disabled'}
          </div>
        </motion.div>
      </div>

      {/* Report Templates */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Available Report Templates</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg">
            <FileText className="w-8 h-8 text-blue-400" />
            <div className="flex-1">
              <h4 className="font-medium text-white">Weekly Performance Summary</h4>
              <p className="text-gray-400 text-sm">Citation metrics, visibility scores, and trends</p>
            </div>
            <button 
              onClick={handleSendWeeklyReport}
              disabled={sending}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium transition-all"
            >
              Send
            </button>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg">
            <Bell className="w-8 h-8 text-green-400" />
            <div className="flex-1">
              <h4 className="font-medium text-white">Citation Alerts</h4>
              <p className="text-gray-400 text-sm">Instant notifications for new citations</p>
            </div>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm font-medium">
              Auto
            </span>
          </div>
        </div>
      </div>

      {/* Email Settings Modal */}
      {showSetup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowSetup(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Email Notification Settings</h3>
              <button
                onClick={() => setShowSetup(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Notification Types
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.weeklyReports}
                    onChange={(e) => setSettings(prev => ({ ...prev, weeklyReports: e.target.checked }))}
                    className="w-4 h-4 text-primary-500 border-gray-600 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-gray-300">Weekly Performance Reports</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.citationAlerts}
                    onChange={(e) => setSettings(prev => ({ ...prev, citationAlerts: e.target.checked }))}
                    className="w-4 h-4 text-primary-500 border-gray-600 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-gray-300">Citation Alerts</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.performanceReports}
                    onChange={(e) => setSettings(prev => ({ ...prev, performanceReports: e.target.checked }))}
                    className="w-4 h-4 text-primary-500 border-gray-600 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-gray-300">Monthly Performance Reports</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <button
                onClick={handleSaveSettings}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg font-medium transition-all"
              >
                Save Settings
              </button>
              <button
                onClick={() => setShowSetup(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Report Preview Modal */}
      {previewData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewData(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Weekly Report Preview</h3>
              <button
                onClick={() => setPreviewData(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="bg-white rounded-lg p-6 text-gray-900">
                <h1 className="text-2xl font-bold mb-4">{previewData.subject}</h1>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{previewData.data.visibilityScore}%</div>
                    <div className="text-sm text-gray-600">Visibility Score</div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{previewData.data.citedQueries}</div>
                    <div className="text-sm text-gray-600">Cited Queries</div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{previewData.data.totalCitations}</div>
                    <div className="text-sm text-gray-600">Total Citations</div>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{previewData.data.topEngine}</div>
                    <div className="text-sm text-gray-600">Top Engine</div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Summary</h3>
                  <p className="text-gray-700">
                    This week your brand visibility improved with {previewData.data.citedQueries} queries 
                    receiving citations out of {previewData.data.totalQueries} total tracked queries. 
                    Your strongest performance was on {previewData.data.topEngine}.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default EmailReportCenter;