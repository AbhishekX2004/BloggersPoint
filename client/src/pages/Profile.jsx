import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import axios from 'axios';
import FloatingParticals from '../components/FloatingParticals';
import UploadIndicator from '../components/UploadIndicator';
import ScrollToTop from '../components/ScrollToTop';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebaseConfig';

import { userStatuses } from './test/dummyUser';

const API = import.meta.env.VITE_API;

const Profile = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editedProfile, setEditedProfile] = useState({});
    const [dragActive, setDragActive] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    useEffect(() => {
        // Check authentication
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) {
                navigate('/login');
            }
            try {
                const response = await axios.get(`${API}/user/?uid=${user.uid}`);
                setUserData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setLoading(false);
                // TODO : Show error message to user.
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleStatusUpdate = async (newStatus) => {
        let oldStatus = userData.status || '';
        try {
            setUserData(prev => ({
                ...prev,
                status: newStatus,
            }));
            setShowStatusDropdown(false);
            await axios.post(`${API}/user/status`, { uid: userData.uid, status: newStatus });
        } catch (error) {
            console.error('Error updating status:', error);
            setUserData(prev => ({
                ...prev,
                status: oldStatus,
            }));
        }
    };

    const handleProfileUpdate = async () => {
        try {
            const updateData = {
                uid: userData.uid,
                displayName: editedProfile.displayName,
                bio: editedProfile.bio
            };

            await axios.put(`${API}/user/profile`, updateData);

            setUserData(prev => ({
                ...prev,
                displayName: editedProfile.displayName,
                bio: editedProfile.bio
            }));

            setIsEditingProfile(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            // Optional: Show error message to user
        }
    };

    // Updated handlePhotoUpload function with upload indicator
    const handlePhotoUpload = async (file) => {
        try {
            setIsUploadingPhoto(true);
            
            // Create a reference to the storage location
            const timestamp = Date.now();
            const storageRef = ref(storage, `profile-photos/${userData.uid}_${timestamp}`);

            // Upload the file to Firebase Storage
            const snapshot = await uploadBytes(storageRef, file);

            // Get the download URL
            const downloadURL = await getDownloadURL(snapshot.ref);

            // Send the URL to your API
            await axios.put(`${API}/user/profile-image`, {
                uid: userData.uid,
                url: downloadURL
            });

            // Update the local state
            setUserData(prev => ({
                ...prev,
                photoURL: downloadURL
            }));

            setShowPhotoModal(false);
        } catch (error) {
            console.error('Error uploading photo:', error);
            // Optional: Show error message to user
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handlePhotoUpload(e.dataTransfer.files[0]);
        }
    };

    const handleEditProfileClick = () => {
        if (isEditingProfile) {
            handleProfileUpdate();
        } else {
            setIsEditingProfile(true);
            setEditedProfile({
                displayName: userData.displayName,
                bio: userData.bio
            });
        }
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 60 },
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
            transition: { staggerChildren: 0.2 }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <FloatingParticals particals={30} />
                <motion.div
                    className="text-center relative z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <motion.div
                        className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="text-gray-600 text-lg">Loading your profile...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative">
            <FloatingParticals particals={60} />

            {/* Upload Indicator */}
            <UploadIndicator 
                isVisible={isUploadingPhoto}
                message="Uploading photo..."
                position="top-left"
                color="blue"
            />

            {/* Main Content */}
            <div className="relative z-10">
                {/* Header */}
                <motion.div
                    className="w-full px-4 sm:px-6 lg:px-8 py-8"
                    initial="hidden"
                    animate="visible"
                    variants={staggerChildren}
                >
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            className="flex justify-between items-center mb-8"
                            variants={fadeInUp}
                        >
                            <h1 className="text-4xl font-bold text-gray-900">
                                My <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Profile</span>
                            </h1>
                            <div className="flex items-center gap-3">
                                
                                <motion.button
                                    className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold shadow-lg"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => signOut(auth)}
                                >
                                    Sign Out
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Profile Section */}
                        <motion.div
                            className="bg-white rounded-2xl shadow-xl p-8 mb-8 relative"
                            variants={fadeInUp}
                            whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
                        >
                            {/* Mobile Edit Profile Button - Only visible on small screens, positioned top right */}
                            <motion.button
                                className="sm:hidden bg-blue-600 text-white p-2 rounded-lg shadow-lg absolute top-4 right-4"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleEditProfileClick}
                                title={isEditingProfile ? 'Save Profile' : 'Edit Profile'}
                            >
                                {isEditingProfile ? (
                                    // Save icon
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    // Edit/Pencil icon
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                )}
                            </motion.button>
                            
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Left Side */}
                                
                                <div className="flex flex-col items-center lg:items-start">
                                    <motion.div
                                        className="relative group cursor-pointer"
                                        whileHover={{ scale: 1.05 }}
                                        onClick={() => setShowPhotoModal(true)}
                                    >
                                        <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                            {userData.photoURL ? (
                                                <img
                                                    src={userData.photoURL}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                    referrerPolicy='no-referrer'
                                                    onError={(e) => {
                                                        console.log('Image load error:', e);
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.classList.remove('overflow-hidden');
                                                        e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                                                    }}
                                                    onLoad={(e) => {
                                                        console.log('Image loaded successfully');
                                                        e.target.parentElement.classList.add('overflow-hidden');
                                                        e.target.parentElement.classList.remove('flex', 'items-center', 'justify-center');
                                                    }}
                                                />
                                            ) : null}
                                            {/* Fallback avatar - always rendered */}
                                            <div 
                                                className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold"
                                                style={{ 
                                                    display: userData.photoURL ? 'none' : 'flex'
                                                }}
                                            >
                                                {userData.displayName ? userData.displayName.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                        </div>
                                        {/* Camera overlay on hover */}
                                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                    </motion.div>

                                    {/* Last Login */}
                                    <div className="text-sm text-gray-500 mt-4 text-center lg:text-left">
                                        <span className="font-medium">Last active:</span><br />
                                        <span>
                                            {userData.lastLogin ? (() => {
                                                const getDateObj = () => {
                                                    if (userData.lastLogin._seconds)
                                                        return new Date(userData.lastLogin._seconds * 1000);
                                                    if (userData.lastLogin.toDate)
                                                        return userData.lastLogin.toDate();
                                                    return new Date(userData.lastLogin);
                                                };

                                                const loginDate = getDateObj();
                                                const today = new Date();
                                                const dateOnly = new Date(loginDate.getFullYear(), loginDate.getMonth(), loginDate.getDate());
                                                const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                                                const diffDays = Math.floor((todayOnly - dateOnly) / (1000 * 60 * 60 * 24));

                                                const label =
                                                    diffDays === 0 ? 'Today' :
                                                        diffDays === 1 ? 'Yesterday' :
                                                            `${diffDays} days ago`;

                                                return (
                                                    <div className="text-center">
                                                        {loginDate.toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })} &nbsp;
                                                        ({label})
                                                    </div>
                                                );
                                            })() : 'Never'}
                                        </span>
                                    </div>

                                </div>

                                {/* Right Side - Profile Info */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            {isEditingProfile ? (
                                                <input
                                                    type="text"
                                                    value={editedProfile.displayName}
                                                    onChange={(e) => setEditedProfile({ ...editedProfile, displayName: e.target.value })}
                                                    className="text-3xl font-bold text-gray-900 border-b-2 border-blue-300 focus:outline-none focus:border-blue-600"
                                                />
                                            ) : (
                                                <h2 className="text-3xl font-bold text-gray-900 gradient-background-text">{userData.displayName}</h2>
                                            )}
                                            <p className="text-gray-600 mt-1">{userData.email}</p>
                                        </div>
                                        
                                        {/* Desktop Edit Profile Button - Hidden on mobile */}
                                        <motion.button
                                            className="hidden sm:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleEditProfileClick}
                                        >
                                            {isEditingProfile ? (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span className="hidden md:inline">Save</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    <span className="hidden md:inline">Edit Profile</span>
                                                </>
                                            )}
                                        </motion.button>
                                    </div>

                                    {/* Bio */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Bio</h3>
                                        {isEditingProfile ? (
                                            <textarea
                                                value={editedProfile.bio}
                                                onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 resize-none"
                                                rows="3"
                                                placeholder="Tell us about yourself..."
                                            />
                                        ) : (
                                            <div className="text-gray-600 whitespace-pre-wrap">
                                                {userData.bio || "No bio added yet."}
                                            </div>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                        <motion.div
                                            className="text-center p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg"
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            <div className="text-2xl font-bold text-blue-600">{userData.blogsWritten}</div>
                                            <div className="text-sm text-gray-600">Masterpieces</div>
                                        </motion.div>
                                        <motion.div
                                            className="text-center p-4 bg-gradient-to-r from-green-100 to-teal-100 rounded-lg"
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            <div className="text-2xl font-bold text-green-600">{userData.followers}</div>
                                            <div className="text-sm text-gray-600">Followers</div>
                                        </motion.div>
                                        <motion.div
                                            className="text-center p-4 bg-gradient-to-r from-pink-100 to-orange-100 rounded-lg"
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            <div className="text-2xl font-bold text-pink-600">{userData.following}</div>
                                            <div className="text-sm text-gray-600">Following</div>
                                        </motion.div>
                                        <motion.div
                                            className="text-center p-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg cursor-pointer relative"
                                            whileHover={{ scale: 1.05 }}
                                            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                        >
                                            {userData.status && userData.status.trim() !== "" ? (
                                                <>
                                                    <div className="text-2xl font-bold text-purple-600">{userData.status.split(' ')[0]}</div>
                                                    <div className="text-sm text-gray-600">{userData.status.split(' ').slice(1).join(' ')}</div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="text-2xl font-bold text-purple-600">➕</div>
                                                    <div className="text-sm text-gray-600">Set Status</div>
                                                </>
                                            )}
                                            <AnimatePresence>
                                                {showStatusDropdown && (
                                                    <motion.div
                                                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl border z-50 w-48 max-h-48 overflow-y-auto"
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                    >
                                                        {userStatuses.map((status) => (
                                                            <button
                                                                key={status}
                                                                className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors first:rounded-t-lg last:rounded-b-lg flex items-center gap-2"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleStatusUpdate(status);
                                                                }}
                                                            >
                                                                <span className="text-lg">{status.split(' ')[0]}</span>
                                                                <span className="text-sm text-gray-700">{status.split(' ').slice(1).join(' ')}</span>
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                            
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            {/* Photo Modal */}
            <AnimatePresence>
                {showPhotoModal && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowPhotoModal(false)}
                    >
                        <motion.div
                            className="bg-white rounded-2xl p-6 max-w-md w-full"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center">
                                <div className="w-48 h-48 rounded-full overflow-hidden mx-auto mb-6 shadow-lg bg-gray-200">
                                    <img
                                        src={userData.photoURL}
                                        alt="Profile Picture"
                                        className="w-full h-full object-cover"
                                        referrerPolicy='no-referrer'
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                        onLoad={(e) => {
                                            e.target.nextSibling.style.display = 'none';
                                        }}
                                    />
                                    {/* Fallback avatar for modal */}
                                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                                        {userData.displayName ? userData.displayName.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                </div>
                                <div className="flex gap-4 justify-center">
                                    <motion.label
                                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Edit Photo
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files[0]) {
                                                    handlePhotoUpload(e.target.files[0]);
                                                }
                                            }}
                                        />
                                    </motion.label>
                                </div>

                                {/* Drag and Drop Area */}
                                <div
                                    className={`mt-4 border-2 border-dashed rounded-lg p-6 transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <p className="text-gray-600 text-sm">
                                        Or drag and drop an image here
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ScrollToTop />
        </div>
    );
};

export default Profile;