/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ScrollToTop from '../components/ScrollToTop';
import FloatingParticals from '../components/FloatingParticals';

// API
const API = import.meta.env.VITE_API;

const Explore = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    range: '', // 'today', 'this-week', 'this-month', 'past-3months', 'this-year'
    date: '', // specific date in YYYY-MM-DD format
    author: '', // author display name
    tags: [], // array of tags
    sortBy: 'latest' // 'latest', 'oldest', 'most-popular', 'most-commented'
  });
  
  const navigate = useNavigate();
  const observerRef = useRef();

  // Get user ID from localStorage/context (if available)
  const getUserId = () => {
    // Replace with your actual user authentication logic
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).uid : null;
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  // Format timestamp to relative time
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

  // Fetch blogs from API
  const fetchBlogs = async (cursorValue = null, reset = false) => {
    try {
      if (reset || cursorValue === null) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // Prepare API parameters according to the backend API
      const params = {
        limit: 10,
        cursor: cursorValue,
        sortBy: filters.sortBy,
      };

      // Add user ID if available (for personalization)
      const userId = getUserId();
      if (userId) {
        params.uid = userId;
      }

      // Add filters only if they have values
      if (filters.range) {
        params.range = filters.range;
      }
      
      if (filters.date) {
        params.date = filters.date;
      }
      
      if (filters.author) {
        params.author = filters.author;
      }
      
      if (filters.tags && filters.tags.length > 0) {
        params.tags = filters.tags;
      }

      // Make API call
      const response = await axios.get(`${API}/explore/blogs`, { params });
      
      const responseData = response.data;
      
      if (!responseData.success) {
        throw new Error('Failed to fetch blogs');
      }
      
      const { blogs: newBlogs, hasMore: apiHasMore, nextCursor } = responseData;
      
      if (reset || cursorValue === null) {
        setBlogs(newBlogs || []);
      } else {
        setBlogs(prev => [...prev, ...(newBlogs || [])]);
      }
      
      setHasMore(apiHasMore || false);
      setCursor(nextCursor);
      
    } catch (error) {
      console.error('Error fetching blogs:', error);
      if (reset || cursorValue === null) {
        setBlogs([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Infinite scroll observer
  const lastBlogElementRef = useCallback(node => {
    if (loading || loadingMore || !hasMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        fetchBlogs(cursor, false);
      }
    }, {
      rootMargin: '200px'
    });
    
    if (node) observerRef.current.observe(node);
  }, [loading, loadingMore, hasMore, cursor]);

  // Initial load and when filters change
  useEffect(() => {
    setCursor(null);
    fetchBlogs(null, true);
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle tag input
  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const newTag = e.target.value.trim();
      if (!filters.tags.includes(newTag)) {
        handleFilterChange('tags', [...filters.tags, newTag]);
      }
      e.target.value = '';
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    handleFilterChange('tags', filters.tags.filter(tag => tag !== tagToRemove));
  };

  // Navigation handlers
  const handleBlogClick = (blogId) => {
    navigate(`/blogs/${blogId}`);
  };

  const handleUserClick = (userId) => {
    navigate(`/public/user/${userId}`);
  };

  // Action handlers
  const handleShare = (blogId) => {
    console.log('Share blog:', blogId);
  };

  const handleLike = (blogId) => {
    console.log('Like blog:', blogId);
  };

  const handleComment = (blogId) => {
    navigate(`/blogs/${blogId}`);
  };

  const BlogCard = ({ blog, index }) => (
    <motion.div
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 relative z-20"
      variants={fadeInUp}
      ref={index === blogs.length - 3 ? lastBlogElementRef : null}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Header with Author Info */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center space-x-3">
          {blog.profilePictureURL ? (
            <img
              className="w-8 h-8 rounded-full cursor-pointer object-cover"
              src={blog.profilePictureURL}
              referrerPolicy='no-referrer'
              alt={blog.author + "'s profile picture"}
              onClick={() => handleUserClick(blog.uid)}
            />
          ) : (
            <div 
              className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer text-sm"
              onClick={() => handleUserClick(blog.uid)}
            >
              {blog.author?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p 
              className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 text-sm"
              onClick={() => handleUserClick(blog.uid)}
            >
              {blog.author}
            </p>
            <p className="text-xs text-gray-500">{formatTimeAgo(blog.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button className="p-1 hover:bg-gray-100 rounded-full">
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-2">
        <h3 
          className="text-base font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600 line-clamp-2"
          onClick={() => handleBlogClick(blog.id)}
        >
          {blog.title}
        </h3>
        <p 
          className="text-gray-600 text-sm line-clamp-3 cursor-pointer mb-3"
          onClick={() => handleBlogClick(blog.id)}
        >
          {blog.content}
        </p>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {blog.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded cursor-pointer hover:bg-gray-200"
                onClick={() => handleFilterChange('tags', [tag])}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Title Image */}
      {blog.titleURL && (
        <div className="h-48 mx-4 rounded-lg mb-3 overflow-hidden cursor-pointer" onClick={() => handleBlogClick(blog.id)}>
          <img 
            src={blog.titleURL} 
            alt="Blog Title" 
            className="w-full h-full object-fill rounded-lg hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Media Gallery */}
      {blog.mediaURL && blog.mediaURL.length > 0 && (
        <div className="px-4 mb-3">
          <div className="grid grid-cols-2 gap-2">
            {blog.mediaURL.slice(0, 4).map((media, index) => (
              <div 
                key={index}
                className="relative h-24 bg-cover bg-center rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                style={{ backgroundImage: `url(${media})` }}
                onClick={() => handleBlogClick(blog.id)}
              >
                {index === 3 && blog.mediaURL.length > 4 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">+{blog.mediaURL.length - 3}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <div className="flex items-center space-x-6">
          <motion.button
            className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 text-sm"
            onClick={() => handleLike(blog.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{blog.likes || 0}</span>
          </motion.button>

          <motion.button
            className="flex items-center space-x-1 text-gray-500 hover:text-green-600 text-sm"
            onClick={() => handleComment(blog.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{blog.comments || 0}</span>
          </motion.button>

          <motion.button
            className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 text-sm"
            onClick={() => handleShare(blog.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span>Share</span>
          </motion.button>
        </div>
      </div>

      {/* Recent Comments Preview */}
      {blog.recentComments && blog.recentComments.length > 0 && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2 mt-2">Recent comments</p>
          {blog.recentComments.slice(0, 2).map((comment, index) => (
            <div key={index} className="mb-2 last:mb-0">
              <div className="flex items-start space-x-2">
                {comment.photoURL ? (
                  <img
                    className="w-6 h-6 rounded-full cursor-pointer object-cover"
                    src={comment.photoURL}
                    referrerPolicy='no-referrer'
                    alt={comment.displayName + "'s profile picture"}
                    onClick={() => handleUserClick(comment.uid)}
                  />
                ) : (
                  <div 
                    className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white text-xs font-semibold cursor-pointer"
                    onClick={() => handleUserClick(comment.uid)}
                  >
                    {comment.displayName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span 
                      className="text-xs font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                      onClick={() => handleUserClick(comment.uid)}
                    >
                      {comment.displayName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
          
          {blog.comments > 2 && (
            <button 
              className="text-xs text-blue-600 hover:text-blue-800 mt-2"
              onClick={() => handleBlogClick(blog.id)}
            >
              View all {blog.comments} comments
            </button>
          )}
        </div>
      )}
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-600 text-lg">Discovering amazing blogs for you...</p>
        </div>
        <div className="fixed inset-0 pointer-events-none z-0">
          <FloatingParticals particals={60} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative">
      {/* Floating particles background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <FloatingParticals particals={70} />
      </div>

      {/* Compact Header */}
      <motion.div
        className="bg-white shadow-sm sticky top-0 z-20"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.h1 
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Explore
            </motion.h1>
            
            <motion.button
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center space-x-2 text-sm"
              onClick={() => setShowFilters(!showFilters)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filter</span>
            </motion.button>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              className="mt-4 p-4 bg-gray-50 rounded-lg"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    value={filters.range}
                    onChange={(e) => handleFilterChange('range', e.target.value)}
                  >
                    <option value="">All Time</option>
                    <option value="today">Today</option>
                    <option value="this-week">This Week</option>
                    <option value="this-month">This Month</option>
                    <option value="past-3months">Past 3 Months</option>
                    <option value="this-year">This Year</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specific Date</label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    value={filters.date}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                  <input
                    type="text"
                    placeholder="Author name..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    value={filters.author}
                    onChange={(e) => handleFilterChange('author', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    <option value="latest">Latest</option>
                    <option value="oldest">Oldest</option>
                    <option value="most-popular">Most Popular</option>
                    <option value="most-commented">Most Commented</option>
                  </select>
                </div>
              </div>
              
              {/* Tags Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <input
                  type="text"
                  placeholder="Type a tag and press Enter..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  onKeyPress={handleTagInput}
                />
                {filters.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {filters.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        #{tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <motion.div
          className="space-y-6"
          initial="hidden"
          animate="visible"
          variants={staggerChildren}
        >
          {blogs.map((blog, index) => (
            <BlogCard key={blog.id} blog={blog} index={index} />
          ))}
        </motion.div>

        {/* Loading More */}
        {loadingMore && (
          <motion.div
            className="text-center py-8 relative z-20"
            variants={fadeInUp}
          >
            <motion.div
              className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-gray-600 text-sm">Loading more blogs...</p>
          </motion.div>
        )}

        {/* No More Content */}
        {!hasMore && blogs.length > 0 && (
          <motion.div
            className="text-center py-8 relative z-20"
            variants={fadeInUp}
          >
            <p className="text-gray-500 text-sm">You've reached the end! No more blogs to show.</p>
          </motion.div>
        )}

        {/* No Results */}
        {blogs.length === 0 && !loading && (
          <motion.div
            className="text-center py-16 relative z-20"
            variants={fadeInUp}
          >
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your filters to find what you're looking for.</p>
          </motion.div>
        )}
      </div>

      <ScrollToTop />
    </div>
  );
};

export default Explore;