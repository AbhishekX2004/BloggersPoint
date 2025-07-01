/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Followings = ({ onClose, uid }) => {
  const [followings, setFollowings] = useState([]);
  const [followingDetails, setFollowingDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [userToUnfollow, setUserToUnfollow] = useState(null);
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API;

  // Handle close with following count callback
  const handleClose = () => {
    onClose(followings.length);
  };

  // Handle user navigation
  const handleUserClick = (userId) => {
    navigate(`/public/user/${userId}`);
  };

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

  const handleUnfollowClick = (followingUid) => {
    setUserToUnfollow(followingUid);
    setShowConfirmDialog(true);
  };

  const handleConfirmUnfollow = async () => {
    if (!userToUnfollow) return;

    try {
      setActionLoading(prev => ({ ...prev, [userToUnfollow]: true }));
      
      await axios.post(`${API}/social/unfollow`, {
        uid,
        unfollowUid: userToUnfollow
      });

      // Update local state
      setFollowings(prev => prev.filter(id => id !== userToUnfollow));
      setFollowingDetails(prev => {
        const updated = { ...prev };
        delete updated[userToUnfollow];
        return updated;
      });
    } catch (err) {
      console.error('Error unfollowing user:', err);
      setError('Failed to unfollow user. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [userToUnfollow]: false }));
      setShowConfirmDialog(false);
      setUserToUnfollow(null);
    }
  };

  const handleCancelUnfollow = () => {
    setShowConfirmDialog(false);
    setUserToUnfollow(null);
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

  // Confirmation Dialog Component
  const ConfirmationDialog = () => {
    const userDetails = followingDetails[userToUnfollow];
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-70"
        onClick={handleCancelUnfollow}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 500 }}
          className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Unfollow {userDetails?.displayName || 'this user'}?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              You will no longer see their posts in your feed. You can follow them again anytime.
            </p>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={handleCancelUnfollow}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUnfollow}
                disabled={actionLoading[userToUnfollow]}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading[userToUnfollow] && (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                )}
                {actionLoading[userToUnfollow] ? 'Unfollowing...' : 'Unfollow'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60"
        onClick={handleClose}
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
                onClick={handleClose}
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
                              className="w-full h-full object-cover hover:cursor-pointer"
                              onClick={() => handleUserClick(followingUid)}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-medium hover:cursor-pointer"
                            style={{ display: details?.photoURL ? 'none' : 'flex' }}
                            onClick={() => handleUserClick(followingUid)}
                          >
                            {details?.displayName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 hover:cursor-pointer hover:text-blue-400" onClick={() => handleUserClick(followingUid)}>
                            {details?.displayName || 'Loading...'}
                          </h3>
                        </div>
                      </div>

                      <motion.button
                        onClick={() => handleUnfollowClick(followingUid)}
                        disabled={isActionLoading}
                        className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: isActionLoading ? 1 : 1.02 }}
                        whileTap={{ scale: isActionLoading ? 1 : 0.98 }}
                      >
                        Unfollow
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

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirmDialog && <ConfirmationDialog />}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default Followings;