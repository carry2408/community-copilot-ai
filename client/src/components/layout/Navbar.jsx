import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { signInWithGoogle, logOut } from '../../config/firebase'
import { Hexagon, LogOut } from 'lucide-react'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'
  const { currentUser } = useAuth()

  const handleAuthAction = async () => {
    try {
      if (currentUser) {
        await logOut()
        navigate('/')
      } else {
        await signInWithGoogle()
      }
    } catch (error) {
      console.error("Authentication failed:", error)
    }
  }

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200"
    >
      <div className="max-w-[1600px] w-full mx-auto px-6 md:px-12 lg:px-16 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 no-underline group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black text-white group-hover:bg-gray-800 transition-colors">
            <Hexagon size={18} />
          </div>
          <span className="font-bold text-lg text-gray-900 tracking-tight">
            Community Copilot
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            AI
          </span>
        </Link>

        <div className="flex items-center gap-6">
          {!isHome && (
            <Link to="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Home
            </Link>
          )}
          
          {currentUser ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                <img 
                  src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName}&background=0D8ABC&color=fff`} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                />
                <span className="text-sm font-semibold text-gray-700 hidden md:block">
                  {currentUser.displayName?.split(' ')[0] || 'User'}
                </span>
              </div>
              <button 
                onClick={() => { logOut(); navigate('/') }}
                className="text-sm font-medium text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          ) : (
            <Link to="/login" className="secondary-btn">
              Sign In
            </Link>
          )}
          <Link to="/onboarding" className="glow-btn">
            Get Started
          </Link>
        </div>
      </div>
    </motion.nav>
  )
}
