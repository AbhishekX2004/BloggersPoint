/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ScrollToTop from '../components/ScrollToTop';
import FloatingParticals from '../components/FloatingParticals';
import { auth } from '../firebaseConfig'; 

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);

    // Handle scroll to show/hide scroll indicator
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Hide indicator when user scrolls down more than 100px
      // Show it again when they're back near the top (less than 50px)
      if (scrollY > 100) {
        setShowScrollIndicator(false);
      } else if (scrollY < 50) {
        setShowScrollIndicator(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
        staggerChildren: 0.2
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

  const slideInLeft = {
    hidden: {
      x: -100,
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

  const slideInRight = {
    hidden: {
      x: 100,
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

  const writeABlog = () => {
    const user = auth.currentUser;
    
    if (user) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative">
      {/* Floating particles animation */}
      <FloatingParticals particals={60} />

      {/* Main content with higher z-index */}
      <div className="relative z-10">
        {/* Hero Section */}
        <motion.div
          className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-24"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={staggerChildren}
        >
          <div className="text-center">
            <motion.h1
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
              variants={fadeInUp}
            >
              Welcome to{' '}
              <motion.span
                className="lg:text-6xl text-5xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
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
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto pt-1"
              variants={fadeInUp}
            >
              Join a next-gen blogging platform where AI connects you to the most relevant voices and stories.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center pt-1"
              variants={fadeInUp}
            >
              <motion.button
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg relative overflow-hidden"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <motion.div
                  className="absolute inset-0 bg-white opacity-0"
                  whileHover={{ opacity: 0.1 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => navigate('/explore')}
                />
                Start Reading
              </motion.button>

              <motion.button
                className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold shadow-lg relative overflow-hidden"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                onClick={() => writeABlog()}
              >
                Write a Blog
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll Down Indicator */}
        <motion.div
          className="flex justify-center pt-3 relative z-20"
          initial={{ opacity: 0 }}
          animate={{
            opacity: showScrollIndicator ? 1 : 0,
            y: showScrollIndicator ? 0 : 30
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut"
          }}
        >
          <motion.div
            className="flex flex-col items-center"
            animate={{ y: [8, 0, 8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-gray-500 text-sm mb-3">Scroll for more</span>
            <motion.div className="w-7 h-11 border-2 border-gray-400 rounded-full flex justify-center">
              <motion.div
                className="w-1 h-3 bg-gray-400 rounded-full mt-1"
                animate={{ y: [0, 4, 0], opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerChildren}
        >
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose BloggersPoint?</h2>
            <p className="text-lg text-gray-600">AI-powered blogging platform that amplifies your creativity and connects you with the perfect audience!</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerChildren}
          >
            <motion.div
              className="text-center p-6 bg-white rounded-lg shadow-md relative z-20"
              variants={scaleIn}
              whileHover={{
                y: -10,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div
                className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <span className="text-blue-600 text-3xl">✍️</span>
              </motion.div>
              <h3 className="text-gray-700 text-xl font-semibold mb-3">AI Powered Blogs</h3>
              <p className="text-gray-600">
                Transform your writing instantly with AI. One tap to improve grammar, style, and engagement!
              </p>
            </motion.div>

            <motion.div
              className="text-center p-6 bg-white rounded-lg shadow-md relative z-20"
              variants={scaleIn}
              whileHover={{
                y: -10,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div
                className="w-16 h-16 bg-gradient-to-r from-pink-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <span className="text-pink-600 text-3xl">🎨</span>
              </motion.div>
              <h3 className="text-gray-700 text-xl font-semibold mb-3">Image Generation</h3>
              <p className="text-gray-600">
                Lacking engaging images?<br /> No problem we have got you covered. Generate custom images that perfectly match your content directly inside the platform!
              </p>
            </motion.div>

            <motion.div
              className="text-center p-6 bg-white rounded-lg shadow-md relative z-20"
              variants={scaleIn}
              whileHover={{
                y: -10,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div
                className="w-16 h-16 bg-gradient-to-r from-green-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <span className="text-green-600 text-3xl">👥</span>
              </motion.div>
              <h3 className="text-gray-700 text-xl font-semibold mb-3">Vibrant Community</h3>
              <p className="text-gray-600">
                Join thousands of passionate writers and readers. Share, discover, and grow together!
              </p>
            </motion.div>

            <motion.div
              className="text-center p-6 bg-white rounded-lg shadow-md relative z-20"
              variants={scaleIn}
              whileHover={{
                y: -10,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div
                className="w-16 h-16 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <span className="text-purple-600 text-3xl">🎯</span>
              </motion.div>
              <h3 className="text-gray-700 text-xl font-semibold mb-3">Smart Personalization</h3>
              <p className="text-gray-600">
                AI learns your preferences to curate content you'll love. Discover blogs tailored to your interests!
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Call to Action Section */}
        <motion.div
          className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Animated background elements */}
          <motion.div
            className="absolute inset-0 opacity-10"
            animate={{
              background: [
                "radial-gradient(circle at 20% 50%, #ffffff 0%, transparent 50%)",
                "radial-gradient(circle at 80% 50%, #ffffff 0%, transparent 50%)",
                "radial-gradient(circle at 40% 50%, #ffffff 0%, transparent 50%)"
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10"
            variants={staggerChildren}
          >
            <motion.h2
              className="text-3xl font-bold text-white mb-4"
              variants={slideInLeft}
            >
              Ready to Start Your Blogging Journey?
            </motion.h2>
            <motion.p
              className="text-xl text-blue-100 mb-8"
              variants={slideInRight}
            >
              Join thousands of writers sharing their stories on BloggersPoint
            </motion.p>
            <motion.button
              className="bg-gray-800 px-8 py-3 rounded-lg font-semibold shadow-lg relative overflow-hidden"
              variants={fadeInUp}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onClick={() => navigate('/register')}
            >
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Join Now - It's Free!
              </span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll to top */}
      <ScrollToTop />
    </div>
  );
};

export default LandingPage;