import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  TrendingUp, 
  Zap, 
  Eye,
  Target,
  FileText,
  BarChart3,
  Clock,
  Bell
} from 'lucide-react';

const features = [
  {
    icon: Search,
    title: "Real-time AI Tracking",
    description: "Monitor your brand mentions across ChatGPT, Perplexity, Gemini, and Copilot in real-time with our AI-powered citation engine.",
    color: "from-blue-500 to-blue-600",
    glowColor: "blue-500/25"
  },
  {
    icon: BarChart3,
    title: "Visibility Scoring & Analytics",
    description: "Get comprehensive visibility scores, trend analysis, and competitor comparisons with intuitive dashboards and sparkline charts.",
    color: "from-purple-500 to-purple-600",
    glowColor: "purple-500/25"
  },
  {
    icon: Zap,
    title: "AI-Powered Fix-It Briefs",
    description: "One-click AI content briefs with meta descriptions, schema markup, and structured FAQ entries to boost your citations.",
    color: "from-accent-500 to-green-500",
    glowColor: "accent-500/25"
  }
];

const additionalFeatures = [
  { icon: Eye, title: "Multi-Engine Monitoring", desc: "Track across 4+ AI platforms" },
  { icon: Target, title: "Competitor Analysis", desc: "See how you stack against rivals" },
  { icon: FileText, title: "Downloadable Reports", desc: "PDF briefs and insights" },
  { icon: Clock, title: "Historical Trends", desc: "7-day sparkline analytics" },
  { icon: Bell, title: "Smart Alerts", desc: "Weekly summaries & Slack integration" },
  { icon: TrendingUp, title: "Citation Optimization", desc: "SEO-optimized content suggestions" }
];

const FeatureShowcase = () => {
  return (
    <section id="features" className="py-20 px-4 bg-gradient-to-b from-dark-900 to-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Built for the AI-first future
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Answer Engine Optimization is the new SEO. Get ahead of the curve with comprehensive 
              AI citation tracking and optimization.
            </p>
          </motion.div>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className={`group relative bg-gradient-to-br ${feature.color} p-8 rounded-2xl hover:shadow-2xl hover:shadow-${feature.glowColor} transition-all duration-300`}
            >
              <div className="relative z-10">
                <feature.icon className="w-12 h-12 text-white mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-white/90 leading-relaxed">{feature.description}</p>
              </div>
              
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            </motion.div>
          ))}
        </div>

        {/* Additional Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700"
        >
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Everything you need to dominate AI search</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-700/50 transition-colors group"
              >
                <div className="bg-primary-500/20 p-2 rounded-lg group-hover:bg-primary-500/30 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureShowcase;