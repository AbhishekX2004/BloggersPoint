/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from 'firebase/auth';
import FloatingParticals from '../components/FloatingParticals';
import ScrollToTop from '../components/ScrollToTop';
import axios from "axios";
import { useNotification } from '../components/Notification';

const API = import.meta.env.VITE_API;

const BlogPage = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [blogData, setBlogData] = useState(null);
  const [authorData, setAuthorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentsData, setCommentsData] = useState({ comments: [], hasMore: false, nextCursor: null, total: 0 });
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [addingComment, setAddingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const { success, error: errorNotfication, warning, info, addNotification } = useNotification();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  // Format timestamp
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    let past;

    // Handle Firebase timestamp format
    if (timestamp && timestamp._seconds) {
      past = new Date(timestamp._seconds * 1000);
    } else {
      past = new Date(timestamp);
    }

    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  };

  // Check if user needs to login
  const requireAuth = (action) => {
    if (!user) {
      setShowLoginPopup(true);
      return false;
    }
    return true;
  };

  // Handle login popup
  const handleLoginRedirect = () => {
    setShowLoginPopup(false);
    navigate('/login');
  };

  // Fetch blog data
  const fetchBlogData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.get(`${API}/blog`, { params: { blogId } });

      setBlogData(data.blogData);
      setAuthorData({
        uid: data.authorUid,
        author: data.author,
        profilePicURL: data.profilePicURL,
        bio: data.bio,
        followers: data.followers
      });
      setLikes(data.blogData.likes);
      setFollowers(data.followers);
    } catch (error) {
      console.error('Error fetching blog data:', error);
      setError(error.message || 'Failed to fetch blog data');
    } finally {
      setLoading(false);
    }
  };

  // Check initial like status
  const checkLikeStatus = async () => {
    if (!user) return;

    try {
      const { data } = await axios.get(`${API}/blog/checkLike`, {
        params: { uid: user.uid, blogId }
      });
      setIsLiked(data.isLiked);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  // Check initial follow status
  const checkFollowStatus = async () => {
    if (!user || !authorData?.uid) return;

    try {
      const { data } = await axios.get(`${API}/social/checkfollow`, {
        params: { uid: user.uid, authorUid: authorData.uid }
      });
      setIsFollowing(data.isFollowing);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  // Fetch comments
  const fetchComments = async (cursor = null, reset = false) => {
    try {
      setCommentsLoading(true);

      const params = {
        blogId,
        limit: 5,
      };
      if (cursor) params.cursor = cursor;

      const { data } = await axios.get(`${API}/comments`, { params });

      if (reset) {
        setCommentsData(data);
      } else {
        setCommentsData(prev => ({
          ...data,
          comments: [...prev.comments, ...data.comments]
        }));
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Handle like/unlike
  const handleLike = async () => {
    if (!requireAuth('like')) return;

    try {
      const newLikeState = !isLiked;
      const newLikesCount = newLikeState ? likes + 1 : likes - 1;

      // Optimistic update
      setIsLiked(newLikeState);
      setLikes(newLikesCount);

      const endpoint = newLikeState ? 'like' : 'unlike';

      await axios.post(`${API}/blog/${endpoint}`, {
        uid: user.uid,
        blogId
      });

    } catch (error) {
      console.error('Error handling like:', error);
      // Revert on error
      setIsLiked(!isLiked);
      setLikes(likes);
    }
  };

  // Handle follow/unfollow
  const handleFollow = async () => {
    if (!requireAuth('follow')) return;

    try {
      const newFollowState = !isFollowing;
      const newFollowersCount = newFollowState ? followers + 1 : followers - 1;

      // Optimistic update
      setIsFollowing(newFollowState);
      setFollowers(newFollowersCount);

      const endpoint = newFollowState ? 'follow' : 'unfollow';
      const bodyKey = newFollowState ? 'followUid' : 'unfollowUid';

      await axios.post(`${API}/social/${endpoint}`, {
        uid: user.uid,
        [bodyKey]: authorData.uid
      });

    } catch (error) {
      console.error('Error handling follow:', error);
      // Revert on error
      setIsFollowing(!isFollowing);
      setFollowers(followers);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!requireAuth('comment')) return;
    if (!newComment.trim()) return;

    try {
      setAddingComment(true);

      await axios.post(`${API}/comments/create`, {
        uid: user.uid,
        blogId,
        content: newComment
      });

      success("Commented Successfully!");

      setNewComment('');
      await fetchComments(null, true); // Refresh

    } catch (err) {
      console.error('Blogs Page :: Error commenting ::\n', err);
      errorNotfication("Failed to post comment. Please try again.");
    } finally {
      setAddingComment(false);
    }
  };


  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blogData.title,
        text: `Check out this amazing blog post: ${blogData.title}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      info('Link copied to clipboard!');
    }
  };

  // Handle user navigation
  const handleUserClick = (userId) => {
    navigate(`/public/user/${userId}`);
  };

  // Load more comments
  const handleLoadMoreComments = () => {
    if (commentsData.hasMore && commentsData.nextCursor) {
      fetchComments(commentsData.nextCursor, false);
    }
  };

  // Handle image click
  const handleImageClick = (imageSrc) => {
    setEnlargedImage(imageSrc);
  };

  // Close enlarged image
  const closeEnlargedImage = () => {
    setEnlargedImage(null);
  };

  // Render blog content with images
  const renderBlogContent = (content) => {
    const parts = content.split(/!\[.*?\]\((.*?)\)/g);
    const elements = [];

    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        // Text content
        if (parts[i].trim()) {
          elements.push(
            <div key={i} className="prose prose-lg max-w-none mb-6">
              {parts[i].split('\n').map((paragraph, idx) => {
                if (paragraph.startsWith('```')) return null;
                if (paragraph.trim() === '') return <br key={idx} />;
                if (paragraph.startsWith('# ')) return <h1 key={idx} className="text-3xl font-bold mb-4">{paragraph.slice(2)}</h1>;
                if (paragraph.startsWith('## ')) return <h2 key={idx} className="text-2xl font-bold mb-3">{paragraph.slice(3)}</h2>;
                if (paragraph.startsWith('### ')) return <h3 key={idx} className="text-xl font-bold mb-2">{paragraph.slice(4)}</h3>;
                if (paragraph.includes('```javascript')) {
                  const codeMatch = content.match(/```javascript\n([\s\S]*?)\n```/);
                  if (codeMatch) {
                    return (
                      <pre key={idx} className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto mb-4">
                        <code>{codeMatch[1]}</code>
                      </pre>
                    );
                  }
                }
                return <p key={idx} className="mb-4 text-gray-700 leading-relaxed">{paragraph}</p>;
              })}
            </div>
          );
        }
      } else {
        // Image URL
        elements.push(
          <motion.div
            key={i}
            className="mb-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="w-full max-w-md mx-auto h-64 bg-gray-100 rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => handleImageClick(parts[i])}
            >
              <img
                src={parts[i]}
                alt="Blog content"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">Click to enlarge</p>
          </motion.div>
        );
      }
    }
    return elements;
  };

  // Initial data fetch
  useEffect(() => {
    fetchBlogData();
  }, [blogId]);

  // Check like status after blog data is loaded
  useEffect(() => {
    if (blogData) {
      checkLikeStatus();
      fetchComments(null, true);
    }
  }, [blogData, user]);

  // Check follow status after author data is loaded
  useEffect(() => {
    if (authorData?.uid) {
      checkFollowStatus();
    }
  }, [authorData]);

  if (loading || !blogData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-600 text-lg">Loading amazing content...</p>
        </div>
        <div className="fixed inset-0 pointer-events-none z-0">
          <FloatingParticals particals={60} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error ? 'Error loading blog' : 'Blog not found'}
          </h2>
          <p className="text-gray-600 mb-8">
            {error || "The blog post you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => navigate('/explore')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative">
      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <FloatingParticals particals={70} />
      </div>

      {/* Login Popup */}
      {showLoginPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-lg p-8 max-w-md mx-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Login Required</h3>
            <p className="text-gray-600 mb-6">
              You need to be logged in to access this feature. Please log in to continue.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleLoginRedirect}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </button>
              <button
                onClick={() => setShowLoginPopup(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Enlarged Image Modal */}
      {enlargedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={closeEnlargedImage}
        >
          <motion.div
            className="relative max-w-4xl max-h-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={enlargedImage}
              alt="Enlarged view"
              className="max-w-full max-h-full object-contain rounded-lg lg:w-150 lg:h-150"
            />
            <button
              onClick={closeEnlargedImage}
              className="cursor-pointer absolute top-4 right-4 bg-gray-300 bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="black" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        </div>
      )}

      {/* Header */}
      <motion.div
        className="bg-white shadow-sm sticky top-0 z-40"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button
              onClick={() => {
                if (window.history.length > 2) {
                  navigate(-1);
                } else {
                  navigate('/explore');
                }
              }}
              className="mr-4 p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-900 truncate">{blogData.title}</h1>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Blog Content */}
          <motion.div
            className="lg:col-span-2"
            initial="hidden"
            animate="visible"
            variants={fadeInLeft}
          >
            <div className="bg-white rounded-lg shadow-md p-8">
              {/* Title Picture */}
              {blogData.titleURL && (
                <motion.div
                  className="mb-8"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div
                    className="w-full h-80 bg-gray-100 rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
                    onClick={() => handleImageClick(blogData.titleURL)}
                  >
                    <img
                      src={blogData.titleURL}
                      alt={blogData.title}                      
                      className="w-full h-full object-fill"
                      loading="eager"
                    />
                  </div>
                  <p className="text-center text-sm text-gray-500 mt-2">Click to enlarge</p>
                </motion.div>
              )}

              {/* Blog Title */}
              <motion.h1
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
                variants={fadeInUp}
              >
                {blogData.title}
              </motion.h1>

              {/* Tags */}
              {blogData.tags && blogData.tags.length > 0 && (
                <motion.div
                  className="mb-8 pb-6 border-b border-gray-200"
                  variants={fadeInUp}
                >
                  <div className="flex flex-wrap gap-2">
                    {blogData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Blog Content */}
              <motion.div
                className="text-gray-700 leading-relaxed"
                variants={staggerChildren}
                initial="hidden"
                animate="visible"
              >
                {renderBlogContent(blogData.content)}
              </motion.div>

              {/* Media URLs */}
              {blogData.mediaURL && blogData.mediaURL.length > 0 && (
                <motion.div
                  className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
                  variants={staggerChildren}
                  initial="hidden"
                  animate="visible"
                >
                  {blogData.mediaURL.map((url, index) => (
                    <motion.div
                      key={index}
                      className="h-64 bg-gray-100 rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      onClick={() => handleImageClick(url)}
                    >
                      <img
                        src={url}
                        alt={`Blog media ${index + 1}`}
                        className="w-full h-full object-fill"
                        loading="lazy"
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
              {blogData.mediaURL && blogData.mediaURL.length > 0 && (

                <p className="text-center text-sm text-gray-500 mt-2">Click images to enlarge</p>

              )}
            </div>
          </motion.div>

          {/* Right Side - Author Info & Comments */}
          <motion.div
            className="lg:col-span-1 space-y-6"
            initial="hidden"
            animate="visible"
            variants={fadeInRight}
          >
            {/* Author Card */}
            {authorData && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center">
                  {authorData.profilePicURL ? (
                    <img
                      src={authorData.profilePicURL}
                      alt={authorData.author}
                      className="w-20 h-20 rounded-full mx-auto mb-4 cursor-pointer object-cover"
                      onClick={() => handleUserClick(authorData.uid)}
                    />
                  ) : (
                    <div
                      className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 cursor-pointer"
                      onClick={() => handleUserClick(authorData.uid)}
                    >
                      {authorData.author.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h3
                    className="text-xl font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600"
                    onClick={() => handleUserClick(authorData.uid)}
                  >
                    {authorData.author}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {authorData.bio || "Passionate writer sharing insights about technology and life."}
                  </p>
                  <p className="text-gray-500 text-xs mb-4">
                    {followers} followers
                  </p>

                  {/* Follow Button */}
                  {user && authorData.uid !== user.uid && (
                    <motion.button
                      className={`cursor-pointer w-full py-2 px-4 rounded-lg font-medium transition-colors mb-4 ${isFollowing
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      onClick={handleFollow}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isFollowing ? 'Unfollow' : 'Follow'} Author
                    </motion.button>
                  )}

                  {/* Follow Button for non-logged users */}
                  {!user && (
                    <motion.button
                      className="cursor-pointer w-full py-2 px-4 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors mb-4"
                      onClick={() => requireAuth('follow')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Follow Author
                    </motion.button>
                  )}
                </div>

                <div className="flex space-x-3">
                  {/* Like Button for logged in users */}
                  {user && (
                    <motion.button
                      className={`disabled:cursor-not-allowed cursor-pointer flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${isLiked
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-red-50 hover:text-red-600'
                        }`}
                      onClick={handleLike}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={authorData?.uid === user?.uid}
                    >
                      <svg className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="text-sm">{likes}</span>
                    </motion.button>
                  )}

                  {/* Like Button for non-logged users */}
                  {!user && (
                    <motion.button
                      className="cursor-pointer flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-red-50 hover:text-red-600 transition-colors"
                      onClick={() => requireAuth('like')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="text-sm">{likes}</span>
                    </motion.button>
                  )}

                  {/* Share Button */}
                  <motion.button
                    className="cursor-pointer flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={handleShare}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <span className="text-sm">Share</span>
                  </motion.button>
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Comments ({commentsData?.total || 0})
              </h3>

              {/* Add Comment for logged in users */}
              {user && (
                <div className="mb-6">
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Share your thoughts..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={addingComment}
                  />
                  <motion.button
                    className="cursor-pointer mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleCommentSubmit}
                    disabled={!newComment.trim() || addingComment}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {addingComment ? 'Posting...' : 'Post Comment'}
                  </motion.button>
                </div>
              )}

              {/* Add Comment for non-logged users */}
              {!user && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none bg-gray-100 cursor-not-allowed"
                    rows="3"
                    placeholder="Login to share your thoughts..."
                    disabled={true}
                    onClick={() => requireAuth('comment')}
                  />
                  <motion.button
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    onClick={() => requireAuth('comment')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Login to Comment
                  </motion.button>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {commentsData?.comments.map((comment) => (
                  <motion.div
                    key={comment.cid}
                    className="flex space-x-3 p-3 bg-gray-50 rounded-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white text-sm font-semibold cursor-pointer flex-shrink-0"
                      onClick={() => handleUserClick(comment.uid || `user-${comment.cid}`)}
                    >
                      {comment.author?.photoURL ? (
                        <img
                          src={comment.author.photoURL}
                          alt="User"
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        comment.author?.displayName?.charAt(0)?.toUpperCase() || '?'
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span
                          className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                          onClick={() => handleUserClick(comment.uid || `user-${comment.cid}`)}
                        >
                          {comment.author.displayName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </motion.div>
                ))}

                {/* Load More Comments Button */}
                {commentsData?.hasMore && (
                  <motion.button
                    className="cursor-pointer w-full py-2 px-4 text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:cursor-wait"
                    onClick={handleLoadMoreComments}
                    disabled={commentsLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {commentsLoading ? 'Loading...' : 'Show more comments'}
                  </motion.button>
                )}

                {(!commentsData?.comments || commentsData.comments.length === 0) && !commentsLoading && (
                  <p className="text-gray-500 text-center py-4">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <ScrollToTop />
    </div>
  );
};

export default BlogPage;