/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

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

  const scaleIn = {
    hidden: { 
      scale: 0.8, 
      opacity: 0 
    },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 relative flex items-center justify-center px-4" style={{ minHeight: 'calc(100vh - 210px)' }}>
      {/* Floating particles animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(40)].map((_, i) => {
          const size = Math.random() * 4 + 8;
          const initialX = Math.random() * 100;
          const initialY = Math.random() * 100;
          const moveX = (Math.random() - 0.5) * 80;
          const moveY = (Math.random() - 0.5) * 80;
          const duration = Math.random() * 8 + 6;
          const delay = Math.random() * 3;
          const opacity = Math.random() * 0.08 + 0.3;

          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                left: `${initialX}%`,
                top: `${initialY}%`,
                background: i % 3 === 0 
                  ? 'rgba(59, 130, 246, 0.25)' 
                  : i % 3 === 1 
                  ? 'rgba(147, 51, 234, 0.25)' 
                  : 'rgba(16, 185, 129, 0.25)',
                opacity: opacity
              }}
              animate={{
                x: [0, moveX, 0],
                y: [0, moveY, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: delay
              }}
            />
          );
        })}
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        <motion.div
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={scaleIn}
          className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm"
        >
          {/* Header */}
          <motion.div className="text-center mb-8" variants={fadeInUp}>
            <motion.h1 
              className="text-3xl font-bold text-gray-900 mb-2"
              variants={fadeInUp}
            >
              Join{' '}
              <motion.span 
                className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-4xl"
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
                BloggersPoint
              </motion.span>
            </motion.h1>
            <motion.p 
              className="text-gray-600"
              variants={fadeInUp}
            >
              Create your account and start sharing your stories
            </motion.p>
          </motion.div>

          {/* Google Register Button */}
          <motion.div variants={fadeInUp}>
            <motion.button
              className={`w-full border-2 px-6 py-4 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-3 relative overflow-hidden transition-all duration-300 ${
                agreedToTerms 
                  ? 'bg-gray-700 border-gray-200 text-blue-200 hover:border-blue-500 hover:text-blue-800' 
                  : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
              }`}
              whileHover={agreedToTerms ? { 
                scale: 1.02,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
              } : {}}
              whileTap={agreedToTerms ? { scale: 0.98 } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              disabled={!agreedToTerms}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0"
                whileHover={agreedToTerms ? { opacity: 1 } : {}}
                transition={{ duration: 0.3 }}
              />
              <svg width="20" height="20" viewBox="0 0 24 24" className="relative z-10">
                <path fill={agreedToTerms ? "#4285F4" : "#9CA3AF"} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill={agreedToTerms ? "#34A853" : "#9CA3AF"} d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill={agreedToTerms ? "#FBBC05" : "#9CA3AF"} d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill={agreedToTerms ? "#EA4335" : "#9CA3AF"} d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="relative z-10 ">Create Account with Google</span>
            </motion.button>
          </motion.div>

          {/* Terms and Conditions Checkbox */}
          <motion.div 
            className="mt-6"
            variants={fadeInUp}
          >
            <motion.label 
              className="flex items-start gap-3 cursor-pointer"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <motion.div 
                className="relative mt-1"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="sr-only"
                />
                <motion.div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    agreedToTerms 
                      ? 'bg-blue-600 border-blue-600' 
                      : 'bg-white border-gray-300'
                  }`}
                  animate={{
                    backgroundColor: agreedToTerms ? "#2563eb" : "#ffffff",
                    borderColor: agreedToTerms ? "#2563eb" : "#d1d5db"
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: agreedToTerms ? 1 : 0,
                      opacity: agreedToTerms ? 1 : 0
                    }}
                    transition={{ duration: 0.2, type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <polyline points="20,6 9,17 4,12" />
                  </motion.svg>
                </motion.div>
              </motion.div>
              <span className="text-sm text-gray-600 leading-relaxed">
                I agree to the{' '}
                <motion.span
                  className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/tc')}
                >
                  Terms of Service
                </motion.span>
                {' '}and{' '}
                <motion.span
                  className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/privacy')}
                >
                  Privacy Policy
                </motion.span>
              </span>
            </motion.label>
          </motion.div>

          {/* Divider */}
          <motion.div 
            className="flex items-center my-6"
            variants={fadeInUp}
          >
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-gray-500 text-sm">or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </motion.div>

          {/* Login Link */}
          <motion.div 
            className="text-center"
            variants={fadeInUp}
          >
            <p className="text-gray-600">
              Already have an account?{' '}
              <motion.span
                className="text-blue-600 font-semibold hover:text-blue-700 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/login')}
              >
                Sign in here
              </motion.span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;