import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useWorkflowStore } from '../store/workflowStore'
import { submitAnswers } from '../services/api'

const AGENT_ORDER = [
  'Intent Agent', 'Research Agent', 'Eligibility Interview Agent',
  'Eligibility Validation Agent', 'Simplification Agent', 'Document Agent', 'Roadmap Agent'
]

function AgentTimeline({ events }) {
  const agentStates = {}
  events.forEach(e => {
    if (e.agent && e.agent !== 'System' && e.agent !== 'Orchestrator') {
      agentStates[e.agent] = e
    }
  })

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>
        AI Agent Pipeline
      </h3>
      {AGENT_ORDER.map((name, i) => {
        const state = agentStates[name]
        const status = state?.status || 'waiting'
        const dotClass = status === 'done' ? 'status-done' : status === 'working' ? 'status-working' : 'status-waiting'

        return (
          <motion.div key={name}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-3.5 flex items-center gap-3"
            style={status === 'working' ? { borderColor: `${state?.color || '#f59e0b'}30`, boxShadow: `0 0 20px ${state?.color || '#f59e0b'}15` } : {}}>
            <div className={`pulse-dot ${dotClass}`} style={status !== 'waiting' ? { backgroundColor: state?.color } : {}} />
            <span className="text-base">{state?.emoji || '⚪'}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{name}</div>
              <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                {state?.message || 'Waiting...'}
              </div>
            </div>
            {status === 'done' && <span className="text-emerald-400 text-sm">✓</span>}
            {status === 'working' && (
              <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: `${state?.color}50`, borderTopColor: 'transparent' }} />
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

function InterviewPanel({ questions, answers, setAnswer, onSubmit, submitting }) {
  const allAnswered = questions.length > 0 && questions.every(q => answers[q.id] !== undefined && answers[q.id] !== '')

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        🎤 Eligibility Interview
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
        Answer these questions so our AI can determine your exact eligibility.
      </p>

      <div className="space-y-4">
        <AnimatePresence>
          {questions.map((q, i) => (
            <motion.div key={q.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5">
              <div className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                {i + 1}. {q.question}
              </div>
              <div className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                💡 {q.purpose}
              </div>

              {q.type === 'yes_no' && (
                <div className="flex gap-2">
                  {['Yes', 'No'].map(opt => (
                    <button key={opt} type="button"
                      onClick={() => setAnswer(q.id, opt)}
                      className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: answers[q.id] === opt ? 'var(--glow-indigo)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${answers[q.id] === opt ? 'var(--accent-indigo)' : 'var(--border-subtle)'}`,
                        color: answers[q.id] === opt ? 'var(--accent-indigo)' : 'var(--text-secondary)'
                      }}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {q.type === 'multiple_choice' && (
                <div className="grid grid-cols-2 gap-2">
                  {(q.options || []).map(opt => (
                    <button key={opt} type="button"
                      onClick={() => setAnswer(q.id, opt)}
                      className="px-4 py-2 rounded-lg text-sm text-left transition-all"
                      style={{
                        background: answers[q.id] === opt ? 'var(--glow-indigo)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${answers[q.id] === opt ? 'var(--accent-indigo)' : 'var(--border-subtle)'}`,
                        color: answers[q.id] === opt ? 'var(--accent-indigo)' : 'var(--text-secondary)'
                      }}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {(q.type === 'number' || q.type === 'text') && (
                <input type={q.type === 'number' ? 'number' : 'text'} className="input-dark"
                  placeholder="Type your answer..."
                  value={answers[q.id] || ''}
                  onChange={e => setAnswer(q.id, e.target.value)} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {questions.length > 0 && (
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          onClick={onSubmit} disabled={!allAnswered || submitting}
          className="glow-btn w-full !py-3.5 mt-4">
          {submitting ? '🔄 Validating...' : '✅ Submit Answers & Validate'}
        </motion.button>
      )}
    </div>
  )
}

export default function Workflow() {
  const navigate = useNavigate()
  const { workflowId, status, agentEvents, interviewQuestions, interviewAnswers, setInterviewAnswer } = useWorkflowStore()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!workflowId) navigate('/onboarding')
  }, [workflowId, navigate])

  useEffect(() => {
    if (status === 'completed') {
      setTimeout(() => navigate('/dashboard'), 1500)
    }
  }, [status, navigate])

  const handleSubmitAnswers = async () => {
    setSubmitting(true)
    try {
      await submitAnswers(workflowId, interviewAnswers)
    } catch (err) {
      console.error('Error submitting answers:', err)
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            🤖 AI Agents Working...
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Our multi-agent system is analyzing your business profile in real-time
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Agent Timeline — Left */}
          <div className="lg:col-span-2">
            <AgentTimeline events={agentEvents} />
          </div>

          {/* Main Content — Right */}
          <div className="lg:col-span-3">
            {status === 'awaiting_answers' && interviewQuestions.length > 0 ? (
              <InterviewPanel
                questions={interviewQuestions}
                answers={interviewAnswers}
                setAnswer={setInterviewAnswer}
                onSubmit={handleSubmitAnswers}
                submitting={submitting}
              />
            ) : status === 'completed' ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-10 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Analysis Complete!</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Redirecting to your results dashboard...</p>
              </motion.div>
            ) : (
              <div className="glass-card p-8 text-center">
                <div className="w-12 h-12 border-3 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                  style={{ borderColor: 'var(--accent-indigo)', borderTopColor: 'transparent' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  AI agents are analyzing your profile. Questions will appear shortly...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
