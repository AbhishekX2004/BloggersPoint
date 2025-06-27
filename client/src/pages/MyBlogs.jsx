/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ScrollToTop from '../components/ScrollToTop';
import FloatingParticals from '../components/FloatingParticals';

const API = import.meta.env.VITE_API;

const MyBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [filters, setFilters] = useState({
        sortBy: 'recent',
        timeRange: '',
        dateFilter: ''
    });

    const navigate = useNavigate();
    const observerRef = useRef();

    // Get user ID from localStorage or auth context
    const uid = localStorage.getItem('uid') || 'user123'; // Replace with actual auth

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

    // Format timestamp to readable date
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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

    // Fetch user's blogs from API
    const fetchBlogs = async (cursorValue = null, reset = false) => {
        try {
            if (reset || cursorValue === null) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const params = {
                limit: 10,
                ...filters
            };

            if (cursorValue) {
                params.cursor = cursorValue;
            }

            const response = await axios.get(`${API}/writer/user-blogs/${uid}`, {
                params
            });

            const responseData = response.data;

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
            if (reset || cursorValue === null) {
                setBlogs([]);
            }
            setHasMore(false);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Delete blog
    const deleteBlog = async (blogId) => {
        try {
            setDeleting(true);

            const response = await axios.delete(`${API}/blog/delete`, {
                data: {
                    uid,
                    blogId
                }
            });

            if (response.data.status === 'success') {
                // Remove blog from state
                setBlogs(prev => prev.filter(blog => blog.blogId !== blogId));
                setDeleteConfirm(null);
            } else {
                throw new Error('Failed to delete blog');
            }
        } catch (error) {
            console.error('Error deleting blog:', error);
            // You might want to show an error toast here
        } finally {
            setDeleting(false);
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

    // Navigation handlers
    const handleBlogClick = (blogId) => {
        navigate(`/blogs/${blogId}`);
    };

    const handleEditClick = (blogId) => {
        navigate(`/writer/edit/${blogId}`);
    };

    const BlogCard = ({ blog, index }) => (
        <motion.div
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative z-20"
            variants={fadeInUp}
            ref={index === blogs.length - 3 ? lastBlogElementRef : null}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <div className="p-6">
                {/* Header with actions */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3
                            className="text-xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-blue-600 line-clamp-2"
                            onClick={() => handleBlogClick(blog.blogId)}
                        >
                            {blog.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Created: {formatDate(blog.createdAt)}</span>
                            {blog.updatedAt && blog.updatedAt !== blog.createdAt && (
                                <span>Updated: {formatDate(blog.updatedAt)}</span>
                            )}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                        <motion.button
                            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                            onClick={() => handleEditClick(blog.blogId)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            title="Edit blog"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </motion.button>

                        <motion.button
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                            onClick={() => setDeleteConfirm(blog.blogId)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            title="Delete blog"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </motion.button>
                    </div>
                </div>

                {/* Content */}
                <p
                    className="text-gray-600 mb-4 line-clamp-3 cursor-pointer"
                    onClick={() => handleBlogClick(blog.blogId)}
                >
                    {blog.content}
                </p>

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {blog.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span
                                key={tagIndex}
                                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                        {blog.tags.length > 3 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                                +{blog.tags.length - 3} more
                            </span>
                        )}
                    </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2 text-gray-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className="text-sm">{blog.likes}</span>
                        </div>

                        <div className="flex items-center space-x-2 text-gray-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="text-sm">{blog.comments}</span>
                        </div>
                    </div>

                    <button
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        onClick={() => handleBlogClick(blog.blogId)}
                    >
                        View Full Post
                    </button>
                </div>
            </div>
        </motion.div>
    );

    // Delete confirmation modal
    const DeleteConfirmModal = () => (
        <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Blog</h3>
                <p className="text-gray-600 mb-6">
                    Are you sure you want to delete this blog? This action cannot be undone.
                </p>
                <div className="flex items-center justify-end space-x-3">
                    <button
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        onClick={() => setDeleteConfirm(null)}
                        disabled={deleting}
                    >
                        Cancel
                    </button>
                    <motion.button
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        onClick={() => deleteBlog(deleteConfirm)}
                        disabled={deleting}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {deleting ? 'Deleting...' : 'Delete'}
                    </motion.button>
                </div>
            </motion.div>
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
                    <p className="text-gray-600 text-lg">Loading your blogs...</p>
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My&nbsp;
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
                                    Blogs
                                </motion.span>
                            </h1>
                            <p className="text-gray-600">Manage and organize your published content</p>
                        </div>

                        <motion.button
                            className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        value={filters.sortBy}
                                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                    >
                                        <option value="recent">Most Recent</option>
                                        <option value="mostLiked">Most Liked</option>
                                        <option value="dated">Oldest First</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        value={filters.timeRange}
                                        onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                                    >
                                        <option value="">All Time</option>
                                        <option value="lastWeek">Last Week</option>
                                        <option value="lastMonth">Last Month</option>
                                        <option value="last3Months">Last 3 Months</option>
                                        <option value="last6Months">Last 6 Months</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Specific Date</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        value={filters.dateFilter}
                                        onChange={(e) => handleFilterChange('dateFilter', e.target.value)}
                                    />
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
                        <BlogCard key={blog.blogId} blog={blog} index={index} />
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
                        <p className="text-gray-600">Loading more blogs...</p>
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
                        <p className="text-gray-500 mb-4">You haven't created any blogs yet, or they don't match your current filters.</p>
                        <motion.button
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:bg-blue-700"
                            onClick={() => {
                                navigate('/write');
                                window.scrollTo(0, 0);
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Write Your First Blog
                        </motion.button>
                    </motion.div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && <DeleteConfirmModal />}

            <ScrollToTop />
        </div>
    );
};

export default MyBlogs;