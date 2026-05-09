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

function ChatInterview({ questions, answers, setAnswer, onSubmit, submitting }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [messages, setMessages] = useState([])
  const chatEndRef = useRef(null)

  useEffect(() => {
    if (questions.length > 0 && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: questions[0].question,
        purpose: questions[0].purpose
      }])
    }
  }, [questions])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleNext = (value) => {
    setAnswer(questions[currentIndex].id, value)
    
    const newMessages = [
      ...messages,
      { role: 'user', content: value }
    ]

    if (currentIndex < questions.length - 1) {
      setTimeout(() => {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: questions[currentIndex + 1].question,
            purpose: questions[currentIndex + 1].purpose
          }
        ])
        setCurrentIndex(currentIndex + 1)
      }, 600)
    } else {
      setMessages(newMessages)
      setCurrentIndex(questions.length) // All answered
    }
  }

  const currentQ = questions[currentIndex]
  const isFinished = currentIndex >= questions.length

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-[2rem] border border-gray-100 shadow-2xl overflow-hidden relative">
      {/* Header */}
      <div className="p-6 border-b border-gray-50 bg-white/50 backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Mic size={20} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">Eligibility Interview</div>
            <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Agent Active</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((m, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[85%] space-y-2">
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-none'
                }`}>
                  {m.content}
                </div>
                {m.purpose && (
                  <div className="text-[10px] text-gray-400 pl-1 flex items-center gap-1">
                    <Bot size={10} /> {m.purpose}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Inputs */}
      <div className="p-6 bg-gray-50/50 border-t border-gray-100">
        {!isFinished ? (
          <div className="space-y-4">
            {currentQ?.type === 'yes_no' && (
              <div className="flex gap-3">
                {['Yes', 'No'].map(opt => (
                  <button key={opt} onClick={() => handleNext(opt)}
                    className="flex-1 bg-white border border-gray-200 py-3 rounded-xl text-sm font-bold text-gray-700 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm">
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {currentQ?.type === 'multiple_choice' && (
              <div className="grid grid-cols-2 gap-3">
                {(currentQ.options || []).map(opt => (
                  <button key={opt} onClick={() => handleNext(opt)}
                    className="bg-white border border-gray-200 p-3 rounded-xl text-xs font-bold text-gray-700 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm">
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {(currentQ?.type === 'number' || currentQ?.type === 'text') && (
              <div className="flex gap-2">
                <input 
                  autoFocus
                  type={currentQ.type === 'number' ? 'number' : 'text'}
                  className="flex-1 bg-white border border-gray-200 p-4 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-600 shadow-sm"
                  placeholder="Type your answer..."
                  onKeyPress={(e) => e.key === 'Enter' && e.target.value && handleNext(e.target.value)}
                />
                <button 
                  onClick={(e) => {
                    const input = e.currentTarget.previousSibling
                    if (input.value) handleNext(input.value)
                  }}
                  className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                >
                  <Send size={18} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <motion.button initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={onSubmit} disabled={submitting}
            className="glow-btn w-full !py-4 shadow-xl"
          >
            {submitting ? (
              <><Loader2 size={18} className="animate-spin" /> Validating Eligibility...</>
            ) : (
              <><Sparkles size={18} /> Submit Interview & Get Results</>
            )}
          </motion.button>
        )}
      </div>
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
              <ChatInterview
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
