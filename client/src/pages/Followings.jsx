/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Followings = ({ onClose, uid }) => {
  const [followings, setFollowings] = useState([]);
  const [followingDetails, setFollowingDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const API = import.meta.env.VITE_API;

  useEffect(() => {
    const fetchFollowings = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${API}/social/following?uid=${uid}`);
        
        if (response.data.status === 'success') {
          const followingUids = response.data.following;
          setFollowings(followingUids);

          // Fetch details for each following
          if (followingUids.length > 0) {
            const detailsPromises = followingUids.map(followingUid =>
              axios.get(`${API}/user/name-photo?uid=${followingUid}`)
                .then(res => ({ uid: followingUid, ...res.data }))
                .catch(err => {
                  console.error(`Error fetching details for uid ${followingUid}:`, err);
                  return { uid: followingUid, displayName: 'Unknown User', photoURL: '' };
                })
            );

            const details = await Promise.all(detailsPromises);
            const detailsMap = {};
            details.forEach(detail => {
              detailsMap[detail.uid] = detail;
            });
            setFollowingDetails(detailsMap);
          }
        }
      } catch (err) {
        setError('Failed to load followings. Please try again.');
        console.error('Error fetching followings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowings();
  }, [API, uid]);

  const handleUnfollow = async (followingUid) => {
    try {
      setActionLoading(prev => ({ ...prev, [followingUid]: true }));
      
      await axios.post(`${API}/social/unfollow`, {
        uid,
        unfollowUid: followingUid
      });

      // Update local state
      setFollowings(prev => prev.filter(id => id !== followingUid));
      setFollowingDetails(prev => {
        const updated = { ...prev };
        delete updated[followingUid];
        return updated;
      });
    } catch (err) {
      console.error('Error unfollowing user:', err);
      setError('Failed to unfollow user. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [followingUid]: false }));
    }
  };

  const handleFollow = async (followingUid) => {
    try {
      setActionLoading(prev => ({ ...prev, [followingUid]: true }));
      
      await axios.post(`${API}/social/follow`, {
        uid,
        followUid: followingUid
      });

      // Update local state
      setFollowings(prev => [...prev, followingUid]);
    } catch (err) {
      console.error('Error following user:', err);
      setError('Failed to follow user. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [followingUid]: false }));
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
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
              <h2 className="text-2xl font-bold text-gray-900">Following</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 mt-2">Manage the people you follow</p>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-96">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading followings...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12 px-6">
                <div className="text-red-600 mb-2">{error}</div>
                <button
                  onClick={() => window.location.reload()}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Retry
                </button>
              </div>
            ) : followings.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="text-gray-500 mb-2">You're not following anyone yet</div>
                <p className="text-sm text-gray-400">Start following people to build your network</p>
              </div>
            ) : (
              <div className="p-6">
                {followings.map((followingUid, index) => {
                  const details = followingDetails[followingUid];
                  const isActionLoading = actionLoading[followingUid];
                  
                  return (
                    <motion.div
                      key={followingUid}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          {details?.photoURL ? (
                            <img
                              src={details.photoURL}
                              alt={details.displayName || 'User'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-medium"
                            style={{ display: details?.photoURL ? 'none' : 'flex' }}
                          >
                            {details?.displayName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {details?.displayName || 'Loading...'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            @{followingUid.substring(0, 8)}...
                          </p>
                        </div>
                      </div>

                      <motion.button
                        onClick={() => handleUnfollow(followingUid)}
                        disabled={isActionLoading}
                        className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        whileHover={{ scale: isActionLoading ? 1 : 1.02 }}
                        whileTap={{ scale: isActionLoading ? 1 : 0.98 }}
                      >
                        {isActionLoading && (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                        )}
                        {isActionLoading ? 'Unfollowing...' : 'Unfollow'}
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {followings.length} following
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Followings;