import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
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
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-primary-400" />
              <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
            </div>
            <p className="text-gray-300 mb-6">Last updated: June 17, 2025</p>
            
            <div className="prose prose-invert max-w-none prose-headings:text-white prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline">
              <p>
                At AEOlytics, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
              </p>
              
              <h2>1. Information We Collect</h2>
              <p><strong>Personal Information:</strong></p>
              <ul>
                <li>Account information (name, email, password)</li>
                <li>Billing information (processed by our payment provider)</li>
                <li>Profile information you provide</li>
                <li>Communication data when you contact us</li>
              </ul>
              
              <p><strong>Usage Data:</strong></p>
              <ul>
                <li>Interaction with our platform</li>
                <li>Features and pages accessed</li>
                <li>Time spent on the platform</li>
                <li>Queries and domains you track</li>
                <li>Citation data and analytics</li>
              </ul>
              
              <p><strong>Technical Data:</strong></p>
              <ul>
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Device type</li>
                <li>Operating system</li>
                <li>Referral source</li>
              </ul>
              
              <h2>2. How We Use Your Information</h2>
              <p>We use your information for the following purposes:</p>
              <ul>
                <li>Providing and maintaining our services</li>
                <li>Processing payments and managing subscriptions</li>
                <li>Personalizing your experience</li>
                <li>Analyzing usage patterns to improve our platform</li>
                <li>Communicating with you about your account, updates, or support requests</li>
                <li>Detecting and preventing fraud or abuse</li>
                <li>Complying with legal obligations</li>
              </ul>
              
              <h2>3. How We Share Your Information</h2>
              <p>We may share information in the following circumstances:</p>
              <ul>
                <li>With service providers who perform services on our behalf (hosting, payment processing, analytics)</li>
                <li>With team members you've invited to collaborate on your account</li>
                <li>In response to legal requests or to protect our rights</li>
                <li>In connection with a business transaction (merger, acquisition, or sale)</li>
                <li>With your consent or at your direction</li>
              </ul>
              <p>We do not sell your personal information to third parties.</p>
              
              <h2>4. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, accidental loss, alteration, or disclosure. However, no method of transmission over the Internet or electronic storage is 100% secure.
              </p>
              
              <h2>5. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
              </p>
              <p>
                You can request deletion of your account and associated data at any time through your account settings or by contacting us.
              </p>
              
              <h2>6. Your Rights</h2>
              <p>Depending on your location, you may have the following rights:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your personal information</li>
                <li>Request restriction of processing</li>
                <li>Data portability</li>
                <li>Object to processing</li>
              </ul>
              <p>
                To exercise these rights, please contact us at <a href="mailto:privacy@aeolytics.com">privacy@aeolytics.com</a>.
              </p>
              
              <h2>7. Children's Privacy</h2>
              <p>
                Our Service is not intended for children under 16 years of age. We do not knowingly collect personally identifiable information from children under 16.
              </p>
              
              <h2>8. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. You can set your browser to refuse all or some browser cookies, or to alert you when cookies are being sent.
              </p>
              
              <h2>9. Third-Party Links</h2>
              <p>
                Our Service may contain links to third-party websites or services that are not owned or controlled by AEOlytics. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
              </p>
              
              <h2>10. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than the one in which you reside. These countries may have data protection laws that are different from those in your country.
              </p>
              
              <h2>11. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top.
              </p>
              
              <h2>12. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@aeolytics.com">privacy@aeolytics.com</a>.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;