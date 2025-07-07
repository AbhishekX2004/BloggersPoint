/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { storage, auth } from '../firebaseConfig';
import ScrollToTop from '../components/ScrollToTop';
import FloatingParticals from '../components/FloatingParticals';
import ImgGen from './ImgGen';
import AIContentEnhancer from './AIContentEnhancer';
import { useNotification } from '../components/Notification';

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
  const [availableTags, setAvailableTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [predictingTags, setPredictingTags] = useState(false);
  const [isAIEnhancementModalOpen, setIsAIEnhancementModalOpen] = useState(false);
  const [enhancingContent, setEnhancingContent] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiModalType, setAiModalType] = useState('media'); // 'title' or 'media'

  const { success, error, warning } = useNotification();

  const handleSuccess = (message) => {
    success(message);
  };

  const handleWarning = (message) => {
    warning(message);
  }

  const handleError = (message) => {
    error(message);
  };


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

  // Get available tags
  useEffect(() => {
    const fetchAvailableTags = async () => {
      try {
        const response = await axios.post(`${import.meta.env.VITE_GET_TAGS}`, {
          data: {},
        });
        const result = response.data.result;
        if (result.success) {
          setAvailableTags(result.tags);
          setFilteredTags(result.tags);
        }
      } catch (error) {
        console.error("Blog Creator Page :: Error fetching available tags ::\n", error);
      }
    };

    fetchAvailableTags();
  }, []);

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
      console.error('Blog Creator Page :: Upload failed ::\n', error);
      handleError('Upload failed. Please try again.');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handlePredictTags = async () => {
    if (!title.trim() || !content.trim()) {
      warning('Please enter both title and content before predicting tags');
      return;
    }

    if (title.length < 5) {
      warning('Title must be at least 5 characters long');
      return;
    }

    if (content.length < 20) {
      warning('Content must be at least 20 characters long');
      return;
    }

    setPredictingTags(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_PREDICT_TAGS}`, {
        data: {
          title: title.trim(),
          content: content.trim(),
          options: {
            includeScores: false,
            maxTags: 8
          }
        }
      });
      const result = response.data.result;

      if (result.success && result.predictedTags) {
        // Add predicted tags to existing tags (avoid duplicates)
        const newTags = result.predictedTags.filter(tag => !tags.includes(tag));
        setTags(prev => [...prev, ...newTags]);
      } else {
        error('Failed to predict tags. Please try again.');
      }
    } catch (err) {
      console.error('Blog Creator Page :: Error predicting tags ::\n', err);
			error("Failed to predict tags. Please try again.");
    } finally {
      setPredictingTags(false);
    }
  };

  // function to handle tag search
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

  // function to select a tag from dropdown
  const handleSelectTag = (tag) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setCurrentTag('');
    setIsTagDropdownOpen(false);
    setFilteredTags(availableTags);
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
    } catch (err) {
      console.error('Blog Creator Page :: Upload failed ::\n', err);
      error('Upload failed. Please try again.');
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

  // Handle AI Generated Image
  const handleAIImageGenerated = async (file, type) => {
    if (!user) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'title') {
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
      if (type === 'title') {
        setUploadingTitle(true);
        const timestamp = Date.now();
        const fileName = `blogs/${user.uid}/ai_title_${timestamp}.jpg`;
        const url = await uploadToFirebase(file, fileName);
        setTitleImageUrl(url);
        setUploadingTitle(false);
      } else {
        if (mediaFiles.length < 3) {
          setUploadingMedia(true);
          const timestamp = Date.now();
          const fileName = `blogs/${user.uid}/ai_media_${timestamp}.jpg`;
          const url = await uploadToFirebase(file, fileName);
          setMediaUrls(prev => [...prev, url]);
          setUploadingMedia(false);
        }
      }
    } catch (error) {
      console.error('Blog Creator Page :: Upload failed ::\n', error);
      handleError('Upload failed. Please try again.');
      if (type === 'title') {
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

  const openAIModal = (type) => {
    setAiModalType(type);
    setIsAIModalOpen(true);
  };

  const handlePublish = async () => {
    if (!user) {
      handleError("You must be logged in to publish a blog");
      navigate('/login');
      window.scrollTo(0,0);
      return;
    }

    if (!title.trim()) {
      handleWarning('Please enter a blog title');
      return;
    }

    if (!content.trim()) {
      handleWarning('Please enter blog content');
      return;
    }

    if (tags.length === 0) {
      handleWarning('Please add at least one tag');
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

      handleSuccess('Blog published successfully!');

      // Reset form after successful publish
      setTitle('');
      setContent('');
      setTags([]);
      setMediaFiles([]);
      setTitleImage(null);
      setTitleImageUrl('');
      setMediaUrls([]);
      navigate(`/blogs/${response.data.blogId}`);
      window.scrollTo(0,0);
    } catch (error) {
      console.error('Error publishing blog:', error);
      if(!error.response.data.field){
        handleError('Failed to publish blog. Please try again.');
      } else {
        handleError(`Please review the blog contents, we found inappropriate phrases in: Blog ${error.response.data.field}`);
      }
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

      {/* Floating Particle Animation */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <FloatingParticals particals={70} />
      </div>

      {/* Main Content */}
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
                      <div className="flex gap-3 justify-center">
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
                          {uploadingTitle ? 'Uploading...' : '📁 Choose Image'}
                        </label>
                        <button
                          onClick={() => openAIModal('title')}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105"
                          disabled={uploadingTitle}
                        >
                          ✨ Generate AI Image
                        </button>
                      </div>
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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Tags</label>
                  <button
                    onClick={handlePredictTags}
                    disabled={predictingTags || !title.trim() || !content.trim()}
                    className={`${predictingTags || !title.trim() || !content.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105'
                      } text-white px-3 py-1 rounded-lg text-sm font-medium transition-all shadow-sm`}
                  >
                    {predictingTags ? (
                      <>
                        <span className="inline-block animate-spin mr-1">⚡</span>
                        Predicting...
                      </>
                    ) : (
                      <>
                        🤖 AI Tag Predictor
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <div className="flex gap-2 mb-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={currentTag}
                        onChange={(e) => handleTagSearch(e.target.value)}
                        onFocus={() => setIsTagDropdownOpen(true)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (currentTag.trim() && !tags.includes(currentTag.trim())) {
                              setTags([...tags, currentTag.trim()]);
                              setCurrentTag('');
                              setIsTagDropdownOpen(false);
                              setFilteredTags(availableTags);
                            }
                          }
                        }}
                        placeholder="Search or add a tag..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />

                      {/* Dropdown */}
                      {isTagDropdownOpen && filteredTags.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {filteredTags.slice(0, 10).map((tag, index) => (
                            <button
                              key={index}
                              onClick={() => handleSelectTag(tag)}
                              className={`w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors ${tags.includes(tag) ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'text-gray-700'
                                }`}
                              disabled={tags.includes(tag)}
                            >
                              <span className="flex items-center justify-between">
                                {tag}
                                {tags.includes(tag) && <span className="text-xs">✓ Added</span>}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (currentTag.trim() && !tags.includes(currentTag.trim())) {
                          setTags([...tags, currentTag.trim()]);
                          setCurrentTag('');
                          setIsTagDropdownOpen(false);
                          setFilteredTags(availableTags);
                        }
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {/* Click outside to close dropdown */}
                  {isTagDropdownOpen && (
                    <div
                      className="fixed inset-0 z-5"
                      onClick={() => setIsTagDropdownOpen(false)}
                    ></div>
                  )}
                </div>

                {/* Display selected tags */}
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

                {tags.length === 0 && (
                  <p className="text-gray-400 text-sm mt-2">
                    Add tags to help readers find your blog. You can search from existing tags or create new ones.
                  </p>
                )}
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <button
                      onClick={() => setIsAIEnhancementModalOpen(true)}
                      disabled={!content.trim() || enhancingContent}
                      className={`${
                        !content.trim() || enhancingContent
                          ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105'
                      } text-white px-3 py-1 rounded-lg text-sm font-medium transition-all shadow-sm`}
                    >
                      {enhancingContent ? (
                        <>
                          <span className="inline-block animate-spin mr-1">⚡</span>
                          Enhancing...
                        </>
                      ) : (
                        <>
                          <span className="mr-1 inline-block">🚀</span>
                          AI Content Enhancer
                        </>
                      )}
                    </button>
                  </div>
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
                      <div className="flex flex-col gap-2">
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
                          {uploadingMedia ? 'Uploading...' : '📁 Upload'}
                        </label>
                        <button
                          onClick={() => openAIModal('media')}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-3 py-1 rounded text-sm transition-all transform hover:scale-105"
                          disabled={uploadingMedia}
                        >
                          ✨ AI Generate
                        </button>
                      </div>
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

        {/* AI Image Generation Modal */}
        <ImgGen
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
          onImageGenerated={handleAIImageGenerated}
          type={aiModalType}
          API={API}
          user={user}
        />
      </motion.div>

      <AIContentEnhancer
        isOpen={isAIEnhancementModalOpen}
        onClose={() => setIsAIEnhancementModalOpen(false)}
        content={content}
        onContentUpdated={(newContent) => {
          setContent(newContent);
          setIsAIEnhancementModalOpen(false);
        }}
        onEnhancingStateChange={setEnhancingContent}
        user={user}
      />

      {/* Scroll to Top */}
      <ScrollToTop />
    </div>
  );
};

export default BlogCreator;