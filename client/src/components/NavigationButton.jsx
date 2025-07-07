/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NavigationButton = () => {
  const navigate = useNavigate();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // Check if user can go back (came from another page in our app)
    setCanGoBack(window.history.length > 1);
  }, []);

  const handleNavigation = () => {
    if (canGoBack) {
      navigate(-1); // Go back to previous page
    } else {
      navigate('/'); // Go to home page
    }
  };

  return (
    <motion.div 
      className="w-full px-4 sm:px-6 lg:px-8 pb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className="w-full flex justify-center">
        <motion.button
          onClick={handleNavigation}
          className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.3)"
          }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            className="mr-2"
            animate={{ x: [-2, 0, -2] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <path 
              d={canGoBack ? "M19 12H5M12 19L5 12L12 5" : "M3 12L21 12M3 12L9 18M3 12L9 6"}
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </motion.svg>
          
          <span className="group-hover:tracking-wide transition-all duration-300">
            {canGoBack ? 'Go Back' : 'Go Home'}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default NavigationButton;