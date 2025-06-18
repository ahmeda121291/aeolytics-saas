import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle,
  Search,
  Globe,
  BarChart3,
  Target,
  Eye,
  X,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface OnboardingWizardProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ 
  onComplete, 
  onSkip 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(true);
  const [domain, setDomain] = useState('');
  const [query, setQuery] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Show welcome animation for 2 seconds
    const timer = setTimeout(() => {
      setShowWelcomeAnimation(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const steps = [
    {
      title: "Welcome to AEOlytics",
      description: "The AI citation tracking platform that helps you monitor your brand presence across ChatGPT, Perplexity, and Gemini.",
      image: <BarChart3 className="w-20 h-20 text-primary-400" />,
      showSkip: true
    },
    {
      title: "Add Your First Domain",
      description: "Start by adding a domain you want to track. This can be your company website or any domain you want to monitor for citations.",
      component: (
        <div className="w-full mt-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Domain URL
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g., yoursite.com"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary-500"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Enter without http:// or https://
          </p>
        </div>
      ),
      showSkip: true
    },
    {
      title: "Create Your First Query",
      description: "Enter a query that your potential customers might ask. We'll track if your brand is mentioned in AI responses.",
      component: (
        <div className="w-full mt-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Query Text
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., best project management tools"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary-500"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Use queries your target audience might search for
          </p>
        </div>
      ),
      showSkip: true
    },
    {
      title: "Set Up Your Dashboard",
      description: "Your dashboard is now configured! Here's what you can do next to get the most out of AEOlytics:",
      component: (
        <div className="w-full mt-4 space-y-4">
          <div className="flex items-start gap-3 bg-gray-700/50 p-4 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <p className="font-medium text-white">Run Citation Checks</p>
              <p className="text-sm text-gray-400">
                Process your queries to see if your brand is being cited
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 bg-gray-700/50 p-4 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <p className="font-medium text-white">Generate Fix-It Briefs</p>
              <p className="text-sm text-gray-400">
                Get AI-powered recommendations to improve your citations
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 bg-gray-700/50 p-4 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <p className="font-medium text-white">Set Up Your Team</p>
              <p className="text-sm text-gray-400">
                Invite team members to collaborate on your AEOlytics account
              </p>
            </div>
          </div>
        </div>
      ),
      showSkip: false
    }
  ];
  
  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      handleComplete();
    } else {
      setCurrentStep(prevStep => prevStep + 1);
    }
  };
  
  const handleBack = () => {
    setCurrentStep(prevStep => Math.max(0, prevStep - 1));
  };
  
  const handleComplete = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    if (onComplete) {
      onComplete();
    } else {
      navigate('/dashboard');
    }
  };
  
  const handleSkip = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    if (onSkip) {
      onSkip();
    } else {
      navigate('/dashboard');
    }
  };
  
  if (showWelcomeAnimation) {
    return (
      <div className="fixed inset-0 bg-dark-900 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div 
            className="w-24 h-24 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
            animate={{ 
              rotate: [0, 10, 0, -10, 0],
              scale: [1, 1.1, 1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "mirror"
            }}
          >
            <BarChart3 className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to AEOlytics</h1>
          <p className="text-gray-400">Your AI citation tracking platform</p>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-2xl overflow-hidden"
      >
        {/* Header with close button */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">AEOlytics Setup</h3>
          </div>
          
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          
          {/* Step Content */}
          <div className="min-h-[400px] flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <div className="flex flex-col items-center text-center mb-8">
                  {steps[currentStep].image}
                  <h2 className="text-2xl font-bold text-white mt-6 mb-3">{steps[currentStep].title}</h2>
                  <p className="text-gray-400 max-w-md">{steps[currentStep].description}</p>
                </div>
                
                {steps[currentStep].component}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex justify-between items-center p-6 border-t border-gray-700">
          <div>
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {steps[currentStep].showSkip && (
              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Skip
              </button>
            )}
            
            <button
              onClick={handleNext}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <Zap className="w-4 h-4" />
                  Get Started
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingWizard;