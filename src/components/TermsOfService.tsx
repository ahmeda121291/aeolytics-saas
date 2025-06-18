import React from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8">
            <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>
            <p className="text-gray-300 mb-4">Last updated: June 17, 2025</p>
            
            <div className="prose prose-invert max-w-none prose-headings:text-white prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline">
              <p>
                Please read these Terms of Service ("Terms") carefully before using the AEOlytics website and services operated by AEOlytics Inc.
              </p>
              
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing or using our services, you agree to be bound by these Terms and our Privacy Policy. If you disagree with any part of the terms, you do not have permission to access the service.
              </p>
              
              <h2>2. Description of Service</h2>
              <p>
                AEOlytics provides an AI citation tracking and analytics platform that helps businesses monitor and improve their brand mentions across AI search engines.
              </p>
              
              <h2>3. Account Registration and Security</h2>
              <p>
                To use certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
              </p>
              <p>
                You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your account. We encourage you to use "strong" passwords (passwords that use a combination of upper and lower case letters, numbers, and symbols) with your account.
              </p>
              
              <h2>4. Subscriptions and Payments</h2>
              <p>
                Some aspects of the Service are provided on a subscription basis. Payment terms are as follows:
              </p>
              <ul>
                <li>Subscriptions are charged at the beginning of each billing cycle.</li>
                <li>All subscriptions automatically renew unless canceled by the user.</li>
                <li>Cancellations take effect at the end of the current billing period.</li>
                <li>No refunds or credits for partial months of service.</li>
                <li>Subscription fees may change with 30 days prior notice.</li>
              </ul>
              
              <h2>5. Free Trial</h2>
              <p>
                We may offer a free trial period for our Service. At the end of the trial period, you will be automatically charged for the subscription unless you cancel before the trial ends.
              </p>
              
              <h2>6. Content and Data</h2>
              <p>
                You retain all rights to any content you submit, post or display on or through the Service. By making your content available, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such content.
              </p>
              
              <h2>7. API Usage and Rate Limits</h2>
              <p>
                Use of our APIs is subject to rate limitations. Exceeding these limits may result in temporary blocking of your access to the API. We reserve the right to modify these limits at any time.
              </p>
              
              <h2>8. Prohibited Conduct</h2>
              <p>
                You agree not to engage in any of the following prohibited activities:
              </p>
              <ul>
                <li>Violating any laws or regulations</li>
                <li>Impersonating any person or entity</li>
                <li>Interfering with the proper functioning of the Service</li>
                <li>Attempting to access areas of the Service you are not authorized to access</li>
                <li>Reverse engineering or decompiling any part of the Service</li>
                <li>Scraping or harvesting any data from the Service</li>
                <li>Using the Service to transmit malware or viruses</li>
              </ul>
              
              <h2>9. Termination</h2>
              <p>
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
              
              <h2>10. Limitation of Liability</h2>
              <p>
                In no event shall AEOlytics, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, or any other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>
              
              <h2>11. Changes to Terms</h2>
              <p>
                We reserve the right to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms.
              </p>
              
              <h2>12. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at <a href="mailto:legal@aeolytics.com">legal@aeolytics.com</a>.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;