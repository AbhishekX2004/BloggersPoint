/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Interests = ({ onClose, uid }) => {
  const [allTags, setAllTags] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const API = import.meta.env.VITE_API;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tags using the new endpoint
        const fetchAvailableTags = async () => {
          try {
            const response = await axios.post(`${import.meta.env.VITE_GET_TAGS}`, {
              data: {},
            });
            const result = response.data.result;
            if (result.success) {
              return result.tags;
            }
            throw new Error('Failed to fetch tags');
          } catch (error) {
            console.error("Interests :: Error fetching available tags ::\n", error);
            throw error;
          }
        };

        // Fetch user interests
        const fetchUserInterests = async () => {
          try {
            const response = await axios.get(`${API}/user/interests?uid=${uid}`);
            if (response.data.status === 'success') {
              return response.data.interests;
            }
            throw new Error('Failed to fetch user interests');
          } catch (error) {
            console.error("Interests :: Error fetching user interests ::\n", error);
            throw error;
          }
        };

        // Fetch both in parallel
        const [tags, interests] = await Promise.all([
          fetchAvailableTags(),
          fetchUserInterests()
        ]);

        setAllTags(tags);
        setSelectedInterests(interests);
      } catch (err) {
        setError('Failed to load data. Please try again.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API, uid]);

  const toggleInterest = (tag) => {
    setSelectedInterests(prev => {
      if (prev.includes(tag)) {
        return prev.filter(interest => interest !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      await axios.post(`${API}/user/interests`, {
        uid,
        interests: selectedInterests
      });

      onClose();
    } catch (err) {
      setError('Failed to save interests. Please try again.');
      console.error('Error saving interests:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 500 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Select Your Interests</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                disabled={saving}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 mt-2">Choose topics you're interested in to personalize your experience</p>
          </div>

          {/* Error/Retry/Rendering */}
          <div className="p-6 overflow-y-auto max-h-96">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading interests...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-600 mb-2">{error}</div>
                <button
                  onClick={() => window.location.reload()}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {allTags.map((tag, index) => (
                  <motion.button
                    key={tag}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => toggleInterest(tag)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                      selectedInterests.includes(tag)
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {tag}
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className=" p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedInterests.length} interest{selectedInterests.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={saving}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleSave}
                  disabled={saving || loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  whileHover={{ scale: saving ? 1 : 1.02 }}
                  whileTap={{ scale: saving ? 1 : 0.98 }}
                >
                  {saving && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {saving ? 'Saving...' : 'Save Interests'}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Interests;