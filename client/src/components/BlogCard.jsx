import { motion } from 'framer-motion';
import { forwardRef } from 'react';

const BlogCard = forwardRef(({ 
  blog, 
  onBlogClick, 
  onUserClick, 
  onLike, 
  onComment, 
  onShare, 
  onFilterChange,
  formatTimeAgo 
}, ref) => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      ref={ref}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 relative z-20"
      variants={fadeInUp}
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
              onClick={() => onUserClick(blog.uid)}
            />
          ) : (
            <div 
              className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer text-sm"
              onClick={() => onUserClick(blog.uid)}
            >
              {blog.author?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p 
              className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 text-sm"
              onClick={() => onUserClick(blog.uid)}
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
          onClick={() => onBlogClick(blog.id)}
        >
          {blog.title}
        </h3>
        <p 
          className="text-gray-600 text-sm line-clamp-3 cursor-pointer mb-3"
          onClick={() => onBlogClick(blog.id)}
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
                onClick={() => onFilterChange('tags', [tag])}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Title Image */}
      {blog.titleURL && (
        <div className="h-48 mx-4 rounded-lg mb-3 overflow-hidden cursor-pointer" onClick={() => onBlogClick(blog.id)}>
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
                onClick={() => onBlogClick(blog.id)}
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
            className="flex items-center space-x-1 text-gray-500 hover:text-red-600 text-sm"
            onClick={() => onLike(blog.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{blog.likes || 0}</span>
          </motion.button>

          <motion.button
            className="flex items-center space-x-1 text-gray-500 hover:text-green-500 text-sm"
            onClick={() => onComment(blog.id)}
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
            onClick={() => onShare(blog.id)}
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
                    onClick={() => onUserClick(comment.uid)}
                  />
                ) : (
                  <div 
                    className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white text-xs font-semibold cursor-pointer"
                    onClick={() => onUserClick(comment.uid)}
                  >
                    {comment.displayName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span 
                      className="text-xs font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                      onClick={() => onUserClick(comment.uid)}
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
              onClick={() => onBlogClick(blog.id)}
            >
              View all {blog.comments} comments
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
});

BlogCard.displayName = 'BlogCard';

export default BlogCard;