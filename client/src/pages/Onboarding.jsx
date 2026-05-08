import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useWorkflowStore } from '../store/workflowStore'
import { startWorkflow, createSSEConnection } from '../services/api'

const businessTypes = [
  { value: 'startup', label: '🚀 Startup' },
  { value: 'micro', label: '🏪 Micro Enterprise' },
  { value: 'small', label: '🏭 Small Enterprise' },
  { value: 'medium', label: '🏢 Medium Enterprise' },
  { value: 'proprietorship', label: '👤 Proprietorship' },
  { value: 'partnership', label: '🤝 Partnership Firm' },
  { value: 'pvt_ltd', label: '🏛️ Private Limited' },
  { value: 'llp', label: '📜 LLP' },
]

const states = [
  'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Delhi', 'Gujarat', 'Telangana',
  'Uttar Pradesh', 'Rajasthan', 'Kerala', 'West Bengal', 'Madhya Pradesh',
  'Andhra Pradesh', 'Bihar', 'Punjab', 'Haryana', 'Other'
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { setWorkflowId, setBusinessDetails, setStatus, addAgentEvent } = useWorkflowStore()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    businessType: '', state: '', fundingGoal: '',
    revenue: '', startupAge: '', description: ''
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.businessType || !form.state) return
    setLoading(true)

    try {
      const details = {
        ...form,
        fundingGoal: Number(form.fundingGoal) || 10,
        revenue: Number(form.revenue) || 0,
        startupAge: Number(form.startupAge) || 0
      }
      setBusinessDetails(details)

      const { workflowId } = await startWorkflow(details)
      setWorkflowId(workflowId)
      setStatus('running')

      // Connect SSE
      createSSEConnection(workflowId, (event) => {
        addAgentEvent(event)
      })

      navigate('/workflow')
    } catch (error) {
      console.error('Failed to start workflow:', error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Tell us about your business
          </h1>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
            Our AI agents will analyze your profile and find the best government funding schemes for you.
          </p>
        </motion.div>

        <motion.form onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card p-8 space-y-6">

          {/* Business Type */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Business Type *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {businessTypes.map(t => (
                <button type="button" key={t.value}
                  onClick={() => update('businessType', t.value)}
                  className="p-3 rounded-xl text-sm font-medium transition-all text-left"
                  style={{
                    background: form.businessType === t.value ? 'var(--glow-indigo)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${form.businessType === t.value ? 'var(--accent-indigo)' : 'var(--border-subtle)'}`,
                    color: form.businessType === t.value ? 'var(--accent-indigo)' : 'var(--text-secondary)'
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              State *
            </label>
            <select className="input-dark" value={form.state} onChange={e => update('state', e.target.value)}>
              <option value="">Select your state</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Revenue + Age row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Annual Revenue (₹ Lakhs)
              </label>
              <input type="number" className="input-dark" placeholder="e.g. 50"
                value={form.revenue} onChange={e => update('revenue', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Business Age (Years)
              </label>
              <input type="number" className="input-dark" placeholder="e.g. 2"
                value={form.startupAge} onChange={e => update('startupAge', e.target.value)} />
            </div>
          </div>

          {/* Funding Goal */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Funding Goal (₹ Lakhs)
            </label>
            <input type="number" className="input-dark" placeholder="e.g. 25"
              value={form.fundingGoal} onChange={e => update('fundingGoal', e.target.value)} />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Brief Business Description
            </label>
            <textarea className="input-dark" rows={3} placeholder="What does your business do? (optional)"
              value={form.description} onChange={e => update('description', e.target.value)} />
          </div>

          <button type="submit" className="glow-btn w-full !py-4 text-base"
            disabled={!form.businessType || !form.state || loading}>
            {loading ? '🔄 Starting AI Analysis...' : '🚀 Analyze My Business'}
          </button>
        </motion.form>
      </div>
    </div>
  )
}
