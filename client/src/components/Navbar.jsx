import { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';

const API = import.meta.env.VITE_API;

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        // Pass currentUser directly instead of relying on state
        fetchUserProfile(currentUser);
      } else {
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch user profile data from API
  const fetchUserProfile = async (userObj = user) => {
    // Use the passed userObj or fallback to state user
    if (!userObj || !userObj.uid) {
      console.error('No user object or uid available');
      return;
    }

    try {
      const response = await axios.get(`${API}/user/name-photo?uid=${userObj.uid}`);
      if(response && response.status === 200){
        setUserProfile(response.data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleProfileClick = () => {
    navigate('/profile');
    setIsMenuOpen(false);
  };

  const handleGetStarted = () => {
    navigate('/register');
    setIsMenuOpen(false);
  };

  const handleLogin = () => {
    navigate('/login');
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-blue-950 text-white shadow-lg relative z-40">
        <div className="w-full mx-auto px-5 sm:px-6 lg:px-8 mb-3 mt-1">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-4xl font-bold gradient-background-text leading-12">BloggersPoint</h1>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <p className="text-blue-400 hover:bg-blue-950 px-3 py-2 rounded-md text-base font-medium transition-colors cursor-pointer" onClick={() => navigate('/')}>
                  Home
                </p>
                <p className="text-blue-400 hover:bg-blue-950 px-3 py-2 rounded-md text-base font-medium transition-colors cursor-pointer" onClick={() => navigate('/explore')}>
                  Blogs
                </p>
                <a target='_blank' href="https://portfolio-abhishek-verma.web.app/" className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 px-3 py-2 rounded-md text-base font-medium transition-all">
                  About the Dev
                </a>
                
                {/* Authentication Section - Desktop */}
                {!loading && (
                  <>
                    {user && userProfile ? (
                      // Show profile picture when logged in
                      <div 
                        onClick={handleProfileClick}
                        className="cursor-pointer flex items-center"
                      >
                        <img
                          src={userProfile.photoURL}
                          alt="Profile"
                          referrerPolicy='no-referrer'
                          className="w-12 h-12 rounded-full border-2 border-blue-400 hover:border-purple-500 transition-colors object-cover shadow-lg"
                        />
                      </div>
                    ) : (
                      // Show Get Started and Login buttons when not logged in
                      <div className="flex items-center space-x-3 ml-6">
                        <button
                          onClick={handleGetStarted}
                          className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 px-5 py-2.5 rounded-md text-white font-medium transition-all transform hover:scale-105 shadow-lg"
                        >
                          Get Started
                        </button>
                        <button
                          onClick={handleLogin}
                          className="border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-5 py-2.5 rounded-md font-medium transition-colors"
                        >
                          Login
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="ml-2.5 inline-flex items-center justify-center p-2 rounded-md hover:bg-blue-700 text-white focus:outline-none transition-colors"
                style={{ backgroundColor: '#030b30' }}
              >
                <span className="sr-only">Open main menu</span>
                {!isMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Backdrop Blur Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 z-30 md:hidden transition-all duration-300"></div>
      )}

      {/* Mobile Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-80 bg-blue-950/95 backdrop-blur-md text-white z-100 transform transition-transform duration-300 ease-in-out md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-blue-800/50">
          <h2 className="text-xl font-bold">Menu</h2>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="ml-2.5 inline-flex items-center justify-center p-2 rounded-md hover:bg-blue-700 text-white focus:outline-none transition-colors"
            style={{ backgroundColor: '#030b30' }}
          >
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col justify-between p-3">
          {/* Authentication Section - Mobile (Bottom) */}
          {!loading && (
            <div className="border-blue-800/50">
              {user && userProfile && (
                // Show profile with photo and name
                <div 
                  onClick={handleProfileClick}
                  className="flex items-center space-x-3 p-2 hover:bg-blue-950/50 rounded-md cursor-pointer transition-colors"
                >
                  <img
                    src={userProfile.photoURL}
                    alt="Profile"
                    referrerPolicy='no-referrer'
                    className="w-12 h-12 rounded-full border-2 border-blue-400 object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium">{userProfile.displayName || 'User'}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Navigation Links */}
          <div className="space-y-2">
            <p className="text-blue-400 hover:bg-blue-950/50 px-3 py-2 rounded-md text-base font-medium transition-colors cursor-pointer" onClick={() => { navigate('/'); setIsMenuOpen(false); }}>
              Home
            </p>
            <p className="text-blue-400 hover:bg-blue-950/50 px-3 py-2 rounded-md text-base font-medium transition-colors cursor-pointer" onClick={() => { navigate('/explore'); setIsMenuOpen(false); }}>
              Blogs
            </p>
            <a target='_blank' href="https://portfolio-abhishekverma.web.app/" className="block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 px-3 py-2 rounded-md text-base font-medium transition-all">
              About the Dev
            </a>
          </div>

          {!loading && (
            <div className="pt-3 border-blue-800/50">
              {!user && !userProfile && (                
                // Show Get Started and Login buttons
                <div className="space-y-3">
                  <button
                    onClick={handleGetStarted}
                    className="w-full bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 px-4 py-3 rounded-md text-white font-medium transition-all transform hover:scale-105"
                  >
                    Get Started
                  </button>
                  <button
                    onClick={handleLogin}
                    className="w-full border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-4 py-3 rounded-md font-medium transition-colors"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;