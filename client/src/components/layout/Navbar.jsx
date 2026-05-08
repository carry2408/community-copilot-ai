import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { signInWithGoogle, logOut } from '../../config/firebase'

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
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)'
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
            style={{ background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-violet))' }}>
            🚀
          </div>
          <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Community Copilot
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: 'var(--glow-indigo)', color: 'var(--accent-indigo)' }}>
            AI
          </span>
        </Link>

        <div className="flex items-center gap-6">
          {!isHome && (
            <Link to="/" className="text-sm no-underline" style={{ color: 'var(--text-secondary)' }}>
              Home
            </Link>
          )}
          
          {currentUser ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img 
                  src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName}&background=random`} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full border border-[rgba(255,255,255,0.1)]"
                />
                <span className="text-sm font-medium hidden md:block" style={{ color: 'var(--text-primary)' }}>
                  {currentUser.displayName?.split(' ')[0] || 'User'}
                </span>
              </div>
              <button 
                onClick={handleAuthAction}
                className="text-sm font-medium transition-colors hover:text-red-400"
                style={{ color: 'var(--text-secondary)' }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={handleAuthAction} 
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                </g>
              </svg>
              Sign In
            </button>
          )}
          <Link to="/onboarding" className="glow-btn text-sm !py-2 !px-5 no-underline">
            Get Started
          </Link>
        </div>
      </div>
    </motion.nav>
  )
}
