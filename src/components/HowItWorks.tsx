import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  TrendingUp, 
  FileText, 
  Eye,
  Target,
  Zap,
  CheckCircle,
  ArrowRight,
  Play,
  Pause,
  MessageSquare,
  BarChart3,
  AlertTriangle
} from 'lucide-react';

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const steps = [
    {
      id: 'setup',
      title: 'Setup Your Brand',
      subtitle: 'Connect your domains and queries',
      icon: Target,
      description: 'Add your domains and create queries that your customers typically ask. Our AI will monitor how your brand appears in responses.',
      features: ['Domain tracking', 'Query management', 'Brand keyword setup'],
      visual: {
        type: 'dashboard',
        data: {
          domains: ['yoursite.com', 'yourstore.com'],
          queries: ['best project management tools', 'top CRM software'],
          status: 'active'
        }
      }
    },
    {
      id: 'monitor',
      title: 'AI Engine Monitoring',
      subtitle: 'Track citations across all AI platforms',
      icon: Eye,
      description: 'We query ChatGPT, Perplexity, and Gemini with your questions and analyze if your brand gets mentioned in the responses.',
      features: ['ChatGPT tracking', 'Perplexity monitoring', 'Gemini analysis'],
      visual: {
        type: 'ai-responses',
        data: {
          chatgpt: { cited: true, position: 'top' },
          perplexity: { cited: false, position: null },
          gemini: { cited: true, position: 'middle' }
        }
      }
    },
    {
      id: 'analyze',
      title: 'Visibility Analytics',
      subtitle: 'Get actionable insights and scores',
      icon: BarChart3,
      description: 'Our platform calculates your visibility score, tracks trends, and identifies opportunities to improve your AI citations.',
      features: ['Visibility scoring', 'Trend analysis', 'Position tracking'],
      visual: {
        type: 'analytics',
        data: {
          visibilityScore: 73,
          trend: 'up',
          citations: 142,
          improvements: 5
        }
      }
    },
    {
      id: 'optimize',
      title: 'Fix-It Briefs',
      subtitle: 'AI-powered content optimization',
      icon: FileText,
      description: 'Get detailed briefs with meta descriptions, schema markup, and FAQ sections designed to improve your AI citations.',
      features: ['SEO optimization', 'Schema markup', 'FAQ generation'],
      visual: {
        type: 'brief',
        data: {
          title: 'Complete Guide to Project Management',
          sections: ['Meta description', 'Schema markup', 'FAQ entries'],
          status: 'generated'
        }
      }
    }
  ];

  React.useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, steps.length]);

  const renderVisual = (step: typeof steps[0]) => {
    switch (step.visual.type) {
      case 'dashboard':
        return (
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-400 text-sm">Dashboard Active</span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-400 mb-1">Tracked Domains</div>
                {step.visual.data.domains.map((domain: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-white">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    {domain}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Active Queries</div>
                {step.visual.data.queries.map((query: string, i: number) => (
                  <div key={i} className="text-sm text-gray-300 mb-1">
                    "{query}"
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'ai-responses':
        return (
          <div className="space-y-3">
            {Object.entries(step.visual.data).map(([engine, data]: [string, any]) => (
              <div key={engine} className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-accent-500" />
                    <span className="text-white font-medium capitalize">{engine}</span>
                  </div>
                  {data.cited ? (
                    <div className="flex items-center gap-1 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs">Cited ({data.position})</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-xs">Not mentioned</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'analytics':
        return (
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-primary-400 mb-1">
                {step.visual.data.visibilityScore}%
              </div>
              <div className="text-xs text-gray-400">Visibility Score</div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-white">{step.visual.data.citations}</div>
                <div className="text-xs text-gray-400">Citations</div>
              </div>
              <div>
                <div className="text-lg font-bold text-accent-500">{step.visual.data.improvements}</div>
                <div className="text-xs text-gray-400">Opportunities</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400">Trending up</span>
            </div>
          </div>
        );
      
      case 'brief':
        return (
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-accent-500" />
              <span className="text-white font-medium">{step.visual.data.title}</span>
            </div>
            <div className="space-y-2">
              {step.visual.data.sections.map((section: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="text-sm text-gray-300">{section}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs text-center">
              {step.visual.data.status}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Extract the current step's icon component
  const CurrentStepIcon = steps[activeStep].icon;

  return (
    <section id="how-it-works" className="py-20 px-4 bg-gradient-to-b from-gray-900 to-dark-900">
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
              How AEOlytics Works
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              From setup to optimization, see how our platform helps you dominate AI search results
            </p>
          </motion.div>
        </div>

        {/* Step Navigation */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-4 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2 border border-gray-700">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <button
                  key={step.id}
                  onClick={() => {
                    setActiveStep(index);
                    setIsAutoPlaying(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeStep === index
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <StepIcon className="w-5 h-5" />
                  <span className="hidden sm:block font-medium">{step.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Auto-play Control */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all text-gray-300 hover:text-white"
          >
            {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isAutoPlaying ? 'Pause' : 'Play'} Demo
          </button>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            {/* Text Content */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-500/20 rounded-2xl flex items-center justify-center">
                  <CurrentStepIcon className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <div className="text-sm text-primary-400 font-medium">
                    Step {activeStep + 1} of {steps.length}
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {steps[activeStep].title}
                  </h3>
                </div>
              </div>

              <div>
                <h4 className="text-xl text-accent-500 font-semibold mb-3">
                  {steps[activeStep].subtitle}
                </h4>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {steps[activeStep].description}
                </p>
              </div>

              <div className="space-y-3">
                <h5 className="text-white font-medium">Key Features:</h5>
                {steps[activeStep].features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-accent-500" />
                    <span className="text-gray-300">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {activeStep < steps.length - 1 && (
                <button
                  onClick={() => setActiveStep(activeStep + 1)}
                  className="flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium transition-colors"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Visual Content */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700"
              >
                {renderVisual(steps[activeStep])}
              </motion.div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-accent-500/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-primary-500/20 rounded-full blur-lg"></div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress Indicator */}
        <div className="flex justify-center mt-12">
          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === activeStep
                    ? 'w-8 bg-primary-500'
                    : index < activeStep
                    ? 'w-2 bg-accent-500'
                    : 'w-2 bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to start tracking your AI citations?
          </h3>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join hundreds of brands already using AEOlytics to dominate AI search results
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const element = document.getElementById('pricing');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:shadow-lg hover:shadow-primary-500/25 flex items-center gap-2 mx-auto"
          >
            <Zap className="w-5 h-5" />
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;