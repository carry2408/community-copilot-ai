import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useWorkflowStore } from '../store/workflowStore'
import { startWorkflow, createSSEConnection } from '../services/api'
import { Rocket, Store, Factory, Building2, User, Users, Landmark, ScrollText, Sparkles, Loader2, Send, ChevronRight, Bot, User as UserIcon } from 'lucide-react'

const businessTypes = [
  { value: 'startup', label: 'Startup', icon: <Rocket size={16} /> },
  { value: 'micro', label: 'Micro Enterprise', icon: <Store size={16} /> },
  { value: 'small', label: 'Small Enterprise', icon: <Factory size={16} /> },
  { value: 'medium', label: 'Medium Enterprise', icon: <Building2 size={16} /> },
  { value: 'proprietorship', label: 'Proprietorship', icon: <UserIcon size={16} /> },
  { value: 'partnership', label: 'Partnership Firm', icon: <Users size={16} /> },
  { value: 'pvt_ltd', label: 'Private Limited', icon: <Landmark size={16} /> },
  { value: 'llp', label: 'LLP', icon: <ScrollText size={16} /> },
]

const states = [
  'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Delhi', 'Gujarat', 'Telangana',
  'Uttar Pradesh', 'Rajasthan', 'Kerala', 'West Bengal', 'Madhya Pradesh',
  'Andhra Pradesh', 'Bihar', 'Punjab', 'Haryana', 'Other'
]

const steps = [
  { 
    field: 'businessType', 
    question: "Hello! I'm your AI Funding Assistant. To start, what type of business do you run?", 
    type: 'options', 
    options: businessTypes 
  },
  { 
    field: 'state', 
    question: "Got it. Which state is your business registered in?", 
    type: 'select', 
    options: states 
  },
  { 
    field: 'revenue', 
    question: "What is your approximate annual revenue (in ₹ Lakhs)?", 
    type: 'number',
    placeholder: 'e.g. 50'
  },
  { 
    field: 'startupAge', 
    question: "How many years has your business been operating?", 
    type: 'number',
    placeholder: 'e.g. 2'
  },
  { 
    field: 'fundingGoal', 
    question: "And what is your target funding amount (in ₹ Lakhs)?", 
    type: 'number',
    placeholder: 'e.g. 25'
  },
  { 
    field: 'description', 
    question: "Lastly, briefly describe what your business does.", 
    type: 'text',
    placeholder: 'Describe your core product or service...'
  },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { setWorkflowId, setBusinessDetails, setStatus, addAgentEvent } = useWorkflowStore()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [form, setForm] = useState({
    businessType: '', state: '', fundingGoal: '',
    revenue: '', startupAge: '', description: ''
  })
  const [messages, setMessages] = useState([
    { role: 'assistant', content: steps[0].question }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isFinishing, setIsFinishing] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const chatEndRef = useRef(null)
  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  useEffect(() => {
    scrollToBottom()
  }, [messages, isFinishing])

  const handleNext = async (value) => {
    const field = steps[currentStep].field
    const updatedForm = { ...form, [field]: value }
    setForm(updatedForm)

    // Add user message
    let displayValue = value
    if (steps[currentStep].type === 'options') {
      displayValue = businessTypes.find(t => t.value === value)?.label
    }
    
    const newMessages = [...messages, { role: 'user', content: displayValue }]
    
    if (currentStep < steps.length - 1) {
      // Add next question
      setTimeout(() => {
        setMessages([...newMessages, { role: 'assistant', content: steps[currentStep + 1].question }])
        setCurrentStep(currentStep + 1)
        setInputValue('')
      }, 600)
    } else {
      // Finish
      setMessages(newMessages)
      setInputValue('')
      setTimeout(() => {
        setIsFinishing(true)
        setTimeout(() => triggerAnalysis(updatedForm), 2000)
      }, 800)
    }
  }

  const triggerAnalysis = async (finalForm) => {
    setLoading(true)
    try {
      const details = {
        ...finalForm,
        fundingGoal: Number(finalForm.fundingGoal) || 10,
        revenue: Number(finalForm.revenue) || 0,
        startupAge: Number(finalForm.startupAge) || 0
      }
      setBusinessDetails(details)

      const { workflowId } = await startWorkflow(details)
      setWorkflowId(workflowId)
      setStatus('running')

      createSSEConnection(workflowId, (event) => {
        addAgentEvent(event)
      })

      navigate('/workflow')
    } catch (error) {
      console.error('Failed to start workflow:', error)
      setLoading(false)
      setIsFinishing(false)
      setMessages([...messages, { role: 'assistant', content: "I encountered an error. Let's try that last step again." }])
    }
  }

  return (
    <div className="min-h-screen pt-32 pb-12 bg-[#fcfcfc]">
      <div className="max-w-[1400px] w-full mx-auto px-6 md:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Context */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-4 lg:sticky lg:top-32">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-indigo-100">
            <Bot size={24} />
          </div>
          <h1 className="text-4xl font-extrabold mb-6 tracking-tight text-gray-900 leading-[1.1]">
            AI Business <br /> Consultation
          </h1>
          <p className="text-lg text-gray-500 mb-8 leading-relaxed font-medium">
            I'm here to build your business profile and match you with 15+ government funding schemes.
          </p>
          
          <div className="space-y-3">
            {steps.map((s, idx) => (
              <div key={s.field} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  idx < currentStep ? 'bg-emerald-500 text-white' : 
                  idx === currentStep ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {idx < currentStep ? '✓' : idx + 1}
                </div>
                <span className={`text-sm font-semibold transition-all ${
                  idx <= currentStep ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {s.field.charAt(0).toUpperCase() + s.field.slice(1).replace(/([A-Z])/g, ' $1')}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Column: Chatbot */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 flex flex-col h-[650px] bg-white rounded-[2rem] border border-gray-100 shadow-2xl shadow-indigo-50 overflow-hidden relative"
        >
          {/* Chat Header */}
          <div className="p-6 border-b border-gray-50 bg-white/50 backdrop-blur-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Sparkles size={20} />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900 tracking-tight">Funding Copilot</div>
                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Active & Ready</div>
              </div>
            </div>
            {isFinishing && <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full animate-pulse uppercase tracking-wider">Finalizing Profile...</div>}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((m, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm border ${
                    m.role === 'user' 
                      ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none' 
                      : 'bg-gray-50 text-gray-800 border-gray-100 rounded-tl-none'
                  }`}>
                    <p className="text-sm font-medium leading-relaxed">{m.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isFinishing && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-10 text-center space-y-4 bg-indigo-50/50 rounded-3xl border border-indigo-100 border-dashed"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Loader2 className="animate-spin text-indigo-600" size={32} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Profile Complete!</h4>
                  <p className="text-xs text-gray-500 mt-1 px-10">
                    Excellent summary. Based on your inputs as a <span className="text-indigo-600 font-bold">{form.businessType}</span> in <span className="text-indigo-600 font-bold">{form.state}</span>, 
                    I'm now orchestrating my 7 AI agents to map out your funding success...
                  </p>
                </div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Area */}
          {!isFinishing && (
            <div className="p-8 border-t border-gray-50 bg-gray-50/30">
              {/* Type-specific inputs */}
              {steps[currentStep].type === 'options' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {businessTypes.map(t => (
                    <button key={t.value} onClick={() => handleNext(t.value)}
                      className="p-3 bg-white border border-gray-100 rounded-xl text-[10px] font-bold flex flex-col items-center gap-2 hover:border-indigo-600 hover:text-indigo-600 hover:shadow-md transition-all group">
                      <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-indigo-50">{t.icon}</div>
                      {t.label}
                    </button>
                  ))}
                </motion.div>
              )}

              {steps[currentStep].type === 'select' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2 mb-4">
                  {states.map(s => (
                    <button key={s} onClick={() => handleNext(s)}
                      className="px-3 py-1.5 bg-white border border-gray-100 rounded-full text-[10px] font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all">
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}

              {(steps[currentStep].type === 'number' || steps[currentStep].type === 'text') && (
                <div className="relative">
                  <input 
                    autoFocus
                    type={steps[currentStep].type === 'number' ? 'number' : 'text'}
                    placeholder={steps[currentStep].placeholder}
                    className="w-full bg-white border border-gray-200 rounded-2xl p-4 pr-16 text-sm font-medium focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none shadow-sm"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && inputValue && handleNext(inputValue)}
                  />
                  <button 
                    disabled={!inputValue}
                    onClick={() => handleNext(inputValue)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200"
                  >
                    <Send size={18} />
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
