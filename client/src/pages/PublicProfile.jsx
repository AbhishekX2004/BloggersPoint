/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import axios from 'axios';
import FloatingParticals from '../components/FloatingParticals';
import ScrollToTop from '../components/ScrollToTop';
import { useNotification } from '../components/Notification';
const API = import.meta.env.VITE_API;

const PublicProfile = () => {
	const navigate = useNavigate();
	const { uid: profileUid } = useParams();
	const [user, setUser] = useState(null);
	const [userData, setUserData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isFollowing, setIsFollowing] = useState(false);
	const [followers, setFollowers] = useState(0);
	const [userInterests, setUserInterests] = useState([]);
	const [allTags, setAllTags] = useState([]);
	const { info } = useNotification();

	useEffect(() => {
		// Check authentication
		const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
			setUser(currentUser);
			await fetchProfileData(currentUser);
		});
		return () => unsubscribe();
	}, [profileUid]);

	const fetchProfileData = async (currentUser) => {
		try {
			setLoading(true);
			setError(null);

			// Fetch user profile data
			const profileResponse = await axios.get(`${API}/user/?uid=${profileUid}`);
			setUserData(profileResponse.data);
			setFollowers(profileResponse.data.followers || 0);

			// Fetch user interests and all tags in parallel
			const [tagsResponse, interestsResponse] = await Promise.all([
				axios.get(`${API}/params/tags`),
				axios.get(`${API}/user/interests?uid=${profileUid}`)
			]);

			if (tagsResponse.data.status === 'success') {
				setAllTags(tagsResponse.data.tags);
			}

			if (interestsResponse.data.status === 'success') {
				setUserInterests(interestsResponse.data.interests);
			}

			// Check follow status if user is logged in
			if (currentUser && profileUid !== currentUser.uid) {
				await checkFollowStatus(currentUser);
			}

		} catch (error) {
			console.error('Error fetching profile data:', error);
			setError('Failed to load profile data. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	// Check initial follow status
	const checkFollowStatus = async (currentUser) => {
		if (!currentUser || !profileUid) return;

		try {
			const { data } = await axios.get(`${API}/social/checkfollow`, {
				params: { uid: currentUser.uid, authorUid: profileUid }
			});
			setIsFollowing(data.isFollowing);
		} catch (error) {
			console.error('Error checking follow status:', error);
		}
	};

	// Handle follow/unfollow
	const handleFollow = async () => {
		if (!user) {
			navigate('/login');
			return;
		}

		try {
			const newFollowState = !isFollowing;
			const newFollowersCount = newFollowState ? followers + 1 : followers - 1;

			// Optimistic update
			setIsFollowing(newFollowState);
			setFollowers(newFollowersCount);

			const endpoint = newFollowState ? 'follow' : 'unfollow';
			const bodyKey = newFollowState ? 'followUid' : 'unfollowUid';

			await axios.post(`${API}/social/${endpoint}`, {
				uid: user.uid,
				[bodyKey]: profileUid
			});

		} catch (error) {
			console.error('Error handling follow:', error);
			// Revert on error
			setIsFollowing(!isFollowing);
			setFollowers(followers);
		}
	};

	// Handle share author
	const handleShareAuthor = async () => {
		try {
			if (navigator.share) {
				await navigator.share({
					title: `${userData.displayName}'s Profile`,
					text: `Check out ${userData.displayName}'s profile and their amazing blogs!`,
					url: window.location.href
				});
			} else {
				await navigator.clipboard.writeText(window.location.href);
				info('Link copied to clipboard!');
			}
		} catch (error) {
			console.error('Error sharing:', error);
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
					<p className="text-gray-600 text-lg">Loading profile...</p>
				</motion.div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
				<FloatingParticals particals={30} />
				<motion.div
					className="text-center relative z-10"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
				>
					<p className="text-red-600 text-lg mb-4">{error}</p>
					<motion.button
						className="bg-blue-600 text-white px-6 py-2 rounded-lg"
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={() => window.location.reload()}
					>
						Try Again
					</motion.button>
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
								<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Profile</span>
							</h1>
							<motion.button
								className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold shadow-lg"
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => {
                                    if (window.history.length > 2) {
                                        navigate(-1);
                                    } else {
                                        navigate('/explore');
                                    }
                                }}
							>
							    Back
							</motion.button>
						</motion.div>

						{/* Profile Section */}
						<motion.div
							className="bg-white rounded-2xl shadow-xl p-8 mb-8 relative"
							variants={fadeInUp}
							whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
						>
							<div className="flex flex-col lg:flex-row gap-8">
								{/* Left Side */}
								<div className="flex flex-col items-center lg:items-start">
									<motion.div
										className="relative group"
										whileHover={{ scale: 1.05 }}
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

									{/* Follow Button */}
									{user && userData.uid !== user.uid && (
										<motion.button
											className={`cursor-pointer w-full py-2 px-4 rounded-lg font-medium transition-colors mb-4 mt-4 ${isFollowing
												? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
												: 'bg-blue-600 text-white hover:bg-blue-700'
												}`}
											onClick={handleFollow}
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
										>
											{isFollowing ? 'Unfollow' : 'Follow'} Author
										</motion.button>
									)}

									{/* Author's Blogs Button */}
									<motion.button
										className="group bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden w-full mt-2"
										whileHover={{
											scale: 1.05,
											boxShadow: "0 20px 40px -12px rgba(251, 146, 60, 0.4)"
										}}
										whileTap={{ scale: 0.98 }}
										onClick={() => {navigate(`/explore?author=${userData.displayName}`); window.scrollTo(0,0);}}
									>
										{/* Background animation effect */}
										<div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

										{/* Book/Blog icon */}
										<motion.svg
											className="w-5 h-5 relative z-10"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											whileHover={{ scale: [1, 1.1, 1] }}
											transition={{ duration: 0.5 }}
										>
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
										</motion.svg>

										<span className="relative z-10">Author's Blogs</span>
									</motion.button>

									{/* Share Author Button */}
									<motion.button
										className="group bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden w-full mt-2"
										whileHover={{
											scale: 1.05,
											boxShadow: "0 20px 40px -12px rgba(16, 185, 129, 0.4)"
										}}
										whileTap={{ scale: 0.98 }}
										onClick={handleShareAuthor}
									>
										{/* Background animation effect */}
										<div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

										{/* Share icon */}
										<motion.svg
											className="w-5 h-5 relative z-10"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											whileHover={{ rotate: [0, 5, -5, 0] }}
											transition={{ duration: 0.6 }}
										>
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
										</motion.svg>

										<span className="relative z-10">Share Author</span>
									</motion.button>
								</div>

								{/* Right Side - Profile Info */}
								<div className="flex-1">
									<div className="flex justify-between items-start mb-6">
										<div>
											<h2 className="text-3xl font-bold text-gray-900 gradient-background-text">{userData.displayName}</h2>
											<p className="text-gray-600 mt-1">{userData.email}</p>
										</div>
									</div>

									{/* Bio */}
									<div className="mb-6">
										<h3 className="text-lg font-semibold text-gray-800 mb-2">Bio</h3>
										<div className="text-gray-600 whitespace-pre-wrap">
											{userData.bio || "No bio added yet."}
										</div>
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
											<div className="text-2xl font-bold text-green-600">{followers}</div>
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
											className="text-center p-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg"
											whileHover={{ scale: 1.05 }}
										>
											{userData.status && userData.status.trim() !== "" ? (
												<>
													<div className="text-2xl font-bold text-purple-600">{userData.status.split(' ')[0]}</div>
													<div className="text-sm text-gray-600">{userData.status.split(' ').slice(1).join(' ')}</div>
												</>
											) : (
												<>
													<div className="text-2xl font-bold text-purple-600">😊</div>
													<div className="text-sm text-gray-600">No Status</div>
												</>
											)}
										</motion.div>
									</div>
								</div>
							</div>

							{/* User Interests Section */}
							<div className="mt-8 pt-6 border-t border-gray-200">
								<h3 className="text-xl font-semibold text-gray-800 mb-4">Interests</h3>
								{userInterests.length > 0 ? (
									<motion.div 
										className="flex flex-wrap gap-2"
										initial="hidden"
										animate="visible"
										variants={staggerChildren}
									>
										{userInterests.map((interest, index) => (
											<motion.span
												key={interest}
												className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-200 hover:from-blue-200 hover:to-purple-200 transition-colors"
												variants={fadeInUp}
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
											>
												{interest}
											</motion.span>
										))}
									</motion.div>
								) : (
									<p className="text-gray-500 italic">No interests added yet.</p>
								)}
							</div>
						</motion.div>
					</div>
				</motion.div>
			</div>

			<ScrollToTop />
		</div>
	);
};

export default PublicProfile;