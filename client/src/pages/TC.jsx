/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import ScrollToTop from '../components/ScrollToTop';
import NavigationButton from '../components/NavigationButton.jsx';
import FloatingParticals from '../components/FloatingParticals.jsx';

const TermsConditionsPage = () => {
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
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              variants={fadeInUp}
            >
              Terms &{' '}
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
                Conditions
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-lg text-gray-600 mb-8"
              variants={fadeInUp}
            >
              Please read these terms and conditions carefully before using our service.
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
          <motion.div 
            className="bg-white rounded-lg shadow-lg p-8 md:p-12 relative z-20 w-full"
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
                      <span className="text-blue-600 font-bold">1</span>
                    </span>
                    Acceptance of Terms
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    By accessing and using BloggersPoint, you accept and agree to be bound by the terms and provision of this agreement. 
                    If you do not agree to abide by these terms, please do not use this service.
                  </p>
                </motion.section>

                <motion.section variants={slideInLeft}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600 font-bold">2</span>
                    </span>
                    User Accounts
                  </h2>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times.</p>
                    <p>You are responsible for safeguarding the password and for maintaining the confidentiality of your account.</p>
                    <p>You agree not to disclose your password to any third party and to take sole responsibility for activities under your account.</p>
                  </div>
                </motion.section>

                <motion.section variants={slideInLeft}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600 font-bold">3</span>
                    </span>
                    Content Guidelines
                  </h2>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>Users are responsible for the content they publish on BloggersPoint.</p>
                    <p>Content must not violate any applicable laws or regulations.</p>
                    <p>We reserve the right to remove any content that violates our community guidelines.</p>
                    <p>Users retain ownership of their original content but grant us a license to display and distribute it.</p>
                  </div>
                </motion.section>

                <motion.section variants={slideInLeft}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-orange-600 font-bold">4</span>
                    </span>
                    Prohibited Uses
                  </h2>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>You may not use our service for any unlawful purpose or to solicit others to perform unlawful acts.</p>
                    <p>You may not violate any international, federal, provincial, or state regulations, rules, or laws.</p>
                    <p>You may not transmit or distribute any content that is harmful, offensive, or inappropriate.</p>
                  </div>
                </motion.section>

                <motion.section variants={slideInLeft}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-red-600 font-bold">5</span>
                    </span>
                    Limitation of Liability
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    In no event shall BloggersPoint, nor its directors, employees, partners, agents, suppliers, or affiliates, 
                    be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the service.
                  </p>
                </motion.section>

                <motion.section variants={slideInLeft}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-indigo-600 font-bold">6</span>
                    </span>
                    Changes to Terms
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    We reserve the right to modify or replace these terms at any time. If a revision is material, 
                    we will try to provide at least 30 days notice prior to any new terms taking effect.
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
                  If you have any questions about these Terms and Conditions, please contact us at{' '}
                  <a href="mailto:legal@bloggerspoint.com" className="text-blue-600 hover:text-blue-800 transition-colors">
                    legal@bloggerspoint.com
                  </a>
                </p>
              </motion.div>
            </motion.div>
        </motion.div>
      </div>

      {/* Scroll to top */}
      <ScrollToTop />

      {/* Navigation Button */}
      <NavigationButton />
    </div>
  );
};

export default TermsConditionsPage;