/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { model } from '../firebaseConfig';
import { useNotification } from '../components/Notification';

const AIContentEnhancer = ({ 
  isOpen, 
  onClose, 
  content, 
  onContentUpdated, 
  onEnhancingStateChange,
  user 
}) => {
  const [selectedEnhancements, setSelectedEnhancements] = useState([]);
  const [enhancedContent, setEnhancedContent] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { error } = useNotification();

  const enhancementOptions = [
    { id: 'grammar', label: 'Grammar & Spelling', icon: '✍️', description: 'Fix grammar, spelling, and punctuation errors' },
    { id: 'tone', label: 'Tone Improvement', icon: '🎭', description: 'Enhance the tone and style of writing' },
    { id: 'engagement', label: 'Engagement Boost', icon: '🔥', description: 'Make content more engaging and compelling' },
    { id: 'clarity', label: 'Clarity & Flow', icon: '💎', description: 'Improve readability and logical flow' },
    { id: 'creativity', label: 'Creative Enhancement', icon: '🎨', description: 'Add creative elements and vivid descriptions' }
  ];

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedEnhancements([]);
      setEnhancedContent('');
      setShowPreview(false);
    }
  }, [isOpen]);

  // Update parent component about enhancing state
  useEffect(() => {
    onEnhancingStateChange(isEnhancing);
  }, [isEnhancing, onEnhancingStateChange]);

  const handleEnhancementToggle = (enhancementId) => {
    setSelectedEnhancements(prev => 
      prev.includes(enhancementId) 
        ? prev.filter(id => id !== enhancementId)
        : [...prev, enhancementId]
    );
  };

  const aiEnhancer = async (retry = false) => {
    if (!user || selectedEnhancements.length === 0) return;
    setIsEnhancing(true);    
    try {
      // Build enhancement descriptions based on selected options
    const enhancementDescriptions = selectedEnhancements.map(id => {
      const option = enhancementOptions.find(opt => opt.id === id);
      return option ? option.description.toLowerCase() : '';
    }).filter(desc => desc.length > 0);

    // Create enhancement instructions
    const enhancementInstructions = enhancementDescriptions.join(', ');
    
    // Build the prompt
    let prompt = `You are a professional content editor. Please enhance the following content by focusing on: ${enhancementInstructions}.
${retry ? 'The previous enhancement was not satisfactory to the user. Please try a different approach and provide a fresh perspective on the original content.' : ''}

Original Content:
"${content}"

Instructions:
- Maintain the core message and meaning
- Apply the requested enhancements: ${enhancementInstructions}
- Keep the same general length and structure
- Make the content more polished and professional
- Return only the enhanced content without any additional commentary

Enhanced Content:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const enhancedText = response.text();
    
    // Clean up the response (remove any unwanted prefixes or formatting)
    const cleanedContent = enhancedText
      .replace(/^Enhanced Content:\s*/i, '')
      .replace(/^Here's the enhanced content:\s*/i, '')
      .replace(/^"(.*)"$/s, '$1')
      .trim();
    
    setEnhancedContent(cleanedContent);
    setShowPreview(true);
    } catch (err) {
      console.error('AI Enhancer :: Error enhancing content ::\n', err);
			error("Error enhancing content. Please try again.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleKeepChanges = () => {
    onContentUpdated(enhancedContent);
  };

  const handleRetry = () => {
    setShowPreview(false);
    aiEnhancer(true);
  };

  const handleDiscard = () => {
    setShowPreview(false);
    setEnhancedContent('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                AI{" "} 
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
                Content Enhancer
              </motion.span>
                
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                disabled={isEnhancing}
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-6">
            {!showPreview ? (
              // Enhancement Options
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    What would you like to enhance?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {enhancementOptions.map((option) => (
                      <div key={option.id} className="relative">
                        <button
                          onClick={() => handleEnhancementToggle(option.id)}
                          disabled={isEnhancing}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            selectedEnhancements.includes(option.id)
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          } ${isEnhancing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{option.icon}</span>
                            <div>
                              <h4 className="font-medium text-gray-900">{option.label}</h4>
                              <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                            </div>
                          </div>
                          {selectedEnhancements.includes(option.id) && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm">✓</span>
                            </div>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Original Content Preview */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Content</h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <p className="text-gray-700 whitespace-pre-line">
                      {content.length > 500 ? content.substring(0, 500) + '...' : content}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    disabled={isEnhancing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => aiEnhancer(false)}
                    disabled={isEnhancing || selectedEnhancements.length === 0}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${
                      isEnhancing || selectedEnhancements.length === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transform hover:scale-105'
                    } text-white shadow-lg`}
                  >
                    {isEnhancing ? (
                      <>
                        <span className="inline-block animate-spin mr-2">⚡</span>
                        Enhancing...
                      </>
                    ) : (
                      'Enhance Content'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              // Preview Enhanced Content
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Enhanced Content</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <p className="text-gray-800 whitespace-pre-line">{enhancedContent}</p>
                  </div>
                </div>

                {/* Comparison */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Original Content</h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <p className="text-gray-700 whitespace-pre-line">{content}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleDiscard}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleRetry}
                    className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleKeepChanges}
                    className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
                  >
                    Keep Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AIContentEnhancer;