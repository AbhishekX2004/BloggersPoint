import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { storage, auth } from '../firebaseConfig'; // Import auth from firebase config
import ScrollToTop from '../components/ScrollToTop';
import FloatingParticals from '../components/FloatingParticals';

const BlogCreator = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [titleImage, setTitleImage] = useState(null);
  const [titleImageUrl, setTitleImageUrl] = useState('');
  const [mediaUrls, setMediaUrls] = useState([]);
  const [isPreview, setIsPreview] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadingTitle, setUploadingTitle] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const navigate = useNavigate();
  const API = import.meta.env.VITE_API;

  // Check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        // User is not logged in, redirect to login
        navigate('/login');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [navigate]);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
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

  // Upload file to Firebase Storage
  const uploadToFirebase = async (file, path) => {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleFileUpload = async (event, isTitle = false) => {
    const file = event.target.files[0];
    if (!file || !user) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      if (isTitle) {
        setTitleImage(e.target.result);
      } else {
        if (mediaFiles.length < 3) {
          setMediaFiles([...mediaFiles, e.target.result]);
        }
      }
    };
    reader.readAsDataURL(file);

    // Upload to Firebase in background
    try {
      if (isTitle) {
        setUploadingTitle(true);
        const timestamp = Date.now();
        const fileName = `blogs/${user.uid}/title_${timestamp}_${file.name}`;
        const url = await uploadToFirebase(file, fileName);
        setTitleImageUrl(url);
        setUploadingTitle(false);
      } else {
        if (mediaFiles.length < 3) {
          setUploadingMedia(true);
          const timestamp = Date.now();
          const fileName = `blogs/${user.uid}/media_${timestamp}_${file.name}`;
          const url = await uploadToFirebase(file, fileName);
          setMediaUrls(prev => [...prev, url]);
          setUploadingMedia(false);
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
      if (isTitle) {
        setUploadingTitle(false);
        setTitleImage(null);
      } else {
        setUploadingMedia(false);
        // Remove the preview that was just added
        setMediaFiles(prev => prev.slice(0, -1));
      }
    }
  };

  const handleRemoveMedia = (index) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  const handleRemoveTitleImage = () => {
    setTitleImage(null);
    setTitleImageUrl('');
  };

  const handlePublish = async () => {
    if (!user) {
      alert('You must be logged in to publish a blog');
      navigate('/login');
      return;
    }

    if (!title.trim()) {
      alert('Please enter a blog title');
      return;
    }

    if (!content.trim()) {
      alert('Please enter blog content');
      return;
    }

    if (tags.length === 0) {
      alert('Please add at least one tag');
      return;
    }

    setPublishing(true);

    try {
      const blogData = {
        uid: user.uid,
        titleURL: titleImageUrl || '',
        title: title.trim(),
        tags,
        content: content.trim(),
        mediaURL: mediaUrls
      };

      const response = await axios.post(`${API}/blog/create`, blogData);

      alert('Blog published successfully!');
      console.log('Published blog:', response.data);
      
      // Reset form after successful publish
      setTitle('');
      setContent('');
      setTags([]);
      setMediaFiles([]);
      setTitleImage(null);
      setTitleImageUrl('');
      setMediaUrls([]);

      navigate(`/blogs/${response.data.blogId}`);

    } catch (error) {
      console.error('Error publishing blog:', error);
      alert('Failed to publish blog. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  const BlogPreview = () => (
    <motion.div
      className="bg-white rounded-2xl shadow-xl p-8 md:p-12 relative overflow-hidden"
      variants={fadeInUp}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600"></div>

      {titleImage && (
        <div className="mb-8 rounded-xl overflow-hidden relative">
          <img src={titleImage} alt="Title" className="w-full h-48 object-cover" />
          {uploadingTitle && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-sm">Uploading...</div>
            </div>
          )}
        </div>
      )}

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{title || 'Your Blog Title'}</h1>

      <div className="flex flex-wrap gap-2 mb-8">
        {tags.map((tag, index) => (
          <span key={index} className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-medium">
            {tag}
          </span>
        ))}
      </div>

      <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line mb-8">
        {content || 'Your blog content will appear here...'}
      </p>

      {mediaFiles.length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Media</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mediaFiles.map((file, index) => (
              <div key={index} className="relative">
                <img src={file} alt={`Media ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                {uploadingMedia && index === mediaFiles.length - 1 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div className="text-white text-xs">Uploading...</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, this component won't render as they'll be redirected
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="fixed inset-0 pointer-events-none z-0">
        <FloatingParticals particals={70} />
      </div>
      <motion.div
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative"
        initial="hidden"
        animate="visible"
        variants={staggerChildren}
      >
        {/* Header */}
        <motion.div className="text-center mb-8" variants={fadeInUp}>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">What's on your mind today?</h1>
        </motion.div>

        {/* Toggle Buttons */}
        <motion.div className="flex justify-center mb-8" variants={fadeInUp}>
          <div className="bg-white rounded-lg p-1 pl-1.5 pr-1.5 shadow-lg">
            <button
              className={`px-6 py-2 rounded-md font-medium transition-all ${!isPreview ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setIsPreview(false)}
            >
              Edit
            </button>
            <button
              className={`px-6 py-2 rounded-md font-medium transition-all ${isPreview ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setIsPreview(true)}
            >
              Preview
            </button>
          </div>
        </motion.div>

        {!isPreview ? (
          /* Editor Mode */
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
            variants={fadeInUp}
          >
            <div className="space-y-8">
              {/* Title Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title Image (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  {titleImage ? (
                    <div className="relative">
                      <img src={titleImage} alt="Title" className="w-full h-48 object-cover rounded-lg mb-4" />
                      {uploadingTitle && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg mb-4">
                          <div className="text-white text-sm">Uploading...</div>
                        </div>
                      )}
                      <button
                        onClick={handleRemoveTitleImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                        disabled={uploadingTitle}
                      >
                        <span className="text-sm leading-none translate-y-[-2px]">x</span>
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl mb-2">🖼️</div>
                      <p className="text-gray-500 mb-4">Upload a title image (Optional)</p>
                      <input
                        type="file"
                        accept="image/*,video/*,.gif"
                        onChange={(e) => handleFileUpload(e, true)}
                        className="hidden"
                        id="title-image"
                        disabled={uploadingTitle}
                      />
                      <label
                        htmlFor="title-image"
                        className={`${uploadingTitle ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'} text-white px-4 py-2 rounded-lg transition-colors`}
                      >
                        {uploadingTitle ? 'Uploading...' : 'Choose Image'}
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Blog Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blog Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your blog title..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Add a tag..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddTag}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your heart out..."
                  rows={15}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg leading-relaxed resize-none"
                />
              </div>

              {/* Media Files */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Media Files ({mediaFiles.length}/3)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mediaFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <img src={file} alt={`Media ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                      {uploadingMedia && index === mediaFiles.length - 1 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                          <div className="text-white text-xs">Uploading...</div>
                        </div>
                      )}
                      <button
                        onClick={() => handleRemoveMedia(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        disabled={uploadingMedia && index === mediaFiles.length - 1}
                      >
                        <span className="text-sm leading-none translate-y-[-2px]">x</span>
                      </button>

                    </div>
                  ))}

                  {mediaFiles.length < 3 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                      <div className="text-2xl mb-2">📷</div>
                      <p className="text-gray-500 text-sm mb-2">Add Media</p>
                      <input
                        type="file"
                        accept="image/*,video/*,.gif"
                        onChange={(e) => handleFileUpload(e, false)}
                        className="hidden"
                        id={`media-${mediaFiles.length}`}
                        disabled={uploadingMedia}
                      />
                      <label
                        htmlFor={`media-${mediaFiles.length}`}
                        className={`${uploadingMedia ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700 cursor-pointer'} text-white px-3 py-1 rounded text-sm transition-colors`}
                      >
                        {uploadingMedia ? 'Uploading...' : 'Upload'}
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Publish Button */}
              <div className="flex justify-center pt-6">
                <button
                  onClick={handlePublish}
                  disabled={publishing || uploadingTitle || uploadingMedia}
                  className={`${publishing || uploadingTitle || uploadingMedia
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
                    } text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all`}
                >
                  {publishing ? 'Publishing...' : 'Publish Blog'}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Preview Mode */
          <BlogPreview />
        )}
      </motion.div>
      <ScrollToTop />
    </div>
  );
};

export default BlogCreator;