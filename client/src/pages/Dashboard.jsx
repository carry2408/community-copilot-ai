import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useWorkflowStore } from '../store/workflowStore'

function TabButton({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
      style={{
        background: active ? 'var(--glow-indigo)' : 'transparent',
        color: active ? 'var(--accent-indigo)' : 'var(--text-secondary)',
        border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent'
      }}>
      {children}
    </button>
  )
}

function EligibilityTab({ results }) {
  if (!results || !results.length) return <p style={{ color: 'var(--text-secondary)' }}>No eligibility results yet.</p>

  const statusColors = { eligible: '#22c55e', partially_eligible: '#f59e0b', not_eligible: '#ef4444' }
  const statusLabels = { eligible: '✅ Eligible', partially_eligible: '🟡 Partially Eligible', not_eligible: '❌ Not Eligible' }

  return (
    <div className="space-y-4">
      {results.map((r, i) => (
        <motion.div key={r.schemeId || i}
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
          className="glass-card p-5">
          <div className="flex items-start justify-between mb-3">
            <h4 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{r.schemeName}</h4>
            <span className="text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap"
              style={{ background: `${statusColors[r.status]}20`, color: statusColors[r.status] }}>
              {statusLabels[r.status]}
            </span>
          </div>
          {r.confidence && (
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: 'var(--text-secondary)' }}>Confidence</span>
                <span style={{ color: statusColors[r.status] }}>{r.confidence}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${r.confidence}%`, background: statusColors[r.status] }} />
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            {(r.reasons || []).map((reason, j) => (
              <p key={j} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                <span>•</span> {reason}
              </p>
            ))}
          </div>
          {r.tip && (
            <div className="mt-3 p-2.5 rounded-lg text-xs" style={{ background: 'rgba(99,102,241,0.08)', color: 'var(--accent-indigo)' }}>
              💡 {r.tip}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

function DocumentsTab({ documents }) {
  if (!documents) return <p style={{ color: 'var(--text-secondary)' }}>No document data yet.</p>

  return (
    <div className="space-y-6">
      {/* Missing alerts */}
      {documents.missingDocumentAlerts?.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold" style={{ color: '#ef4444' }}>⚠️ Missing Documents</h4>
          {documents.missingDocumentAlerts.map((alert, i) => (
            <div key={i} className="glass-card p-4" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{alert.document}</div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{alert.impact}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--accent-indigo)' }}>📍 {alert.howToGet}</p>
            </div>
          ))}
        </div>
      )}
      {/* Categories */}
      {(documents.categories || []).map((cat, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
          <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{cat.name}</h4>
          <div className="space-y-2">
            {(cat.documents || []).map((doc, j) => (
              <div key={j} className="glass-card p-3.5 flex items-center gap-3">
                <span className="text-lg">{doc.likelyAvailable ? '✅' : '📄'}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{doc.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{doc.estimatedTime}</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: doc.priority === 'high' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                    color: doc.priority === 'high' ? '#ef4444' : '#f59e0b'
                  }}>
                  {doc.priority}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function RoadmapTab({ roadmap }) {
  if (!roadmap) return <p style={{ color: 'var(--text-secondary)' }}>No roadmap data yet.</p>

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-4">
        <div className="glass-card px-4 py-3 text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--accent-indigo)' }}>{roadmap.totalSteps}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Steps</div>
        </div>
        <div className="glass-card px-4 py-3 text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--accent-emerald)' }}>{roadmap.estimatedTotalDays}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Days</div>
        </div>
      </div>

      {(roadmap.phases || []).map((phase, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: 'var(--glow-indigo)', color: 'var(--accent-indigo)' }}>
              {phase.phase}
            </div>
            <div>
              <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{phase.title}</h4>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{phase.duration}</span>
            </div>
          </div>
          <div className="ml-4 border-l-2 pl-6 space-y-3" style={{ borderColor: 'var(--border-subtle)' }}>
            {(phase.steps || []).map((step, j) => (
              <div key={j} className="glass-card p-4">
                <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  {step.step}. {step.title}
                </div>
                <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{step.description}</p>
                {step.actionItems?.length > 0 && (
                  <ul className="space-y-1">
                    {step.actionItems.map((item, k) => (
                      <li key={k} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--accent-indigo)' }}>→</span> {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Quick Wins */}
      {roadmap.quickWins?.length > 0 && (
        <div className="glass-card p-5" style={{ borderColor: 'rgba(34,197,94,0.2)' }}>
          <h4 className="text-sm font-semibold mb-3" style={{ color: '#22c55e' }}>⚡ Quick Wins — Do These Today!</h4>
          {roadmap.quickWins.map((win, i) => (
            <p key={i} className="text-xs mb-1.5 flex items-start gap-1.5" style={{ color: 'var(--text-secondary)' }}>
              <span>✓</span> {win}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

function SummaryTab({ simplification }) {
  if (!simplification) return <p style={{ color: 'var(--text-secondary)' }}>No summary yet.</p>
  return (
    <div className="glass-card p-6">
      <h4 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        📝 AI Summary
      </h4>
      <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
        {simplification.summary}
      </div>
      <div className="flex gap-4 mt-4 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="text-center">
          <div className="text-xl font-bold" style={{ color: '#22c55e' }}>{simplification.eligibleCount}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Eligible</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{simplification.totalChecked}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Checked</div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { status, eligibilityResults, simplification, documents, roadmap, schemes } = useWorkflowStore()
  const [activeTab, setActiveTab] = useState('summary')

  if (status !== 'completed') {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 text-center">
        <div className="glass-card max-w-md mx-auto p-10">
          <div className="text-4xl mb-4">🔄</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No Results Yet</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Complete the analysis workflow first.</p>
          <button onClick={() => navigate('/onboarding')} className="glow-btn">Start Analysis</button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'summary', label: '📝 Summary' },
    { id: 'eligibility', label: '✅ Eligibility' },
    { id: 'documents', label: '📋 Documents' },
    { id: 'roadmap', label: '🗺️ Roadmap' },
  ]

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            🎯 Your Funding Dashboard
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            AI analysis complete — {eligibilityResults?.filter(r => r.status === 'eligible').length || 0} schemes found eligible
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(t => (
            <TabButton key={t.id} active={activeTab === t.id} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </TabButton>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {activeTab === 'summary' && <SummaryTab simplification={simplification} />}
          {activeTab === 'eligibility' && <EligibilityTab results={eligibilityResults} />}
          {activeTab === 'documents' && <DocumentsTab documents={documents} />}
          {activeTab === 'roadmap' && <RoadmapTab roadmap={roadmap} />}
        </motion.div>

        {/* Action bar */}
        <div className="mt-8 flex gap-4">
          <button onClick={() => { useWorkflowStore.getState().reset(); navigate('/onboarding') }}
            className="px-6 py-3 rounded-xl text-sm font-medium"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
            🔄 New Analysis
          </button>
        </div>
      </div>
    </div>
  )
}
