import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send, Loader2, MessageSquare, Sparkles, RotateCcw, Trash2 } from 'lucide-react'

export default function AIChatbot({ context, initialMessage, isOpenExternally, setIsOpenExternally, triggeredMessage }) {
  const [isOpen, setIsOpen] = useState(false)
  const defaultMsg = { role: 'assistant', content: initialMessage || "Hi! I'm your Community Copilot AI. How can I help you with government schemes today?" }
  const [messages, setMessages] = useState([defaultMsg])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef()
  const messagesEndRef = useRef()

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear this conversation?")) {
      setMessages([defaultMsg])
    }
  }

  useEffect(() => {
    if (isOpenExternally) {
      setIsOpen(true)
      if (setIsOpenExternally) setIsOpenExternally(false)
    }
  }, [isOpenExternally])

  useEffect(() => {
    if (triggeredMessage) {
      setIsOpen(true)
      handleSend(triggeredMessage)
    }
  }, [triggeredMessage])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping])

  const handleSend = async (customMsg) => {
    const userMsg = customMsg || input.trim()
    if (!userMsg || isTyping) return

    if (!customMsg) setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setIsTyping(true)

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, context })
      })
      const data = await res.json()
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error || 'Server hiccup. Please try again.'}` }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection error. Please check if the server is running." }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50" data-html2canvas-ignore>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-[350px] sm:w-[400px] h-[600px] rounded-[2rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Bot size={22} />
                </div>
                <div>
                  <div className="font-bold text-sm">Community Copilot</div>
                  <div className="text-[10px] opacity-80 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    AI Online
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={clearChat} 
                  title="Clear Conversation"
                  className="hover:bg-white/10 p-2 rounded-xl transition-all"
                >
                  <RotateCcw size={18} />
                </button>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none shadow-sm'
                  }`}>
                    <FormattedMessage content={m.content} />
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
                    <Loader2 size={18} className="animate-spin text-indigo-500" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-4 bg-white border-t border-gray-100 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about schemes, eligibility..."
                className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isTyping} 
                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group relative border-4 border-white"
        >
          <MessageSquare size={28} />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full animate-bounce"></div>
        </motion.button>
      )}
    </div>
  )
}

function FormattedMessage({ content }) {
  // Split into lines first
  const lines = content.split('\n');
  
  return (
    <div className="space-y-3">
      {lines.map((line, lIdx) => {
        // Handle Bullet Points
        const isBullet = line.trim().startsWith('* ');
        const cleanLine = isBullet ? line.trim().substring(2) : line;

        // Handle Bold (**text**)
        const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

        const renderedLine = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={pIdx} className="font-bold text-indigo-700">{part.slice(2, -2)}</strong>;
          }
          return part;
        });

        if (isBullet) {
          return (
            <div key={lIdx} className="flex gap-2 pl-2">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
              <div className="flex-1">{renderedLine}</div>
            </div>
          );
        }

        return <div key={lIdx}>{renderedLine}</div>;
      })}
    </div>
  );
}
