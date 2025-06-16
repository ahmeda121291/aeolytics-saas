import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  TrendingUp, 
  Zap, 
  CheckCircle, 
  ArrowRight, 
  Star,
  Target,
  BarChart3,
  Sparkles,
  Eye,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import PricingSection from './PricingSection';
import FeatureShowcase from './FeatureShowcase';
import DemoCarousel from './DemoCarousel';

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-dark-900 text-dark-100">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/5" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Where does your brand
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500 animate-glow">
                show up in ChatGPT?
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              The first AI-powered analytics platform that tracks your brand citations across 
              ChatGPT, Perplexity, Gemini, and Copilot — then helps you fix it with AI-generated content briefs.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <button 
              onClick={() => navigate('/auth')}
              className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary-500/25 flex items-center gap-2"
            >
              Start Tracking for Free
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button className="border border-gray-600 hover:border-accent-500 text-gray-300 hover:text-accent-500 px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105">
              Watch Demo
            </button>
          </motion.div>

          {/* Live Demo Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 40 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <DemoCarousel />
          </motion.div>
        </div>
      </section>

      {/* Feature Showcase */}
      <FeatureShowcase />

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-dark-900 via-primary-900/10 to-dark-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'AI Engines Tracked', value: '4+', icon: Search },
              { label: 'Citations Analyzed', value: '50K+', icon: Eye },
              { label: 'Brands Monitored', value: '500+', icon: Target },
              { label: 'Fix-It Briefs Generated', value: '2K+', icon: FileText },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6"
              >
                <stat.icon className="w-8 h-8 text-accent-500 mx-auto mb-4" />
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to dominate AI search?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join the brands already winning in the age of Answer Engine Optimization.
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/auth')}
            className="bg-white text-primary-600 px-10 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
          >
            <Sparkles className="w-5 h-5" />
            Start Your Free Trial
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">AEOlytics</span>
            </div>
            
            <div className="text-gray-400 text-sm">
              © 2025 AEOlytics. Built for the AI-first future of search.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;