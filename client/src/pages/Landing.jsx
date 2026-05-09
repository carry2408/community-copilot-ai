import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AIChatbot from '../components/chat/AIChatbot'
import { Brain, Search, Mic, ShieldCheck, FileText, Files, Map as MapIcon, Target, ClipboardList, ArrowRight, Zap, Hexagon, Bot, MessageSquare, Sparkles } from 'lucide-react'

const agents = [
  { icon: <Brain size={18} />, name: 'Intent Agent', color: '#7c3aed' },
  { icon: <Search size={18} />, name: 'Research Agent', color: '#0284c7' },
  { icon: <Mic size={18} />, name: 'Interview Agent', color: '#d97706' },
  { icon: <ShieldCheck size={18} />, name: 'Validation Agent', color: '#059669' },
  { icon: <FileText size={18} />, name: 'Simplifier Agent', color: '#db2777' },
  { icon: <Files size={18} />, name: 'Document Agent', color: '#0891b2' },
  { icon: <MapIcon size={18} />, name: 'Roadmap Agent', color: '#ea580c' },
]

const features = [
  { icon: <Search size={24} />, title: 'Discover Schemes', desc: 'AI searches 15+ government funding schemes matching your business profile instantly.' },
  { icon: <Target size={24} />, title: 'Check Eligibility', desc: 'A smart dynamic interview determines your exact eligibility with transparent reasoning.' },
  { icon: <ClipboardList size={24} />, title: 'Document Checklist', desc: 'Get a personalized list of required documents with missing-doc alerts and source links.' },
  { icon: <MapIcon size={24} />, title: 'Action Roadmap', desc: 'Step-by-step application plan with estimated timelines, quick wins, and clear reminders.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatTrigger, setChatTrigger] = useState(null)

  return (
    <div className="gradient-bg min-h-screen">
      {/* Hero */}
      <div className="max-w-[1400px] w-full mx-auto px-6 md:px-12 lg:px-16 pb-24 text-center" style={{ paddingTop: '180px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-10 text-sm font-medium"
            style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <Zap size={16} className="text-amber-500" />

          </div>

          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tight leading-[1.1] mb-8 text-gray-900">
            Navigate Government <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">
              Funding For Startup with AI
            </span>
          </h1>

          <p className="text-lg md:text-2xl max-w-4xl mx-auto mb-12 text-gray-500 leading-relaxed font-normal">
            The intelligent multi-agent platform that discovers schemes, validates eligibility,
            and creates actionable roadmaps for MSMEs & startups in India.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-28">
            <button onClick={() => navigate(currentUser ? '/dashboard' : '/onboarding')} className="glow-btn px-10 py-4 text-lg shadow-xl">
              {currentUser ? 'Go to Dashboard' : 'Start Free Analysis'}
              <ArrowRight size={20} />
            </button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="secondary-btn px-10 py-4 text-lg">
              Learn More
            </button>
          </div>
        </motion.div>
      </div>

      {/* Chat Hero Section - FULL WIDTH GRADIENT */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative overflow-hidden mb-32 bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 py-24 md:py-32 text-center text-white shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-400 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8 mx-auto backdrop-blur-md border border-white/30">
            <Bot size={32} />
          </div>
          <h2 className="text-4xl md:text-7xl font-black mb-8 tracking-tight leading-tight">Have a question? Just ask.</h2>
          <p className="text-lg md:text-2xl text-indigo-100 mb-12 leading-relaxed font-medium max-w-4xl mx-auto">
            Community Copilot can answer questions about any government scheme, <br className="hidden md:block" />
            document requirements, or application process — instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <button 
              onClick={() => {
                setChatTrigger("How can Community Copilot help me?")
                setTimeout(() => setChatTrigger(null), 100)
              }}
              className="bg-white text-indigo-700 px-10 py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 hover:bg-indigo-50 transition-all shadow-2xl"
            >
              <MessageSquare size={24} />
              Open Chat Copilot
            </button>
            <button 
              onClick={() => navigate('/onboarding')}
              className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-10 py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 hover:bg-white/20 transition-all"
            >
              <Sparkles size={24} />
              Full Analysis
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              "PM Vishwakarma scheme eligibility",
              "MSME loan subsidy in Karnataka",
              "Stand Up India for women",
              "Startup India DPIIT benefits"
            ].map(pill => (
              <button 
                key={pill}
                onClick={() => {
                  setChatTrigger(pill)
                  setTimeout(() => setChatTrigger(null), 100)
                }}
                className="bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 rounded-full text-sm font-bold backdrop-blur-sm transition-all"
              >
                {pill}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="max-w-[1400px] w-full mx-auto px-6 md:px-12 lg:px-16">
        {/* Agent Orbit */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-4 mb-32 max-w-5xl mx-auto">
          {agents.map((agent, i) => (
            <motion.div key={agent.name}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="glass-card glass-card-hover px-6 py-3.5 flex items-center gap-3 cursor-default bg-white"
            >
              <div style={{ color: agent.color }}>{agent.icon}</div>
              <span className="text-base font-semibold text-gray-700">{agent.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Features */}
      <div id="features" className="w-full border-t border-gray-100 bg-white/50" style={{ paddingTop: '120px', paddingBottom: '120px' }}>
        <div className="max-w-[1400px] w-full mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-6">
              Everything you need to secure funding
            </h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
              Our platform orchestrates multiple specialized AI agents in the background to handle every step of the complex funding process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {features.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }} transition={{ delay: i * 0.1 }}
                className="glass-card glass-card-hover p-10 bg-white shadow-lg"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-8 text-indigo-600 border border-indigo-100">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 tracking-tight">{f.title}</h3>
                <p className="text-base text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-md flex items-center justify-center bg-black text-white">
            <Hexagon size={14} />
          </div>
          <span className="font-semibold text-gray-900">Community Copilot AI</span>
        </div>
        <p className="text-sm text-gray-500">
          <p>&copy; 2026 Community Copilot AI. All rights reserved.</p>
        </p>
      </footer>
      <AIChatbot 
        isOpenExternally={isChatOpen} 
        setIsOpenExternally={setIsChatOpen} 
        triggeredMessage={chatTrigger}
      />
    </div>
  )
}
