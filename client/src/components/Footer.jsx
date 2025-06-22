import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };
  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto z-10">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold text-center md:text-left">BloggersPoint</h3>
            <p className="text-gray-400 text-sm">Your one and only destination for amazing blogs!</p>
          </div>
          
          
          <div className="text-center md:text-right">
            <p className="text-gray-400 text-sm">
              Made with ❤️ by <span className="text-white font-medium">Abhishek Verma</span>
            </p>
            <p className="text-gray-500 text-xs mt-1">
              © {new Date().getFullYear()} BloggersPoint. All rights reserved.
            </p>
            {/* Navigation Links */}
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <p 
                onClick={() => handleNavigation('/tc')}
                className="text-blue-500 hover:text-blue-400 text-sm transition-colors duration-200 cursor-pointer"
              >
                Terms & Conditions
              </p>
              <p 
                onClick={() => handleNavigation('/privacy')}
                className="text-blue-500 hover:text-blue-400 text-sm transition-colors duration-200 cursor-pointer"
              >
                Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;