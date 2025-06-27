import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Footer from './components/Footer'
import Navbar from './components/Navbar'

import LandingPage from './pages/Landing'
import TermsAndConditions from './pages/TC'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Explore from './pages/Explore'
import BlogPostPage from './pages/Blog'
import Profile from './pages/Profile'
import IntroPage from './pages/Auth/IntroPage'
import BlogCreator from './pages/BlogCreator'
import MyBlogs from './pages/MyBlogs'

function App() {
  return (
	<div className="min-h-screen flex flex-col" id='container'>
		<BrowserRouter>
			<Navbar />
			<Routes>
				{/* Public Routes */}
				<Route path="/" element={<LandingPage />} />
				<Route path="/tc" element={<TermsAndConditions />} />
				<Route path="/privacy" element={<PrivacyPolicy />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/explore" element={<Explore />} />

				<Route path="/blog" element={<BlogPostPage />} />
				<Route path="/getting-started" element={<IntroPage />} />
				<Route path="/write" element={<BlogCreator />} />
				<Route path="/my-blogs" element={<MyBlogs />} />

				{/* 

				
				/*}
				{/* User Routes */}
				<Route path="/profile" element={<Profile />} />				
				{/* 				
				
				<Route path="/create" element={<Create />} />
				<Route path="/post/:blogId" element={<Post />} />
				
				 */}
			</Routes>
			<Footer />
		</BrowserRouter>
	</div>
	
  )
}

export default App
