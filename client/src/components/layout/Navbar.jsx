import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Navbar() {
  const location = useLocation()
  const isHome = location.pathname === '/'

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
          <Link to="/onboarding" className="glow-btn text-sm !py-2 !px-5 no-underline">
            Get Started
          </Link>
        </div>
      </div>
    </motion.nav>
  )
}
