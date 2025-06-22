/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import ScrollToTop from '../components/ScrollToTop';
import NavigationButton from '../components/NavigationButton.jsx';
import FloatingParticals from '../components/FloatingParticals.jsx';

const PrivacyPolicyPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Small delay to ensure proper animation triggering
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Animation variants
  const fadeInUp = {
    hidden: { 
      opacity: 0, 
      y: 60 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const slideInLeft = {
    hidden: { 
      x: -50, 
      opacity: 0 
    },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative">
      {/* Floating particles animation */}
      <FloatingParticals particals={60} />

      {/* Main content */}
      <div className="relative z-10 w-full">
        {/* Header Section */}
        <motion.div 
          className="w-full px-4 sm:px-6 lg:px-8 py-20"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={staggerChildren}
        >
          <div className="w-full text-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              variants={fadeInUp}
            >
              Privacy{' '}
              <motion.span 
                className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundSize: '200% 200%'
                }}
              >
                Policy
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-lg text-gray-600 mb-8"
              variants={fadeInUp}
            >
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </motion.p>
            
            <motion.div 
              className="text-sm text-gray-500"
              variants={fadeInUp}
            >
              Last updated: June 2025
            </motion.div>
          </div>
        </motion.div>

        {/* Content Section */}
        <motion.div 
          className="w-full px-4 sm:px-6 lg:px-8 pb-12"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={staggerChildren}
        >
          <div className="w-full">
            <motion.div 
              className="bg-white rounded-lg shadow-lg p-8 md:p-12 relative z-20"
              variants={fadeInUp}
              whileHover={{ 
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="space-y-8">
                
                <motion.section variants={slideInLeft}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600">🔒</span>
                    </span>
                    Information We Collect
                  </h2>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>We collect information you provide directly to us, such as when you create an account, publish content, or contact us.</p>
                    <p>This includes your name, email address, profile information, and any content you choose to publish.</p>
                    <p>We also collect certain information automatically when you use our service, including device information and usage data.</p>
                  </div>
                </motion.section>

                <motion.section variants={slideInLeft}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600">🎯</span>
                    </span>
                    How We Use Your Information
                  </h2>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>We use the information we collect to provide, maintain, and improve our services.</p>
                    <p>This includes personalizing your experience, enabling you to publish and discover content, and communicating with you.</p>
                    <p>We may also use your information to protect our users and enforce our terms of service.</p>
                  </div>
                </motion.section>

                <motion.section variants={slideInLeft}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600">🤝</span>
                    </span>
                    Information Sharing
                  </h2>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.</p>
                    <p>We may share your information in certain limited circumstances, such as with service providers who help us operate our platform.</p>
                    <p>Your published content is publicly visible by design, as this is the core functionality of our blogging platform.</p>
                  </div>
                </motion.section>

                <motion.section variants={slideInLeft}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-orange-600">🍪</span>
                    </span>
                    Cookies and Tracking
                  </h2>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>We use cookies and similar technologies to enhance your experience and understand how you use our service.</p>
                    <p>You can control cookie settings through your browser, though some features may not work properly if cookies are disabled.</p>
                    <p>We may use third-party analytics tools to help us understand user behavior and improve our service.</p>
                  </div>
                </motion.section>

                <motion.section variants={slideInLeft}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-red-600">🛡️</span>
                    </span>
                    Data Security
                  </h2>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                    <p>However, no method of transmission over the internet or electronic storage is 100% secure.</p>
                    <p>We regularly review and update our security practices to ensure your data is protected.</p>
                  </div>
                </motion.section>

                <motion.section variants={slideInLeft}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-indigo-600">⚖️</span>
                    </span>
                    Your Rights
                  </h2>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>You have the right to access, update, or delete your personal information at any time.</p>
                    <p>You can manage your account settings and privacy preferences through your profile dashboard.</p>
                    <p>If you wish to delete your account, you can do so from your account settings or by contacting us directly.</p>
                  </div>
                </motion.section>

                <motion.section variants={slideInLeft}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-teal-600">👶</span>
                    </span>
                    Children's Privacy
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. 
                    If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
                  </p>
                </motion.section>

                <motion.section variants={slideInLeft}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-pink-600">🔄</span>
                    </span>
                    Changes to This Policy
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page 
                    and updating the "Last updated" date. We encourage you to review this policy periodically.
                  </p>
                </motion.section>

              </div>

              {/* Contact Section */}
              <motion.div 
                className="mt-12 pt-8 border-t border-gray-200"
                variants={fadeInUp}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Us</h3>
                <p className="text-gray-700">
                  If you have any questions about this Privacy Policy, please contact us at{' '}
                  <a href="mailto:privacy@bloggerspoint.com" className="text-blue-600 hover:text-blue-800 transition-colors">
                    privacy@bloggerspoint.com
                  </a>
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll to top */}
      <ScrollToTop />

      {/* Navigation Button */}
      <NavigationButton />
    </div>
  );
};

export default PrivacyPolicyPage;