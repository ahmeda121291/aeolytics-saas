import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Book, 
  HelpCircle, 
  ChevronDown, 
  ChevronRight,
  BarChart3,
  Target,
  Eye,
  FileText,
  Users,
  CreditCard,
  Mail,
  ExternalLink
} from 'lucide-react';

const HelpCenter = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  const categories = [
    {
      id: 'getting-started',
      name: 'Getting Started',
      icon: BarChart3,
      articles: [
        { id: 'gs-1', title: 'What is AEOlytics?', content: 'AEOlytics is an AI-powered citation tracking platform that helps you monitor your brand mentions across ChatGPT, Perplexity, Gemini, and other AI engines. It provides insights, analytics, and strategies to improve your visibility in AI responses.' },
        { id: 'gs-2', title: 'Setting up your first domain', content: 'To set up your first domain, navigate to the Domains tab in your dashboard. Click on "Add Domain" and enter your website URL without http:// or https:// (e.g., yourwebsite.com). AEOlytics will start tracking this domain for citations in AI responses.' },
        { id: 'gs-3', title: 'Creating your first query', content: 'To create your first query, go to the Queries tab and click "Add Query". Enter a search query that your potential customers might ask, and optionally associate it with a domain. You can select which AI engines to track for this query.' }
      ]
    },
    {
      id: 'citations',
      name: 'Citation Tracking',
      icon: Eye,
      articles: [
        { id: 'ct-1', title: 'How citation detection works', content: 'AEOlytics sends your queries to various AI engines and analyzes the responses to detect mentions of your brand or domain. Each citation is tracked for position (top, middle, bottom), confidence score, and the engine it appeared in.' },
        { id: 'ct-2', title: 'Understanding your visibility score', content: 'Your visibility score is the percentage of queries where your brand was cited out of the total queries checked. A higher score indicates better visibility in AI responses. The dashboard breaks this down by engine and provides trends over time.' },
        { id: 'ct-3', title: 'Running citation checks', content: 'To run a citation check, go to the Citations tab and click "Run Citation Check". You can select which queries and engines to process. Results will appear in real-time as they are processed.' }
      ]
    },
    {
      id: 'optimization',
      name: 'Content Optimization',
      icon: FileText,
      articles: [
        { id: 'co-1', title: 'Using Fix-It Briefs', content: 'Fix-It Briefs are AI-generated content recommendations that help improve your citations. They include SEO-optimized titles, meta descriptions, schema markup, and FAQ sections tailored to your specific queries.' },
        { id: 'co-2', title: 'Implementing schema markup', content: 'Schema markup from your Fix-It Briefs should be added to your website\'s HTML. This structured data helps AI engines better understand your content and increases the likelihood of citation.' },
        { id: 'co-3', title: 'Content strategy for AI citations', content: 'To maximize AI citations: 1) Create comprehensive, factual content that directly answers common questions, 2) Use structured data and clear headings, 3) Include FAQ sections, 4) Keep information updated and accurate, 5) Build authority through quality backlinks.' }
      ]
    },
    {
      id: 'teams',
      name: 'Team Collaboration',
      icon: Users,
      articles: [
        { id: 'tc-1', title: 'Setting up your team', content: 'To set up your team, go to the Team Collaboration tab in your dashboard. Click "Create Team" and enter your team name. Once created, you can invite team members and assign roles.' },
        { id: 'tc-2', title: 'User roles and permissions', content: 'AEOlytics offers four roles: Owner (full control), Admin (can manage team members), Editor (can add/edit queries and domains), and Viewer (read-only access). Assign roles based on each team member\'s responsibilities.' },
        { id: 'tc-3', title: 'Inviting team members', content: 'To invite team members, go to the Team Collaboration tab and click "Invite Member". Enter their email address, select a role, and send the invitation. They\'ll receive an email with instructions to join your team.' }
      ]
    },
    {
      id: 'billing',
      name: 'Billing & Subscriptions',
      icon: CreditCard,
      articles: [
        { id: 'bs-1', title: 'Understanding plan limits', content: 'Free plan includes 50 queries/month and 1 domain. Pro plan ($49/mo) includes 1,000 queries/month and 5 domains. Agency plan ($199/mo) includes 10,000 queries/month and 10 domains. Annual plans offer a 20% discount.' },
        { id: 'bs-2', title: 'Managing your subscription', content: 'To manage your subscription, go to the Billing tab in your dashboard. Here you can view your current plan, update payment details, change plans, or cancel your subscription.' },
        { id: 'bs-3', title: 'Payment methods and security', content: 'AEOlytics uses Stripe for secure payment processing. We accept all major credit cards. Your payment information is never stored on our servers and is handled directly by Stripe\'s PCI-compliant infrastructure.' }
      ]
    }
  ];
  
  const faqs = [
    {
      question: "What makes AEOlytics different from traditional SEO tools?",
      answer: "Unlike traditional SEO tools that focus on search engine rankings, AEOlytics specializes in Answer Engine Optimization (AEO) - tracking and improving your visibility in AI-generated responses. We monitor mentions across multiple AI engines, analyze citation positions, and provide AI-specific content optimization."
    },
    {
      question: "Which AI engines does AEOlytics support?",
      answer: "AEOlytics currently supports ChatGPT, Perplexity, and Gemini. Free accounts can track ChatGPT only, while Pro and Agency plans include all engines. We regularly add new engines as they gain market share."
    },
    {
      question: "How often should I run citation checks?",
      answer: "For optimal tracking, we recommend running citation checks weekly. This provides consistent data to identify trends and measure the impact of your content improvements. Pro and Agency plans include scheduled automatic checks."
    },
    {
      question: "How does AEOlytics calculate confidence scores?",
      answer: "Confidence scores measure the strength and clarity of your brand citation in AI responses. Factors include: position in the response, number of mentions, context of mention, and whether your domain is explicitly referenced. Higher scores indicate more prominent citations."
    },
    {
      question: "Can I export my data from AEOlytics?",
      answer: "Yes! AEOlytics allows you to export your data in CSV, JSON, or PDF formats. Go to the Export Center to download citation data, queries, domains, or comprehensive reports for stakeholders."
    }
  ];
  
  const filteredCategories = searchQuery
    ? categories.map(category => ({
        ...category,
        articles: category.articles.filter(article => 
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          article.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.articles.length > 0)
    : categories;
    
  const filteredFaqs = searchQuery
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Help Center</h2>
        <p className="text-gray-400">Find answers, guides, and best practices for using AEOlytics</p>
      </div>
      
      {/* Search */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold text-white mb-4 text-center">How can we help you?</h3>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for guides, tutorials, and FAQs..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>
      </div>
      
      {/* Quick Help Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          className="bg-gray-800/50 border border-gray-700 hover:border-primary-500/50 rounded-xl p-6 transition-all cursor-pointer"
          onClick={() => window.open('https://calendly.com/aeolytics/demo', '_blank')}
        >
          <div className="bg-primary-500/20 p-3 rounded-lg w-fit mb-4">
            <HelpCircle className="w-6 h-6 text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Schedule a Demo</h3>
          <p className="text-gray-400 text-sm">
            Get a personalized walkthrough of AEOlytics with our product experts.
          </p>
          <div className="flex items-center gap-1 text-primary-400 mt-3 text-sm">
            Book now
            <ExternalLink className="w-3 h-3" />
          </div>
        </div>
        
        <div 
          className="bg-gray-800/50 border border-gray-700 hover:border-primary-500/50 rounded-xl p-6 transition-all cursor-pointer"
          onClick={() => window.open('mailto:support@aeolytics.com', '_blank')}
        >
          <div className="bg-accent-500/20 p-3 rounded-lg w-fit mb-4">
            <Mail className="w-6 h-6 text-accent-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Contact Support</h3>
          <p className="text-gray-400 text-sm">
            Need help? Our support team is available to assist you.
          </p>
          <div className="flex items-center gap-1 text-accent-400 mt-3 text-sm">
            Email support
            <ExternalLink className="w-3 h-3" />
          </div>
        </div>
        
        <div 
          className="bg-gray-800/50 border border-gray-700 hover:border-primary-500/50 rounded-xl p-6 transition-all cursor-pointer"
        >
          <div className="bg-green-500/20 p-3 rounded-lg w-fit mb-4">
            <Book className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Resource Library</h3>
          <p className="text-gray-400 text-sm">
            Explore guides, best practices, and case studies.
          </p>
          <div className="flex items-center gap-1 text-green-400 mt-3 text-sm">
            View resources
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>
      
      {/* Help Articles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchQuery ? 'Search Results' : 'Documentation'}
          </h3>
          
          {filteredCategories.length === 0 ? (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
              <HelpCircle className="w-10 h-10 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No results found for "{searchQuery}"</p>
              <p className="text-sm text-gray-500 mt-1">Try using different keywords or browsing the categories</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCategories.map((category) => (
                <div 
                  key={category.id}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
                    className="w-full flex items-center justify-between p-4 text-white hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-700 rounded-lg">
                        <category.icon className="w-4 h-4 text-primary-400" />
                      </div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    {activeCategory === category.id ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  
                  {activeCategory === category.id && (
                    <div className="border-t border-gray-700 divide-y divide-gray-700">
                      {category.articles.map((article) => (
                        <div key={article.id} className="p-4 hover:bg-gray-700/30 transition-colors">
                          <h4 className="font-medium text-white mb-2">{article.title}</h4>
                          <p className="text-sm text-gray-400">{article.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* FAQs */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Frequently Asked Questions</h3>
          
          {filteredFaqs.length === 0 ? (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
              <p className="text-gray-400">No FAQs match your search</p>
            </div>
          ) : (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
              <div className="divide-y divide-gray-700">
                {filteredFaqs.map((faq, index) => (
                  <div key={index}>
                    <button
                      onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/50 transition-colors"
                    >
                      <h4 className="font-medium text-white pr-4">{faq.question}</h4>
                      {activeFaq === index ? (
                        <ChevronDown className="w-5 h-5 flex-shrink-0 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 flex-shrink-0 text-gray-400" />
                      )}
                    </button>
                    
                    {activeFaq === index && (
                      <div className="p-4 bg-gray-700/20 border-t border-gray-700">
                        <p className="text-gray-300">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-6 bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-500/30 rounded-xl p-5">
            <h4 className="font-semibold text-white mb-2">Still need help?</h4>
            <p className="text-gray-300 text-sm mb-4">
              Our support team is ready to assist with any questions you may have.
            </p>
            <button
              onClick={() => window.open('mailto:support@aeolytics.com', '_blank')}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm"
            >
              <Mail className="w-4 h-4" />
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;