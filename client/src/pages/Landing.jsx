import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Brain, Search, Mic, ShieldCheck, FileText, Files, Map as MapIcon, Target, ClipboardList, ArrowRight, Zap, Hexagon } from 'lucide-react'

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

  return (
    <div className="gradient-bg min-h-screen">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-40 pb-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-8 text-xs font-medium"
            style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <Zap size={14} className="text-amber-500" />
            <span>Powered by 7 Specialized AI Agents</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-gray-900">
            Navigate Government <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">
              Funding with AI
            </span>
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 text-gray-500 leading-relaxed font-normal">
            The intelligent multi-agent platform that discovers schemes, validates eligibility, 
            and creates actionable roadmaps for MSMEs & startups in India.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <button onClick={() => navigate('/onboarding')} className="glow-btn px-8 py-3.5 text-base shadow-lg">
              Start Free Analysis
              <ArrowRight size={18} />
            </button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="secondary-btn px-8 py-3.5 text-base">
              Learn More
            </button>
          </div>
        </motion.div>

        {/* Agent Orbit */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-3 mb-24 max-w-4xl mx-auto">
          {agents.map((agent, i) => (
            <motion.div key={agent.name}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="glass-card glass-card-hover px-4 py-2.5 flex items-center gap-2.5 cursor-default bg-white"
            >
              <div style={{ color: agent.color }}>{agent.icon}</div>
              <span className="text-sm font-medium text-gray-700">{agent.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Features */}
      <div id="features" className="max-w-6xl mx-auto px-6 pb-24 border-t border-gray-100 pt-24 bg-white/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
            Everything you need to secure funding
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Our platform orchestrates multiple specialized AI agents in the background to handle every step of the complex funding process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }} transition={{ delay: i * 0.1 }}
              className="glass-card glass-card-hover p-8 bg-white"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-6 text-gray-900 border border-gray-100">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 tracking-tight">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
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
          Built for the Google AI Hackathon 2025.
        </p>
      </footer>
    </div>
  )
}
