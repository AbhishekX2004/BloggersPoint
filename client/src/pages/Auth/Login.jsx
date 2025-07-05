/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FloatingParticals from '../../components/FloatingParticals';
import { handleGoogleLogin, getCurrentUser } from './googleOAuth';

const Login = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);

    // Check if the user is already logged in
    const checkAuthState = async () => {
      const user = await getCurrentUser();
      if (user) {
        // User is already logged in, navigate to the profile page
        navigate('/profile');
        window.scrollTo(0, 0);
      }
    };

    checkAuthState();
  }, [navigate]);

  const onGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await handleGoogleLogin(navigate);
      
      if (result.success) {
        navigate('/profile'); 
      }
    } catch (error) {
      setError(error.message);
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className=" bg-gradient-to-br from-blue-50 to-indigo-100 relative flex items-center justify-center px-4" style={{ minHeight: 'calc(100vh - 210px)' }}>
      {/* Floating particles animation */}
      <FloatingParticals particals={50} />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        <motion.div
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={scaleIn}
          className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm w-full max-w-md"
        >
          {/* Header */}
          <motion.div className="text-center mb-8" variants={fadeInUp}>
            <motion.h1 
              className="text-3xl font-bold text-gray-900 mb-2"
              variants={fadeInUp}
            >
              Welcome Back to{' '}
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
              Sign in to continue your blogging journey
            </motion.p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Google Login Button */}
          <motion.div variants={fadeInUp}>
            <motion.button
              onClick={onGoogleLogin}
              disabled={isLoading}
              className={`w-full border-2 border-gray-200 px-6 py-4 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-3 relative overflow-hidden transition-all duration-300 ${
                isLoading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-700 text-blue-200 hover:text-blue-800 hover:border-blue-500'
              }`}
              whileHover={!isLoading ? { 
                scale: 1.02,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
              } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0"
                whileHover={!isLoading ? { opacity: 1 } : {}}
                transition={{ duration: 0.3 }}
              />
              
              {isLoading ? (
                <motion.div
                  className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full relative z-10"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" className="relative z-10">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              
              <span className="relative z-10">
                {isLoading ? 'Signing in...' : 'Continue with Google'}
              </span>
            </motion.button>
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

          {/* Register Link */}
          <motion.div 
            className="text-center"
            variants={fadeInUp}
          >
            <p className="text-gray-600">
              Don't have an account?{' '}
              <motion.span 
                className="text-blue-600 font-semibold hover:text-blue-700 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/register')}
              >
                Sign up here
              </motion.span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;