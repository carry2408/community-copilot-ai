import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { signInWithGoogle } from '../config/firebase'
import { Hexagon, ArrowRight, ShieldCheck, Zap, Bot, Loader2 } from 'lucide-react'

export default function Auth() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useAuth()
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  
  // If already logged in, go to onboarding or where they were headed
  const from = location.state?.from?.pathname || "/onboarding"

  useEffect(() => {
    if (currentUser) {
      navigate(from, { replace: true })
    }
  }, [currentUser, navigate, from])

  const handleLogin = async () => {
    setIsAuthenticating(true)
    try {
      await signInWithGoogle()
      // Note: If redirect happens, the page reloads, so we don't need to setAuthenticating(false) here.
      // If popup happens, currentUser will update and useEffect will navigate.
    } catch (error) {
      console.error("Login failed:", error)
      setIsAuthenticating(false)
    }
  }

  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-indigo-600 mb-4">
          <Loader2 className="animate-spin" size={32} />
        </div>
        <p className="text-gray-500 font-medium animate-pulse">Authenticating with Google...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[5%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1100px] w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 overflow-hidden relative z-10 border border-gray-100">
        
        {/* Left Side: Branding & Features */}
        <div className="bg-gray-900 p-12 lg:p-16 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle noise/gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
          
          <div>
            <div className="flex items-center gap-2.5 mb-12">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white text-black">
                <Hexagon size={22} fill="black" />
              </div>
              <span className="font-bold text-xl tracking-tight">Community Copilot AI</span>
            </div>

            <h2 className="text-4xl font-bold mb-8 leading-tight tracking-tight">
              Unlock your <br />
              <span className="text-indigo-400">Government Funding</span> potential.
            </h2>

            <div className="space-y-8">
              {[
                { icon: <Bot className="text-indigo-400" />, title: "AI-Powered Matching", desc: "Our 7 agents scan thousands of schemes to find your perfect fit." },
                { icon: <ShieldCheck className="text-emerald-400" />, title: "Precision Validation", desc: "Automated eligibility checking with detailed transparent reasoning." },
                { icon: <Zap className="text-amber-400" />, title: "Instant Roadmaps", desc: "Get a step-by-step application plan in under 2 minutes." }
              ].map((item, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.2 + i * 0.1 }}
                  key={i} className="flex gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{item.title}</h4>
                    <p className="text-sm text-gray-400 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-12 pt-12 border-t border-white/10">
            <p className="text-sm text-gray-500">
              Trusted by 500+ startups and MSMEs for automated funding assistance.
            </p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-12 lg:p-16 flex flex-col justify-center bg-white">
          <div className="max-w-sm mx-auto w-full">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="mb-10 text-center lg:text-left"
            >
              <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome Back</h3>
              <p className="text-gray-500">Sign in to access your funding dashboard and continue your analysis.</p>
            </motion.div>

            <div className="space-y-4">
              <button 
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 py-4 rounded-2xl font-semibold transition-all shadow-sm hover:shadow-md group"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12.16-4.53z"/>
                </svg>
                Continue with Google
                <ArrowRight size={18} className="text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-gray-400 font-medium">Enterprise SSO available</span>
                </div>
              </div>

              <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50">
                <p className="text-xs text-indigo-700 leading-relaxed text-center">
                  By continuing, you agree to Community Copilot AI's 
                  <span className="font-bold underline cursor-pointer ml-1">Terms of Service</span> and 
                  <span className="font-bold underline cursor-pointer ml-1">Privacy Policy</span>.
                </p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account? <span onClick={handleLogin} className="text-indigo-600 font-bold cursor-pointer hover:underline">Sign up for free</span>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
