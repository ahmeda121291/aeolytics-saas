import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">AEOlytics</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
            <a href="#demo" className="text-gray-300 hover:text-white transition-colors">Demo</a>
            <a href="#docs" className="text-gray-300 hover:text-white transition-colors">Docs</a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => navigate('/auth')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/auth')}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-all"
            >
              Start Free Trial
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden mt-4 pb-4 border-t border-gray-800 pt-4"
          >
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              <a href="#demo" className="text-gray-300 hover:text-white transition-colors">Demo</a>
              <a href="#docs" className="text-gray-300 hover:text-white transition-colors">Docs</a>
              <hr className="border-gray-800" />
              <button 
                onClick={() => navigate('/auth')}
                className="text-gray-300 hover:text-white transition-colors text-left"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-all text-left"
              >
                Start Free Trial
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header;