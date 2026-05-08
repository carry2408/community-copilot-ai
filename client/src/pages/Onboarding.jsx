import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useWorkflowStore } from '../store/workflowStore'
import { startWorkflow, createSSEConnection } from '../services/api'
import { Rocket, Store, Factory, Building2, User, Users, Landmark, ScrollText, Sparkles, Loader2 } from 'lucide-react'

const businessTypes = [
  { value: 'startup', label: 'Startup', icon: <Rocket size={16} /> },
  { value: 'micro', label: 'Micro Enterprise', icon: <Store size={16} /> },
  { value: 'small', label: 'Small Enterprise', icon: <Factory size={16} /> },
  { value: 'medium', label: 'Medium Enterprise', icon: <Building2 size={16} /> },
  { value: 'proprietorship', label: 'Proprietorship', icon: <User size={16} /> },
  { value: 'partnership', label: 'Partnership Firm', icon: <Users size={16} /> },
  { value: 'pvt_ltd', label: 'Private Limited', icon: <Landmark size={16} /> },
  { value: 'llp', label: 'LLP', icon: <ScrollText size={16} /> },
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
    <div className="min-h-screen pt-24 pb-12 px-6 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3 tracking-tight text-gray-900">
            Tell us about your business
          </h1>
          <p className="text-gray-500">
            Our AI agents will analyze your profile and find the best government funding schemes for you.
          </p>
        </motion.div>

        <motion.form onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card p-8 space-y-8 bg-white shadow-sm border border-gray-200">

          {/* Business Type */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-900">
              Business Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {businessTypes.map(t => {
                const isActive = form.businessType === t.value;
                return (
                  <button type="button" key={t.value}
                    onClick={() => update('businessType', t.value)}
                    className="p-4 rounded-xl text-sm font-medium transition-all text-left flex items-center gap-3"
                    style={{
                      background: isActive ? 'var(--glow-indigo)' : '#fafafa',
                      border: `1px solid ${isActive ? 'var(--accent-indigo)' : 'var(--border-subtle)'}`,
                      color: isActive ? 'var(--accent-indigo)' : 'var(--text-secondary)'
                    }}>
                    <div className={isActive ? 'text-indigo-600' : 'text-gray-400'}>{t.icon}</div>
                    <span className={isActive ? 'text-indigo-700' : 'text-gray-600'}>{t.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">
              State <span className="text-red-500">*</span>
            </label>
            <select className="input-dark bg-gray-50" value={form.state} onChange={e => update('state', e.target.value)}>
              <option value="">Select your state</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Revenue + Age row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">
                Annual Revenue (₹ Lakhs)
              </label>
              <input type="number" className="input-dark bg-gray-50" placeholder="e.g. 50"
                value={form.revenue} onChange={e => update('revenue', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-900">
                Business Age (Years)
              </label>
              <input type="number" className="input-dark bg-gray-50" placeholder="e.g. 2"
                value={form.startupAge} onChange={e => update('startupAge', e.target.value)} />
            </div>
          </div>

          {/* Funding Goal */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">
              Funding Goal (₹ Lakhs)
            </label>
            <input type="number" className="input-dark bg-gray-50" placeholder="e.g. 25"
              value={form.fundingGoal} onChange={e => update('fundingGoal', e.target.value)} />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-900">
              Brief Business Description
            </label>
            <textarea className="input-dark bg-gray-50 resize-none" rows={3} placeholder="What does your business do? (optional)"
              value={form.description} onChange={e => update('description', e.target.value)} />
          </div>

          <button type="submit" className="glow-btn w-full !py-4 text-base mt-4 shadow-md"
            disabled={!form.businessType || !form.state || loading}>
            {loading ? (
              <><Loader2 className="animate-spin" size={20} /> Starting AI Analysis...</>
            ) : (
              <><Sparkles size={20} /> Analyze My Business</>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  )
}
