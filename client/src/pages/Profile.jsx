import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import axios from 'axios';
import FloatingParticals from '../components/FloatingParticals';
import ScrollToTop from '../components/ScrollToTop';

import { dummyUser, userStatuses } from './test/dummyUser';

const Profile = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editedProfile, setEditedProfile] = useState({});
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        // Check authentication
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (!user) {
                navigate('/login');
            }
        });

        // Fetch user data - replace with actual API call
        const fetchUserData = async () => {
            try {
                // const response = await axios.get('/api/user/profile');
                // setUserData(response.data);

                // Using dummy data for now
                setTimeout(() => {
                    setUserData(dummyUser);
                    setEditedProfile(dummyUser.id);
                    setLoading(false);
                }, 1000);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setLoading(false);
            }
        };

        fetchUserData();
        return () => unsubscribe();
    }, [navigate]);

    const handleStatusUpdate = async (newStatus) => {
        try {
            // await axios.put('/api/user/status', { status: newStatus });
            setUserData(prev => ({
                ...prev,
                id: { ...prev.id, status: newStatus }
            }));
            setShowStatusDropdown(false);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleProfileUpdate = async () => {
        try {
            // await axios.put('/api/user/profile', editedProfile);
            setUserData(prev => ({
                ...prev,
                id: editedProfile
            }));
            setIsEditingProfile(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handlePhotoUpload = async (file) => {
        try {
            const formData = new FormData();
            formData.append('photo', file);
            // await axios.put('/api/user/photo', formData);

            // For demo, create a URL for the uploaded file
            const photoURL = URL.createObjectURL(file);
            setUserData(prev => ({
                ...prev,
                id: { ...prev.id, photoURL }
            }));
            setShowPhotoModal(false);
        } catch (error) {
            console.error('Error uploading photo:', error);
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
                            <motion.button
                                className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold shadow-lg"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => signOut(auth)}
                            >
                                Sign Out
                            </motion.button>
                        </motion.div>

                        {/* Profile Section */}
                        <motion.div
                            className="bg-white rounded-2xl shadow-xl p-8 mb-8"
                            variants={fadeInUp}
                            whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
                        >
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Left Side */}
                                <div className="flex flex-col items-center lg:items-start">
                                    <motion.div
                                        className="relative group cursor-pointer"
                                        whileHover={{ scale: 1.05 }}
                                        onClick={() => setShowPhotoModal(true)}
                                    >
                                        <img
                                            src={userData.id.photoURL}
                                            alt="Profile"
                                            className="w-32 h-32 rounded-full object-cover shadow-lg"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full transition-all duration-300 flex items-center justify-center">
                                            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                📷
                                            </span>
                                        </div>
                                    </motion.div>
                                    
                                    {/* Last Login */}
                                    <div className="text-sm text-gray-500 mt-4 text-center lg:text-left">
                                        <span className="font-medium">Last active:</span><br />
                                        <span>
                                            {userData.id.lastLogin?.toDate ?
                                                userData.id.lastLogin.toDate().toLocaleString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true
                                                }) :
                                                new Date(userData.id.lastLogin).toLocaleString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })
                                            }
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
                                                <h2 className="text-3xl font-bold text-gray-900 gradient-background-text">{userData.id.displayName}</h2>
                                            )}
                                            <p className="text-gray-600 mt-1">{userData.id.email}</p>
                                        </div>
                                        <motion.button
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                if (isEditingProfile) {
                                                    handleProfileUpdate();
                                                } else {
                                                    setIsEditingProfile(true);
                                                }
                                            }}
                                        >
                                            {isEditingProfile ? 'Save' : 'Edit Profile'}
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
                                            />
                                        ) : (
                                            <p className="text-gray-600">{userData.id.bio}</p>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                        <motion.div
                                            className="text-center p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg"
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            <div className="text-2xl font-bold text-blue-600">{userData.id.blogsWritten}</div>
                                            <div className="text-sm text-gray-600">Masterpieces</div>
                                        </motion.div>
                                        <motion.div
                                            className="text-center p-4 bg-gradient-to-r from-green-100 to-teal-100 rounded-lg"
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            <div className="text-2xl font-bold text-green-600">{userData.id.followers}</div>
                                            <div className="text-sm text-gray-600">Followers</div>
                                        </motion.div>
                                        <motion.div
                                            className="text-center p-4 bg-gradient-to-r from-pink-100 to-orange-100 rounded-lg"
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            <div className="text-2xl font-bold text-pink-600">{userData.id.following}</div>
                                            <div className="text-sm text-gray-600">Following</div>
                                        </motion.div>
                                        <motion.div
                                            className="text-center p-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg cursor-pointer relative"
                                            whileHover={{ scale: 1.05 }}
                                            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                        >
                                            <div className="text-2xl font-bold text-purple-600">{userData.id.status.split(' ')[0]}</div>
                                            <div className="text-sm text-gray-600">{userData.id.status.split(' ').slice(1).join(' ')}</div>
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
                                <img
                                    src={userData.id.photoURL}
                                    alt="Profile"
                                    className="w-48 h-48 rounded-full object-cover mx-auto mb-6 shadow-lg"
                                />
                                <div className="flex gap-4 justify-center">
                                    <motion.button
                                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowPhotoModal(false)}
                                    >
                                        View Only
                                    </motion.button>
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