import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Globe, 
  X, 
  CheckCircle,
  ExternalLink,
  MoreVertical,
  Trash2,
  Settings
} from 'lucide-react';
import { useDomains } from '../hooks/useDomains';
import { useAuth } from '../contexts/AuthContext';

const DomainManager = () => {
  const { user } = useAuth();
  const { domains, loading, addDomain, deleteDomain } = useDomains();
  const [showAddDomain, setShowAddDomain] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    
    try {
      await addDomain(newDomain);
      setShowAddDomain(false);
      setNewDomain('');
    } catch (error) {
      console.error('Error adding domain:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    if (window.confirm('Are you sure you want to delete this domain? This action cannot be undone.')) {
      await deleteDomain(domainId);
    }
  };

  const planLimits = { free: 1, pro: 5, agency: 10 };
  const currentPlan = user?.profile?.plan || 'free';
  const maxDomains = planLimits[currentPlan];
  const activeDomains = domains.filter(d => d.status === 'active').length;
  const totalCitations = domains.reduce((sum, d) => sum + d.citations_count, 0);
  const pendingDomains = domains.filter(d => d.status === 'pending').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="h-20 bg-gray-700 rounded"></div>
              </div>
            ))}
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
          <h1 className="text-3xl font-bold text-white mb-2">Domain Management</h1>
          <p className="text-gray-400">Manage your tracked domains and websites</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddDomain(true)}
          disabled={domains.length >= maxDomains}
          className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Domain
        </motion.button>
      </div>

      {/* Domain Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-5 h-5 text-primary-400" />
            <span className="text-gray-300 font-medium">Active Domains</span>
          </div>
          <div className="text-3xl font-bold text-white">{activeDomains}</div>
          <div className="text-sm text-gray-400">out of {maxDomains} allowed</div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-gray-300 font-medium">Total Citations</span>
          </div>
          <div className="text-3xl font-bold text-white">{totalCitations}</div>
          <div className="text-sm text-gray-400">across all domains</div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-5 h-5 text-accent-500" />
            <span className="text-gray-300 font-medium">Pending Setup</span>
          </div>
          <div className="text-3xl font-bold text-white">{pendingDomains}</div>
          <div className="text-sm text-gray-400">requires verification</div>
        </div>
      </div>

      {/* Domain List */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Your Domains</h3>
        </div>
        
        {domains.length > 0 ? (
          <div className="divide-y divide-gray-700">
            {domains.map((domain, index) => (
              <motion.div
                key={domain.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-6 hover:bg-gray-700/20 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
                      {domain.favicon_url ? (
                        <img
                          src={domain.favicon_url}
                          alt={`${domain.domain} favicon`}
                          className="w-8 h-8 rounded object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.setAttribute('style', 'display: block');
                          }}
                        />
                      ) : null}
                      <Globe className="w-6 h-6 text-gray-400" style={{ display: domain.favicon_url ? 'none' : 'block' }} />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-semibold text-white">{domain.domain}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          domain.status === 'active' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : domain.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {domain.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                        <span>{domain.queries_count} queries</span>
                        <span>•</span>
                        <span>{domain.citations_count} citations</span>
                        <span>•</span>
                        <span>Last check: {domain.last_check ? new Date(domain.last_check).toLocaleDateString() : 'Never'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="Visit domain"
                      onClick={() => window.open(`https://${domain.domain}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="Domain settings"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete domain"
                      onClick={() => handleDeleteDomain(domain.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Globe className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No domains yet</h3>
            <p className="text-gray-500 mb-4">Add your first domain to start tracking citations</p>
            <button
              onClick={() => setShowAddDomain(true)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
            >
              Add Your First Domain
            </button>
          </div>
        )}
      </div>

      {/* Add Domain Modal */}
      {showAddDomain && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowAddDomain(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Add New Domain</h3>
              <button
                onClick={() => setShowAddDomain(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDomain} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Domain URL
                </label>
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="e.g., yoursite.com"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                  required
                  disabled={isValidating}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Enter without http:// or https://
                </p>
              </div>

              {newDomain && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                      <Globe className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">{newDomain}</div>
                      <div className="text-xs text-gray-400">Domain preview</div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600">
                <div className="text-sm text-gray-300 mb-1">Domain Limit</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all"
                      style={{ width: `${(domains.length / maxDomains) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{domains.length}/{maxDomains}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isValidating || !newDomain || domains.length >= maxDomains}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  {isValidating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Domain'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddDomain(false)}
                  disabled={isValidating}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:cursor-not-allowed"
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

export default DomainManager;