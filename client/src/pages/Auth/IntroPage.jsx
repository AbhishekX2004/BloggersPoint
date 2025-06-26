import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import axios from 'axios';

const API = import.meta.env.VITE_API;

const IntroPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  // Global array of trendy topics (will be replaced by backend AI)
  const trendyTopics = [
    { id: 1, name: 'Artificial Intelligence', emoji: '🤖', color: 'from-blue-500 to-cyan-500' },
    { id: 2, name: 'Web Development', emoji: '💻', color: 'from-green-500 to-teal-500' },
    { id: 3, name: 'Climate Change', emoji: '🌍', color: 'from-emerald-500 to-green-600' },
    { id: 4, name: 'Mental Health', emoji: '🧠', color: 'from-purple-500 to-pink-500' },
    { id: 5, name: 'Cryptocurrency', emoji: '₿', color: 'from-orange-500 to-red-500' },
    { id: 6, name: 'Space Exploration', emoji: '🚀', color: 'from-indigo-500 to-purple-600' }
  ];

  const steps = [
    {
      title: "What should we call you?",
      subtitle: "Let's personalize your experience"
    },
    {
      title: "What interests you?",
      subtitle: "Pick topics you'd love to read about"
    },
    {
      title: "All set!",
      subtitle: "Let's create your perfect blogging experience"
    }
  ];

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Set display name from Firebase user if available
        setDisplayName(currentUser.displayName || '');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login'); // Adjust the route as needed
    }
  }, [user, authLoading, navigate]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      y: -50,
      transition: { duration: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const handleInterestToggle = (interest) => {
    setSelectedInterests(prev => {
      // Check if interest already exists to ensure uniqueness
      const existingIndex = prev.findIndex(item => item.id === interest.id);
      
      if (existingIndex !== -1) {
        // Remove if already selected
        return prev.filter(item => item.id !== interest.id);
      } else {
        // Add if not already selected
        return [...prev, interest];
      }
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFinish = async () => {
    if (!user) {
      console.error('No authenticated user found');
      return;
    }

    setIsLoading(true);
    
    try {
      // Create unique interests array with just the names
      const uniqueInterests = [...new Set(selectedInterests.map(interest => interest.name))];
      
      const response = await axios.post(`${API}/user/gs`, {
        uid: user.uid,
        displayName: displayName.trim(),
        interests: uniqueInterests
      });
      if (response.status !== 201) {
        throw new Error('Failed to save getting started information');
      }     
      console.log('Setup successful:', response.data);
      navigate('/profile');
    } catch (error) {
      console.error('Setup failed:', error);
      
      // TODO : Show error notification to user
      
      navigate('/profile');
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 0) return displayName.trim().length > 0;
    if (currentStep === 1) return selectedInterests.length > 0;
    return true;
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center">
        <motion.div
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  // Don't render if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-4">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-200 to-orange-200 rounded-full opacity-20"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <motion.div
        className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-2xl relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Progress bar */}
        <motion.div className="mb-8" variants={itemVariants}>
          <div className="flex justify-between items-center mb-4">
            {steps.map((_, index) => (
              <motion.div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  index <= currentStep
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
                animate={{
                  scale: index === currentStep ? 1.2 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                {index + 1}
              </motion.div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Step content */}
        <motion.div
          key={currentStep}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
          className="text-center"
        >
          <motion.h1
            className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
            variants={itemVariants}
          >
            {steps[currentStep].title}
          </motion.h1>
          <motion.p
            className="text-lg text-gray-600 mb-8"
            variants={itemVariants}
          >
            {steps[currentStep].subtitle}
          </motion.p>

          {/* Step 0: Display Name */}
          {currentStep === 0 && (
            <motion.div variants={itemVariants}>
              <motion.input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full max-w-md mx-auto px-6 py-4 text-xl text-center border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Enter your name"
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>
          )}

          {/* Step 1: Interests */}
          {currentStep === 1 && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              variants={containerVariants}
            >
              {trendyTopics.map((topic) => {
                const isSelected = selectedInterests.find(item => item.id === topic.id);
                return (
                  <motion.button
                    key={topic.id}
                    onClick={() => handleInterestToggle(topic)}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      isSelected
                        ? 'border-blue-500 bg-gradient-to-r ' + topic.color + ' text-white shadow-lg'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-3xl mb-2">{topic.emoji}</div>
                    <div className="font-semibold">{topic.name}</div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {/* Step 2: Confirmation */}
          {currentStep === 2 && (
            <motion.div variants={itemVariants} className="space-y-6">
              <motion.div
                className="text-6xl mb-6"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                🎉
              </motion.div>
              <div className="bg-gray-50 rounded-2xl p-6 text-left">
                <h3 className="font-semibold text-gray-800 mb-3">Your Profile Summary:</h3>
                <p className="text-gray-600 mb-3">
                  <strong>Name:</strong> {displayName}
                </p>
                <div className="text-gray-600">
                  <strong>Interests:</strong>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedInterests.map((interest) => (
                      <span
                        key={interest.id}
                        className={`px-3 py-1 rounded-full text-sm text-white bg-gradient-to-r ${interest.color}`}
                      >
                        {interest.emoji} {interest.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Action buttons */}
        <motion.div
          className="flex justify-between items-center mt-8"
          variants={itemVariants}
        >
          <motion.button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
            disabled={currentStep === 0}
            whileHover={currentStep > 0 ? { scale: 1.05 } : {}}
            whileTap={currentStep > 0 ? { scale: 0.95 } : {}}
          >
            Previous
          </motion.button>

          <motion.button
            onClick={currentStep === steps.length - 1 ? handleFinish : handleNext}
            disabled={!canProceed() || isLoading}
            className={`px-8 py-3 rounded-xl font-semibold shadow-lg transition-all ${
              canProceed() && !isLoading
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            whileHover={canProceed() && !isLoading ? { scale: 1.05, y: -2 } : {}}
            whileTap={canProceed() && !isLoading ? { scale: 0.95 } : {}}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Setting up...
              </div>
            ) : currentStep === steps.length - 1 ? (
              "Let's Go!"
            ) : (
              "Next"
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default IntroPage;