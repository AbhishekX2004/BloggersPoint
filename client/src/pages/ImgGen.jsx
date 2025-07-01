/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const ImgGen = ({ isOpen, onClose, onImageGenerated, type = 'media', API, user }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    if (!user) {
      setError('You must be logged in to generate images');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await axios.post(`${API}/gen/img`, {
        uid: user.uid,
        prompt: prompt.trim()
      }, {
        responseType: 'blob' // Important for handling image data
      });

      // Create blob URL for preview
      const imageBlob = new Blob([response.data], { type: 'image/jpeg' });
      const imageUrl = URL.createObjectURL(imageBlob);
      setGeneratedImage({ url: imageUrl, blob: imageBlob });

    } catch (error) {
      console.error('Image generation failed:', error);
      
      if (error.response?.status === 429) {
        setError('Daily image generation limit reached. Try again tomorrow!');
      } else if (error.response?.status === 404) {
        setError('User not found. Please try logging in again.');
      } else {
        setError('Failed to generate image. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccept = () => {
    if (generatedImage) {
      // Convert blob to file for upload
      const file = new File([generatedImage.blob], `ai-generated-${Date.now()}.jpg`, { 
        type: 'image/jpeg' 
      });
      
      onImageGenerated(file, type);
      handleClose();
    }
  };

  const handleReject = () => {
    if (generatedImage) {
      URL.revokeObjectURL(generatedImage.url);
    }
    setGeneratedImage(null);
    setError('');
  };

  const handleClose = () => {
    if (generatedImage) {
      URL.revokeObjectURL(generatedImage.url);
    }
    setPrompt('');
    setGeneratedImage(null);
    setError('');
    setIsGenerating(false);
    onClose();
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.2 }
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  🎨 Generate AI Image {type === 'title' ? 'for Title' : 'for Media'}
                </h2>
                <button
                  onClick={handleClose}
                  className="text-white hover:text-gray-200 transition-colors"
                  disabled={isGenerating}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {!generatedImage ? (
                // Prompt Input Phase
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Describe the image you want to generate
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., A serene mountain landscape with a crystal clear lake, sunset colors, photorealistic..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      disabled={isGenerating}
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleClose}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={isGenerating}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating || !prompt.trim()}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                        isGenerating || !prompt.trim()
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
                      } text-white`}
                    >
                      {isGenerating ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Generating...
                        </div>
                      ) : (
                        '✨ Generate Image'
                      )}
                    </button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-600 text-sm">
                      💡 <strong>Tip:</strong> Be specific and descriptive for better results. You have 2 free generations per day.
                    </p>
                  </div>
                </div>
              ) : (
                // Image Preview Phase
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Generated Image</h3>
                    <div className="rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={generatedImage.url}
                        alt="Generated"
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">
                      <strong>Prompt:</strong> {prompt}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleReject}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      🔄 Try Again
                    </button>
                    <button
                      onClick={handleAccept}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all transform hover:scale-105"
                    >
                      ✅ Use This Image
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImgGen;