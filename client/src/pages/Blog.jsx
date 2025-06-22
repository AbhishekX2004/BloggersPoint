import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Import dummy data (you would replace these with actual API calls)
import { dummyBlogPost, dummyBlogComments } from './test/dummyBlog';
import FloatingParticals from '../components/FloatingParticals';
import ScrollToTop from '../components/ScrollToTop';

const BlogPostPage = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [blogData, setBlogData] = useState(null);
  const [commentsData, setCommentsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  // Animation variants
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
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  };

  // Fetch blog data
  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        setLoading(true);
        
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Use dummy data - in real implementation, these would be API calls
        setBlogData(dummyBlogPost.blogid);
        setCommentsData(dummyBlogComments);
        setLikes(dummyBlogPost.blogid.likes);
        
      } catch (error) {
        console.error('Error fetching blog data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogData();
  }, [blogId]);

  // Handle like
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
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
      alert('Link copied to clipboard!');
    }
  };

  // Handle comment submission
  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      const comment = {
        cid: commentsData.comments.length + 1,
        author: "Current User", // This would come from auth context
        content: newComment,
        timestamp: new Date().toISOString()
      };
      
      setCommentsData(prev => ({
        ...prev,
        comments: [comment, ...prev.comments],
        totalComments: prev.totalComments + 1
      }));
      
      setNewComment('');
    }
  };

  // Handle user navigation
  const handleUserClick = (userId) => {
    navigate(`/public/user/${userId}`);
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
            <img
              src={parts[i]}
              alt="Blog content"
              className="w-full rounded-lg shadow-lg"
              loading="lazy"
            />
          </motion.div>
        );
      }
    }
    
    return elements;
  };

  if (loading) {
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

  if (!blogData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog not found</h2>
          <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
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

      {/* Header */}
      <motion.div
        className="bg-white shadow-sm sticky top-0 z-50 relative"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/explore')}
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
              {/* Blog Title */}
              <motion.h1
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
                variants={fadeInUp}
              >
                {blogData.title}
              </motion.h1>

              {/* Blog Metadata */}
              <motion.div
                className="flex items-center space-x-4 mb-8 pb-6 border-b border-gray-200"
                variants={fadeInUp}
              >
                <div 
                  className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer"
                  onClick={() => handleUserClick(blogData.uid)}
                >
                  {blogData.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p 
                    className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                    onClick={() => handleUserClick(blogData.uid)}
                  >
                    {blogData.author}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatTimeAgo(blogData.timestamp)} • {Math.ceil(blogData.content.split(' ').length / 200)} min read
                  </p>
                </div>
              </motion.div>

              {/* Blog Content */}
              <motion.div
                className="text-gray-700 leading-relaxed"
                variants={staggerChildren}
                initial="hidden"
                animate="visible"
              >
                {renderBlogContent(blogData.content)}
              </motion.div>

              {/* Tags */}
              {blogData.tags && (
                <motion.div
                  className="mt-8 pt-6 border-t border-gray-200"
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
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <div 
                  className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 cursor-pointer"
                  onClick={() => handleUserClick(blogData.uid)}
                >
                  {blogData.author.charAt(0).toUpperCase()}
                </div>
                <h3 
                  className="text-xl font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600"
                  onClick={() => handleUserClick(blogData.uid)}
                >
                  {blogData.author}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Passionate writer sharing insights about technology and life.
                </p>
                
                {/* Follow Button */}
                <motion.button
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-4"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Follow Author
                </motion.button>
              </div>

              {/* Like & Share Buttons */}
              <div className="flex space-x-3">
                <motion.button
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${
                    isLiked 
                      ? 'bg-red-50 text-red-600 border border-red-200' 
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-red-50 hover:text-red-600'
                  }`}
                  onClick={handleLike}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-sm">{likes}</span>
                </motion.button>

                <motion.button
                  className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-blue-50 hover:text-blue-600 transition-colors"
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

            {/* Comments Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Comments ({commentsData?.totalComments || 0})
              </h3>

              {/* Add Comment */}
              <div className="mb-6">
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <motion.button
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  onClick={handleCommentSubmit}
                  disabled={!newComment.trim()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Post Comment
                </motion.button>
              </div>

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
                      onClick={() => handleUserClick(`user-${comment.cid}`)}
                    >
                      {comment.author.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span 
                          className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                          onClick={() => handleUserClick(`user-${comment.cid}`)}
                        >
                          {comment.author}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  </motion.div>
                ))}

                {(!commentsData?.comments || commentsData.comments.length === 0) && (
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

export default BlogPostPage;