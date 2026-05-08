import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useWorkflowStore } from '../store/workflowStore'
import { submitAnswers, createSSEConnection } from '../services/api'
import { CheckCircle2, CircleDashed, Loader2, Mic, Bot, Sparkles, Send, Activity, AlertCircle, RotateCcw } from 'lucide-react'

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
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
        <Activity size={14} /> AI Agent Pipeline
      </h3>
      {AGENT_ORDER.map((name, i) => {
        const state = agentStates[name]
        const status = state?.status || 'waiting'
        const isDone = status === 'done'
        const isWorking = status === 'working'

        return (
          <motion.div key={name}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`p-4 rounded-xl border flex items-start gap-3 transition-all duration-300 ${isWorking ? 'bg-white shadow-md border-indigo-200' : 'bg-gray-50/50 border-transparent'}`}
          >
            <div className="mt-0.5">
              {isDone ? (
                <CheckCircle2 size={18} className="text-emerald-500" />
              ) : isWorking ? (
                <Loader2 size={18} className="text-indigo-500 animate-spin" />
              ) : (
                <CircleDashed size={18} className="text-gray-300" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-semibold ${isWorking ? 'text-indigo-900' : isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                {name}
              </div>
              <div className={`text-xs mt-1 leading-relaxed ${isWorking ? 'text-indigo-600 font-medium' : isDone ? 'text-gray-500' : 'text-gray-400'}`}>
                {state?.message || 'Waiting in queue...'}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function InterviewPanel({ questions, answers, setAnswer, onSubmit, submitting }) {
  const allAnswered = questions.length > 0 && questions.every(q => answers[q.id] !== undefined && answers[q.id] !== '')

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-1">
          <Mic className="text-amber-500" size={20} />
          Eligibility Interview
        </h3>
        <p className="text-sm text-gray-500">
          Answer these questions so our AI can determine your exact eligibility.
        </p>
      </div>

      <div className="space-y-6">
        <AnimatePresence>
          {questions.map((q, i) => (
            <motion.div key={q.id}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 bg-white shadow-sm border border-gray-200">
              <div className="text-sm font-semibold text-gray-900 mb-2 leading-relaxed">
                {q.question}
              </div>
              <div className="text-xs text-gray-500 mb-4 bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex gap-2">
                <Bot size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                <span>{q.purpose}</span>
              </div>

              {q.type === 'yes_no' && (
                <div className="flex gap-3">
                  {['Yes', 'No'].map(opt => (
                    <button key={opt} type="button"
                      onClick={() => setAnswer(q.id, opt)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border ${answers[q.id] === opt ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {q.type === 'multiple_choice' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(q.options || []).map(opt => (
                    <button key={opt} type="button"
                      onClick={() => setAnswer(q.id, opt)}
                      className={`p-3 rounded-lg text-sm text-left transition-all border ${answers[q.id] === opt ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-medium shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {(q.type === 'number' || q.type === 'text') && (
                <input type={q.type === 'number' ? 'number' : 'text'} className="input-dark bg-gray-50"
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
          className="glow-btn w-full !py-4 shadow-md">
          {submitting ? (
            <><Loader2 size={18} className="animate-spin" /> Validating...</>
          ) : (
            <><Send size={18} /> Submit Answers & Validate</>
          )}
        </motion.button>
      )}
    </div>
  )
}

export default function Workflow() {
  const navigate = useNavigate()
  const { workflowId, status, agentEvents, interviewQuestions, interviewAnswers, setInterviewAnswer, addAgentEvent } = useWorkflowStore()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!workflowId) {
      navigate('/onboarding')
      return
    }

    // Re-connect to SSE if we refreshed or lost connection
    const unsubscribe = createSSEConnection(workflowId, (event) => {
      addAgentEvent(event)
    })

    return () => {
      if (unsubscribe) unsubscribe.close()
    }
  }, [workflowId, navigate, addAgentEvent])

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
    <div className="min-h-screen pt-32 pb-12 bg-gray-50">
      <div className="max-w-[1400px] w-full mx-auto px-6 md:px-12 lg:px-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-indigo-600">
            <Bot size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              AI Agents Analyzing
            </h1>
            <p className="text-sm text-gray-500">
              Our multi-agent system is working through your profile in real-time.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
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
                className="glass-card p-12 text-center bg-white border border-gray-200">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900 tracking-tight">Analysis Complete!</h2>
                <p className="text-gray-500">Redirecting to your results dashboard...</p>
              </motion.div>
            ) : status === 'error' ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-12 text-center bg-white border border-red-100 shadow-sm">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900 tracking-tight">Analysis Interrupted</h2>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                  {agentEvents.find(e => e.status === 'error')?.message || 'An unexpected error occurred during analysis.'}
                </p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all mx-auto"
                >
                  <RotateCcw size={18} />
                  Retry Analysis
                </button>
              </motion.div>
            ) : (
              <div className="glass-card p-12 text-center bg-white border border-gray-200">
                <Loader2 className="animate-spin text-indigo-600 mx-auto mb-6" size={40} />
                <p className="text-gray-500 font-medium">
                  AI agents are processing...
                </p>
                <p className="text-sm text-gray-400 mt-2">Questions will appear here shortly if needed.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
