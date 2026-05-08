import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const agents = [
  { emoji: '🧠', name: 'Intent Agent', color: '#8b5cf6' },
  { emoji: '🔍', name: 'Research Agent', color: '#3b82f6' },
  { emoji: '🎤', name: 'Interview Agent', color: '#f59e0b' },
  { emoji: '✅', name: 'Validation Agent', color: '#22c55e' },
  { emoji: '📝', name: 'Simplifier Agent', color: '#ec4899' },
  { emoji: '📋', name: 'Document Agent', color: '#06b6d4' },
  { emoji: '🗺️', name: 'Roadmap Agent', color: '#f97316' },
]

const features = [
  { icon: '🔎', title: 'Discover Schemes', desc: 'AI searches 15+ government funding schemes matching your business profile' },
  { icon: '🎯', title: 'Check Eligibility', desc: 'Smart interview determines your exact eligibility with transparent reasoning' },
  { icon: '📋', title: 'Document Checklist', desc: 'Get a personalized list of required documents with missing-doc alerts' },
  { icon: '🗺️', title: 'Action Roadmap', desc: 'Step-by-step application plan with timelines and reminders' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="gradient-bg min-h-screen">
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-sm"
            style={{ background: 'var(--glow-indigo)', color: 'var(--accent-indigo)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <span className="pulse-dot status-done" style={{ width: 6, height: 6 }}></span>
            Powered by 7 AI Agents + Gemini
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            <span style={{ color: 'var(--text-primary)' }}>Navigate Government</span>
            <br />
            <span style={{
              background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-cyan))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              Funding with AI
            </span>
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: 'var(--text-secondary)' }}>
            AI-powered multi-agent system that discovers schemes, validates eligibility, 
            and creates actionable roadmaps for MSMEs & startups in India.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button onClick={() => navigate('/onboarding')} className="glow-btn text-base !py-3.5 !px-8">
              🚀 Start Free Analysis
            </button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3.5 rounded-xl text-base font-semibold transition-all hover:bg-white/5"
              style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', background: 'transparent' }}>
              Learn More ↓
            </button>
          </div>
        </motion.div>

        {/* Agent Orbit */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="flex flex-wrap justify-center gap-3 mb-20">
          {agents.map((agent, i) => (
            <motion.div key={agent.name}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="glass-card glass-card-hover px-4 py-2.5 flex items-center gap-2 cursor-default"
              style={{ borderColor: `${agent.color}20` }}>
              <span className="text-lg">{agent.emoji}</span>
              <span className="text-sm font-medium" style={{ color: agent.color }}>{agent.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Features */}
      <div id="features" className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--text-primary)' }}>
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass-card glass-card-hover p-6">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t py-8 text-center text-sm" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
        Built with ❤️ for Google AI Hackathon 2025 — Community Copilot AI
      </div>
    </div>
  )
}
