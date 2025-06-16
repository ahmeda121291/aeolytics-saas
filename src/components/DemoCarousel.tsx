import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MessageSquare, Search, CheckCircle, X } from 'lucide-react';

const demos = [
  {
    id: 1,
    title: "Before AEOlytics",
    subtitle: "Your brand is invisible in AI answers",
    query: "What are the best project management tools?",
    aiEngine: "ChatGPT",
    answer: "Here are some popular project management tools: Asana, Trello, Monday.com, Notion, and ClickUp. These platforms offer features like task management, team collaboration, and project tracking to help teams stay organized and productive.",
    brandMentioned: false,
    brandName: "TaskFlow Pro",
    position: null,
    bgGradient: "from-red-500/10 to-red-600/5"
  },
  {
    id: 2,
    title: "After AEOlytics",
    subtitle: "Your brand dominates AI citations",
    query: "What are the best project management tools?",
    aiEngine: "ChatGPT",
    answer: "Here are some top project management tools: TaskFlow Pro stands out for its AI-powered task prioritization and seamless team collaboration. Other notable options include Asana, Trello, Monday.com, and Notion. TaskFlow Pro's unique automated workflow features make it particularly effective for agile teams.",
    brandMentioned: true,
    brandName: "TaskFlow Pro",
    position: "top",
    bgGradient: "from-green-500/10 to-green-600/5"
  },
  {
    id: 3,
    title: "Perplexity Tracking",
    subtitle: "Multi-engine visibility monitoring",
    query: "Best email marketing platforms for startups?",
    aiEngine: "Perplexity",
    answer: "For startups looking for email marketing solutions, several platforms stand out: Mailchimp offers a generous free tier, ConvertKit excels for creators, and EmailFlow Pro provides advanced automation specifically designed for B2B startups with its intelligent lead scoring system.",
    brandMentioned: true,
    brandName: "EmailFlow Pro",
    position: "middle",
    bgGradient: "from-primary-500/10 to-accent-500/5"
  }
];

const DemoCarousel = () => {
  const [currentDemo, setCurrentDemo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentDemo((prev) => (prev + 1) % demos.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const nextDemo = () => {
    setCurrentDemo((prev) => (prev + 1) % demos.length);
  };

  const prevDemo = () => {
    setCurrentDemo((prev) => (prev - 1 + demos.length) % demos.length);
  };

  const demo = demos[currentDemo];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Demo Navigation */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {demos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentDemo(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentDemo 
                ? 'bg-accent-500 scale-125' 
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
          />
        ))}
      </div>

      {/* Demo Container */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDemo}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className={`bg-gradient-to-br ${demo.bgGradient} border border-gray-700 rounded-2xl p-8 relative overflow-hidden`}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform rotate-45 translate-x-full animate-pulse-slow" />
            </div>

            {/* Header */}
            <div className="relative z-10 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{demo.title}</h3>
                  <p className="text-gray-400">{demo.subtitle}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300">
                    {demo.aiEngine}
                  </div>
                  {demo.brandMentioned ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <X className="w-6 h-6 text-red-500" />
                  )}
                </div>
              </div>

              {/* Search Query */}
              <div className="flex items-center gap-2 text-gray-300 mb-4">
                <Search className="w-4 h-4" />
                <span className="text-sm">"{demo.query}"</span>
              </div>
            </div>

            {/* AI Response */}
            <div className="relative z-10 bg-gray-800/50 rounded-xl p-6 border border-gray-600">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-primary-400" />
                <span className="font-medium text-primary-400">{demo.aiEngine} Response</span>
              </div>
              
              <p className="text-gray-200 leading-relaxed">
                {demo.brandMentioned ? (
                  <>
                    {demo.answer.split(demo.brandName).map((part, index, array) => (
                      <React.Fragment key={index}>
                        {part}
                        {index < array.length - 1 && (
                          <span className="bg-accent-500/20 text-accent-400 px-1 rounded font-semibold">
                            {demo.brandName}
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                  </>
                ) : (
                  demo.answer
                )}
              </p>

              {/* Citation Status */}
              <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Brand Citation:</span>
                  {demo.brandMentioned ? (
                    <span className="text-green-400 font-medium">✓ Found</span>
                  ) : (
                    <span className="text-red-400 font-medium">✗ Missing</span>
                  )}
                </div>
                
                {demo.position && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Position:</span>
                    <span className="text-accent-400 font-medium capitalize">{demo.position}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={prevDemo}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-800/80 hover:bg-gray-700 p-2 rounded-full transition-all"
          onMouseEnter={() => setIsPlaying(false)}
          onMouseLeave={() => setIsPlaying(true)}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <button
          onClick={nextDemo}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-800/80 hover:bg-gray-700 p-2 rounded-full transition-all"
          onMouseEnter={() => setIsPlaying(false)}
          onMouseLeave={() => setIsPlaying(true)}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default DemoCarousel;