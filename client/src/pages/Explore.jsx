/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import ScrollToTop from '../components/ScrollToTop';
import FloatingParticals from '../components/FloatingParticals';
import BlogCard from '../components/BlogCard';
import { useNotification } from '../components/Notification';
import { useSearchParams } from 'react-router-dom';

// API
const API = import.meta.env.VITE_API;

const Explore = () => {
  const [searchParams] = useSearchParams();
  const author = searchParams.get('author');
  const [user, setUser] = useState(null); // Initialize as null instead of undefined
  const [authLoaded, setAuthLoaded] = useState(false); // Track if auth state is loaded
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    range: '', // 'today', 'this-week', 'this-month', 'past-3months', 'this-year'
    date: '', // specific date in YYYY-MM-DD format
    author: author || "", // author display name
    tags: [], // array of tags
    sortBy: 'latest' // 'latest', 'oldest', 'most-popular', 'most-commented'
  });
  const [availableTags, setAvailableTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    range: '',
    date: '',
    author: '',
    tags: [],
    sortBy: 'latest'
  });

  const navigate = useNavigate();
  const observerRef = useRef();
  const { error, info } = useNotification();

  // Check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoaded(true); // Mark auth as loaded
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Get tags
  useEffect(() => {
    const fetchAvailableTags = async () => {
      try {
        const response = await axios.get(`${API}/params/tags`);
        if (response.data.status === "success") {
          setAvailableTags(response.data.tags);
          setFilteredTags(response.data.tags);
        }
      } catch (error) {
        console.error("Explore Page :: Error fetching available tags ::\n", error);
      }
    };

    fetchAvailableTags();
  }, []);

  // Old method (Saved for reference)
  // useEffect(() => {
  //   const fetchAvailableTags = async () => {
  //     try {
  //       const response = await axios.post(`${import.meta.env.VITE_GET_TAGS}`, {
  //         data: {},
  //       });
  //       const result = response.data.result;
  //       if (result.success) {
  //         setAvailableTags(result.tags);
  //         setFilteredTags(result.tags);
  //       }
  //     } catch (error) {
  //       console.error("Explore Page :: Error fetching available tags ::\n", error);
  //     }
  //   };

  //   fetchAvailableTags();
  // }, []);

  // close drop down on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isTagDropdownOpen && !event.target.closest('.relative')) {
        setIsTagDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTagDropdownOpen]);

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
      const userId = user?.uid;
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

  // Initial load - wait for auth to be loaded before fetching
  useEffect(() => {
    if (authLoaded) {
      setCursor(null);
      fetchBlogs(null, true);
    }
  }, [authLoaded]); // Only depend on authLoaded for initial load

  // Handle filter changes - fetch blogs when filters change (after auth is loaded)
  useEffect(() => {
    if (authLoaded) {
      setCursor(null);
      fetchBlogs(null, true);
    }
  }, [filters, authLoaded]); // Depend on both filters and authLoaded

  const handleTagSearch = (searchTerm) => {
    setCurrentTag(searchTerm);
    if (searchTerm.trim()) {
      const filtered = availableTags.filter(tag =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTags(filtered);
    } else {
      setFilteredTags(availableTags);
    }
    setIsTagDropdownOpen(true);
  };

  const handleSelectTag = (tag) => {
    if (!tempFilters.tags.includes(tag)) {
      setTempFilters(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    setCurrentTag('');
    setIsTagDropdownOpen(false);
    setFilteredTags(availableTags);
  };

  const handleTempFilterChange = (key, value) => {
    setTempFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setShowFilters(false);
  };

  const resetFilters = () => {
    const resetValues = {
      range: '',
      date: '',
      author: '',
      tags: [],
      sortBy: 'latest'
    };
    setTempFilters(resetValues);
    setFilters(resetValues);
  };

  const removeTempTag = (tagToRemove) => {
    setTempFilters(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
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

  // Action handlers
  const handleShare = (blog) => {
  const shareUrl = `${window.location.origin}/blogs/${blog.id}`;
  
  if (navigator.share) {
    navigator.share({
      title: blog.title,
      text: `Check out this amazing blog post: ${blog.title}`,
      url: shareUrl,
    }).catch((error) => {
      console.error('Error sharing:', error);
      // Fallback to clipboard if share fails
      navigator.clipboard.writeText(shareUrl).then(() => {
        console.log('Link copied to clipboard!');
        info('Link copied to clipboard!');
      });
    });
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      console.log('Link copied to clipboard!');
      info('Link copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy link:', err);
      error('Failed to copy link. Please try again later.');
    });
  }
};

  // Show loading while auth is being checked
  if (!authLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-600 text-lg">
            {!authLoaded ? 'Checking authentication...' : 'Discovering amazing blogs for you...'}
          </p>
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

      {/* Header */}
      <motion.div
        className="bg-white shadow-sm sticky top-0 z-20"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.h1
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent lg:text-3xl"
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
                {/* Time Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    value={tempFilters.range}
                    onChange={(e) => handleTempFilterChange('range', e.target.value)}
                  >
                    <option value="">All Time</option>
                    <option value="today">Today</option>
                    <option value="this-week">This Week</option>
                    <option value="this-month">This Month</option>
                    <option value="past-3months">Past 3 Months</option>
                    <option value="this-year">This Year</option>
                  </select>
                </div>

                {/* Specific Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specific Date</label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    value={tempFilters.date}
                    onChange={(e) => handleTempFilterChange('date', e.target.value)}
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                  <input
                    type="text"
                    placeholder="Author name..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    value={tempFilters.author}
                    onChange={(e) => handleTempFilterChange('author', e.target.value)}
                  />
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    value={tempFilters.sortBy}
                    onChange={(e) => handleTempFilterChange('sortBy', e.target.value)}
                  >
                    <option value="latest">Latest</option>
                    <option value="oldest">Oldest</option>
                    <option value="most-popular">Most Popular</option>
                    <option value="most-commented">Most Commented</option>
                  </select>
                </div>
              </div>

              {/* Tags Section */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="relative">
                  <div className="flex gap-2 mb-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={currentTag}
                        onChange={(e) => handleTagSearch(e.target.value)}
                        onFocus={() => setIsTagDropdownOpen(true)}
                        placeholder="Search and select from available tags..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />

                      {/* Dropdown */}
                      {isTagDropdownOpen && filteredTags.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {filteredTags.map((tag, index) => (
                            <button
                              key={index}
                              onClick={() => handleSelectTag(tag)}
                              className={`w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors ${tempFilters.tags.includes(tag) ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'text-gray-700'
                                }`}
                              disabled={tempFilters.tags.includes(tag)}
                            >
                              <span className="flex items-center justify-between">
                                {tag}
                                {tempFilters.tags.includes(tag) && <span className="text-xs">✓ Added</span>}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* No results message */}
                      {isTagDropdownOpen && filteredTags.length === 0 && currentTag.trim() && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                          <p className="text-gray-500 text-sm">No tags found matching "{currentTag}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Click outside to close dropdown */}
                  {isTagDropdownOpen && (
                    <div
                      className="fixed inset-0 z-5"
                      onClick={() => setIsTagDropdownOpen(false)}
                    ></div>
                  )}

                  {/* Selected Tags */}
                  {tempFilters.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tempFilters.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {tag}
                          <button
                            onClick={() => removeTempTag(tag)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={applyFilters}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Apply Filters
                </button>
                <button
                  onClick={resetFilters}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Reset
                </button>
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
            <BlogCard
              key={blog.id}
              blog={blog}
              ref={index === blogs.length - 3 ? lastBlogElementRef : null}
              onBlogClick={handleBlogClick}
              onUserClick={handleUserClick}
              onLike={handleBlogClick}
              onComment={handleBlogClick}
              onShare={handleShare}
              onFilterChange={handleFilterChange}
              formatTimeAgo={formatTimeAgo}
            />
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