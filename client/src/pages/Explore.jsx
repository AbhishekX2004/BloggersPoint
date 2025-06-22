/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ScrollToTop from '../components/ScrollToTop';
import FloatingParticals from '../components/FloatingParticals';
import dummyBlogs from './test/dummyBlogs';

// API
// eslint-disable-next-line no-undef
// const API = process.env.API;

const Explore = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState(null); // For cursor-based pagination
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    timeRange: 'all',
    specificDate: '',
    author: '',
    sortBy: 'latest'
  });
  
  const navigate = useNavigate();
  const observerRef = useRef();

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

  const scaleIn = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  // Format timestamp to relative time
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
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

      // TODO: Replace with actual API call
      // const response = await axios.get(`/api/blogs`, {
      //   params: {
      //     limit: 10,
      //     cursor: cursorValue,
      //     search: searchQuery,
      //     ...filters
      //   }
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use the actual dummyBlogs structure for initial load
      let simulatedResponse;
      
      if (reset || cursorValue === null) {
        // Return the actual dummy data structure
        simulatedResponse = {
          data: {
            status: dummyBlogs.status,
            blogs: dummyBlogs.blogs,
            length: dummyBlogs.length,
            hasMore: dummyBlogs.hasMore,
            nextCursor: dummyBlogs.nextCursor
          }
        };
      } else {
        // Simulate loading more (return empty for now)
        simulatedResponse = {
          data: {
            status: "success",
            blogs: [], // No more blogs for pagination simulation
            length: 0,
            hasMore: false,
            nextCursor: null
          }
        };
      }
      
      const responseData = simulatedResponse.data;
      
      // Check if the API call was successful
      if (responseData.status !== 'success') {
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
      // Handle error state - you might want to show an error message to user
      if (reset || cursorValue === null) {
        setBlogs([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Infinite scroll observer - triggers when user is near the end
  const lastBlogElementRef = useCallback(node => {
    if (loading || loadingMore || !hasMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        fetchBlogs(cursor, false);
      }
    }, {
      // Trigger when the element is 200px from entering the viewport
      rootMargin: '200px'
    });
    
    if (node) observerRef.current.observe(node);
  }, [loading, loadingMore, hasMore, cursor]);

  // Initial load and when search/filters change
  useEffect(() => {
    setCursor(null);
    fetchBlogs(null, true);
  }, [searchQuery, filters]);

  // Handle search
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setCursor(null);
      fetchBlogs(null, true);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Navigation handlers
  const handleBlogClick = (blogId) => {
    navigate(`/blogs/${blogId}`);
  };

  const handleUserClick = (userId) => {
    navigate(`/public/user/${userId}`);
  };

  // Action handlers (empty for now)
  const handleShare = (blogId) => {
    // TODO: Implement share functionality
    console.log('Share blog:', blogId);
  };

  const handleLike = (blogId) => {
    // TODO: Implement like functionality
    console.log('Like blog:', blogId);
  };

  const handleComment = (blogId) => {
    navigate(`/blogs/${blogId}`);
  };

  const BlogCard = ({ blog, index }) => (
    <motion.div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative z-20"
      variants={fadeInUp}
      ref={index === blogs.length - 3 ? lastBlogElementRef : null} // Trigger 3 items before the end
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Media */}
      {blog.mediaUrl && (
        <div 
          className="h-48 bg-cover bg-center cursor-pointer"
          style={{ backgroundImage: `url(${blog.mediaUrl})` }}
          onClick={() => handleBlogClick(blog.id)}
        />
      )}
      
      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer"
              onClick={() => handleUserClick(blog.authorId)}
            >
              {blog.author.charAt(0).toUpperCase()}
            </div>
            <div>
              <p 
                className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                onClick={() => handleUserClick(blog.authorId)}
              >
                {blog.author}
              </p>
              <p className="text-sm text-gray-500">{formatTimeAgo(blog.timestamp)}</p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>

        {/* Title and Content */}
        <h3 
          className="text-xl font-bold text-gray-900 mb-3 cursor-pointer hover:text-blue-600 line-clamp-2"
          onClick={() => handleBlogClick(blog.id)}
        >
          {blog.title}
        </h3>
        <p 
          className="text-gray-600 mb-4 line-clamp-3 cursor-pointer"
          onClick={() => handleBlogClick(blog.id)}
        >
          {blog.content}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <motion.button
              className="flex items-center space-x-2 text-gray-500 hover:text-blue-600"
              onClick={() => handleShare(blog.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span className="text-sm">Share</span>
            </motion.button>

            <motion.button
              className="flex items-center space-x-2 text-gray-500 hover:text-red-600"
              onClick={() => handleLike(blog.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm">{blog.likes}</span>
            </motion.button>

            <motion.button
              className="flex items-center space-x-2 text-gray-500 hover:text-green-600"
              onClick={() => handleComment(blog.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm">{blog.totalComments}</span>
            </motion.button>
          </div>
        </div>

        {/* Comments Preview */}
        {blog.comments && blog.comments.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {blog.comments.slice(0, 2).map((comment) => (
              <div key={comment.id} className="mb-3 last:mb-0">
                <div className="flex items-start space-x-3">
                  <div 
                    className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white text-sm font-semibold cursor-pointer"
                    onClick={() => handleUserClick(comment.authorId)}
                  >
                    {comment.author.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span 
                        className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                        onClick={() => handleUserClick(comment.authorId)}
                      >
                        {comment.author}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(comment.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {blog.totalComments > 2 && (
              <button 
                className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                onClick={() => handleBlogClick(blog.id)}
              >
                Show more comments
              </button>
            )}
          </div>
        )}
      </div>
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
        {/* Floating particles for loading screen */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <FloatingParticals particals={60} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative">
      {/* Floating particles background - covers entire page */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <FloatingParticals particals={70} />
      </div>

      {/* Header */}
      <motion.div
        className="bg-white shadow-sm sticky top-0 z-50 relative"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for blogs, topics, or authors..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearch}
                />
                <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <motion.button
              className="ml-4 p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => setShowFilters(!showFilters)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={filters.timeRange}
                    onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specific Date</label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={filters.specificDate}
                    onChange={(e) => handleFilterChange('specificDate', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                  <input
                    type="text"
                    placeholder="Search by author..."
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={filters.author}
                    onChange={(e) => handleFilterChange('author', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    <option value="latest">Latest</option>
                    <option value="popular">Most Popular</option>
                    <option value="commented">Most Commented</option>
                    <option value="liked">Most Liked</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <motion.div
          className="space-y-8"
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
              className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-gray-600">Searching more amazing blogs for you...</p>
          </motion.div>
        )}

        {/* No More Content */}
        {!hasMore && blogs.length > 0 && (
          <motion.div
            className="text-center py-8 relative z-20"
            variants={fadeInUp}
          >
            <p className="text-gray-500">You've reached the end! No more blogs to show.</p>
          </motion.div>
        )}

        {/* No Results */}
        {blogs.length === 0 && !loading && (
          <motion.div
            className="text-center py-16 relative z-20"
            variants={fadeInUp}
          >
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No blogs found</h3>
            <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
          </motion.div>
        )}
      </div>

      <ScrollToTop />
    </div>
  );
};

export default Explore;