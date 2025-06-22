import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

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
              <div className="ml-10 flex items-baseline space-x-4">
                <p className="text-blue-400 hover:bg-blue-950 px-3 py-2 rounded-md text-sl font-medium transition-colors cursor-pointer" onClick={() => navigate('/')}>
                  Home
                </p>
                <p className="text-blue-400 hover:bg-blue-950 px-3 py-2 rounded-md text-sl font-medium transition-colors cursor-pointer" onClick={() => navigate('/explore')}>
                  Blogs
                </p>
                <a target='_blank' href="https://portfolio-abhishekverma.web.app/" className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 px-3 py-2 rounded-md text-sl font-medium transition-all">
                  About the Dev
                </a>
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

        <div className="px-5 py-4 space-y-2">
          <p className="text-blue-400 hover:bg-blue-950/50 px-3 py-2 rounded-md text-sl font-medium transition-colors cursor-pointer" onClick={() => navigate('/')}>
            Home
          </p>
          <p className="text-blue-400 hover:bg-blue-950/50 px-3 py-2 rounded-md text-sl font-medium transition-colors cursor-pointer" onClick={() => navigate('/explore')}>
            Blogs
          </p>
          <a target='_blank' href="https://portfolio-abhishekverma.web.app/" className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 px-3 py-2 rounded-md text-sl font-medium transition-all">
            About the Dev
          </a>
        </div>
      </div>
    </>
  );
};

export default Navbar;