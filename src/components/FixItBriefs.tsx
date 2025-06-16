import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  Plus,
  Zap,
  CheckCircle,
  Clock,
  Target,
  Code,
  MessageSquare,
  X,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useFixItBriefs } from '../hooks/useFixItBriefs';
import { useQueries } from '../hooks/useQueries';

const FixItBriefs = () => {
  const { briefs, loading, generating, generateBrief, deleteBrief, downloadBrief } = useFixItBriefs();
  const { queries } = useQueries();
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [viewingBrief, setViewingBrief] = useState<any>(null);

  const handleGenerate = async () => {
    if (!selectedQuery) return;
    
    try {
      await generateBrief(selectedQuery, customPrompt || undefined);
      setShowGenerator(false);
      setSelectedQuery('');
      setCustomPrompt('');
    } catch (error) {
      // Error handled by hook
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast here
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="h-32 bg-gray-700 rounded"></div>
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
          <h1 className="text-3xl font-bold text-white mb-2">Fix-It Briefs</h1>
          <p className="text-gray-400">AI-powered content optimization for better citations</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowGenerator(true)}
          disabled={generating || queries.length === 0}
          className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {generating ? 'Generating...' : 'Generate Brief'}
        </motion.button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-primary-400" />
            <span className="text-gray-300 font-medium">Total Briefs</span>
          </div>
          <div className="text-3xl font-bold text-white">{briefs.length}</div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-gray-300 font-medium">Generated</span>
          </div>
          <div className="text-3xl font-bold text-green-400">
            {briefs.filter(b => b.status === 'generated').length}
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Download className="w-5 h-5 text-accent-500" />
            <span className="text-gray-300 font-medium">Downloaded</span>
          </div>
          <div className="text-3xl font-bold text-accent-500">
            {briefs.filter(b => b.status === 'downloaded').length}
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-purple-400" />
            <span className="text-gray-300 font-medium">Implemented</span>
          </div>
          <div className="text-3xl font-bold text-purple-400">
            {briefs.filter(b => b.status === 'implemented').length}
          </div>
        </div>
      </div>

      {/* Briefs Grid */}
      {briefs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {briefs.map((brief, index) => (
            <motion.div
              key={brief.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-primary-500/30 transition-all group"
            >
              {/* Brief Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1 line-clamp-2">
                    {brief.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-2">
                    {brief.query?.query_text || 'Unknown Query'}
                  </p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    brief.status === 'generated' ? 'bg-blue-500/20 text-blue-400' :
                    brief.status === 'downloaded' ? 'bg-accent-500/20 text-accent-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {brief.status}
                  </span>
                </div>
              </div>

              {/* Brief Preview */}
              <div className="space-y-3 mb-4">
                {brief.meta_description && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Meta Description</div>
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {brief.meta_description}
                    </p>
                  </div>
                )}

                {brief.faq_entries && (brief.faq_entries as any[]).length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">FAQ Entries</div>
                    <div className="text-sm text-gray-300">
                      {(brief.faq_entries as any[]).length} questions included
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setViewingBrief(brief)}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  View
                </button>
                
                <button
                  onClick={() => downloadBrief(brief)}
                  className="flex items-center gap-1 px-3 py-1 bg-accent-500/20 hover:bg-accent-500/30 text-accent-400 rounded-lg text-sm transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Download
                </button>

                <button
                  onClick={() => deleteBrief(brief.id)}
                  className="flex items-center gap-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>

              {/* Created Date */}
              <div className="text-xs text-gray-500 mt-3">
                Created {new Date(brief.created_at).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
          <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No Fix-It briefs yet</h3>
          <p className="text-gray-500 mb-6">
            Generate your first AI-powered content brief to improve your citations
          </p>
          <button
            onClick={() => setShowGenerator(true)}
            disabled={queries.length === 0}
            className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all"
          >
            {queries.length === 0 ? 'Add queries first' : 'Generate Your First Brief'}
          </button>
        </div>
      )}

      {/* Generator Modal */}
      {showGenerator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowGenerator(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Generate Fix-It Brief</h3>
              <button
                onClick={() => setShowGenerator(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Query
                </label>
                <select
                  value={selectedQuery}
                  onChange={(e) => setSelectedQuery(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                  required
                >
                  <option value="">Choose a query...</option>
                  {queries.map((query) => (
                    <option key={query.id} value={query.id}>
                      {query.query_text}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Custom Instructions (Optional)
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g., Focus on technical content, include pricing information, target B2B audience..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500 h-20 resize-none"
                />
              </div>

              <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600">
                <div className="text-sm text-gray-300 mb-1">What you'll get:</div>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• SEO-optimized title and meta description</li>
                  <li>• JSON-LD schema markup</li>
                  <li>• Comprehensive content strategy</li>
                  <li>• AI-optimized FAQ section</li>
                  <li>• Downloadable brief format</li>
                </ul>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleGenerate}
                  disabled={generating || !selectedQuery}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Generate Brief
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowGenerator(false)}
                  disabled={generating}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Brief Viewer Modal */}
      {viewingBrief && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setViewingBrief(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Fix-It Brief Details</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadBrief(viewingBrief)}
                  className="bg-accent-500 hover:bg-accent-600 text-dark-900 px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => setViewingBrief(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-8">
                {/* Query Info */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Target Query</h4>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-white font-medium">{viewingBrief.query?.query_text}</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Brief generated on {new Date(viewingBrief.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* SEO Elements */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">SEO Optimization</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-300">Title Tag</label>
                        <button 
                          onClick={() => copyToClipboard(viewingBrief.title)}
                          className="text-gray-400 hover:text-accent-500 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <p className="text-white">{viewingBrief.title}</p>
                      </div>
                    </div>

                    {viewingBrief.meta_description && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-300">Meta Description</label>
                          <button 
                            onClick={() => copyToClipboard(viewingBrief.meta_description)}
                            className="text-gray-400 hover:text-accent-500 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="bg-gray-700/50 rounded-lg p-3">
                          <p className="text-white">{viewingBrief.meta_description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Schema Markup */}
                {viewingBrief.schema_markup && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-white">Schema Markup</h4>
                      <button 
                        onClick={() => copyToClipboard(viewingBrief.schema_markup)}
                        className="text-gray-400 hover:text-accent-500 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-green-400 text-sm">
                        <code>{viewingBrief.schema_markup}</code>
                      </pre>
                    </div>
                  </div>
                )}

                {/* Content Brief */}
                {viewingBrief.content_brief && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Content Strategy</h4>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="text-white whitespace-pre-wrap">{viewingBrief.content_brief}</div>
                    </div>
                  </div>
                )}

                {/* FAQ Entries */}
                {viewingBrief.faq_entries && (viewingBrief.faq_entries as any[]).length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">FAQ Section</h4>
                    <div className="space-y-4">
                      {(viewingBrief.faq_entries as any[]).map((faq, index) => (
                        <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-white">{faq.question}</h5>
                            <button 
                              onClick={() => copyToClipboard(`Q: ${faq.question}\nA: ${faq.answer}`)}
                              className="text-gray-400 hover:text-accent-500 transition-colors ml-2"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-gray-300 mb-2">{faq.answer}</p>
                          {faq.keywords && faq.keywords.length > 0 && (
                            <div className="flex gap-1">
                              {faq.keywords.map((keyword: string, i: number) => (
                                <span key={i} className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-xs">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default FixItBriefs;