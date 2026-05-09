import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useWorkflowStore } from '../store/workflowStore'
import { useAuth } from '../contexts/AuthContext'
import AIChatbot from '../components/chat/AIChatbot'
import { saveUserResults, getUserResults } from '../services/db'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import {
  FileText, CheckCircle, Files, Map as MapIcon,
  CheckCircle2, AlertCircle, XCircle, Lightbulb,
  AlertTriangle, FileCheck, File, Clock, Zap, Target,
  RotateCcw, Download, Loader2, Bot, ChevronRight, ArrowRight, Info, Sparkles,
  MessageSquare, Send, X, ExternalLink
} from 'lucide-react'

function TabButton({ active, onClick, icon, children }) {
  return (
    <button onClick={onClick}
      className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 border ${active ? 'bg-white border-gray-200 text-indigo-600 shadow-sm' : 'bg-transparent border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100'
        }`}>
      {icon}
      {children}
    </button>
  )
}

function EligibilityTab({ results }) {
  const [loadingLink, setLoadingLink] = useState(null)

  if (!results || !results.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
      <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
        <Target size={32} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">No matches found yet</h3>
      <p className="text-sm text-gray-500 max-w-xs mt-1">Our AI is still searching for the best government schemes for your business.</p>
    </div>
  )

  const handleSmartApply = async (schemeName, currentLink) => {
    setLoadingLink(schemeName)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/chat/smart-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schemeName })
      })
      const data = await res.json()
      window.open(data.url || currentLink, '_blank')
    } catch (err) {
      window.open(currentLink, '_blank')
    } finally {
      setLoadingLink(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {results.map((r, i) => (
        <motion.div
          key={r.schemeId || i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-500 overflow-hidden group"
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${r.status === 'eligible' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                r.status === 'partially_eligible' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                  'bg-gray-50 text-gray-600 border border-gray-100'
                }`}>
                {r.status?.replace('_', ' ')}
              </div>
              <div className="flex items-center gap-1 text-indigo-600 font-bold text-lg">
                {r.confidence || 85}% <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tight ml-1">Match</span>
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[3.5rem]">
              {r.schemeName}
            </h3>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs text-gray-600 line-clamp-2">{r.reasons && r.reasons[0]}</div>
              </div>
              {r.missingRequirements?.length > 0 && (
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-700 font-medium line-clamp-1">Needs: {r.missingRequirements[0]}</div>
                </div>
              )}
            </div>

            <div className="pt-5 border-t border-gray-50 flex items-center gap-3">
              <button
                onClick={() => handleSmartApply(r.schemeName, r.websiteUrl || r.applyLink)}
                disabled={loadingLink === r.schemeName}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-70"
              >
                {loadingLink === r.schemeName ? (
                  <><Loader2 size={14} className="animate-spin" /> Finding Portal...</>
                ) : (
                  <>Apply Now <ArrowRight size={14} /></>
                )}
              </button>
              <button className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl transition-all border border-gray-100">
                <Info size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function DocumentsTab({ documents }) {
  if (!documents) return <p className="text-gray-500 text-sm">No document data yet.</p>

  const renderTextWithLinks = (text) => {
    if (typeof text !== 'string') return text;

    // Regex that catches http/https, www. , and common domain patterns like .gov.in without prefix
    const urlRegex = /((?:https?:\/\/|www\.)[^\s)]+|[a-zA-Z0-9.-]+\.(?:gov\.in|nic\.in|com|in|org)(?:\/[^\s)]*)?)/gi;

    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part && part.match(urlRegex)) {
        // Clean trailing punctuation
        let cleanUrl = part.replace(/[.,:;!]$/, '');

        // Ensure href has protocol
        let href = cleanUrl;
        if (!/^https?:\/\//i.test(href)) {
          href = `https://${href}`;
        }

        return (
          <a key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 mx-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-[10px] font-bold transition-all shadow-md cursor-pointer relative z-50 whitespace-nowrap"
          >
            Open Portal <ExternalLink size={10} />
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="space-y-8">
      {/* Missing alerts */}
      {documents.missingDocumentAlerts?.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold flex items-center gap-2 text-red-600 uppercase tracking-wide">
            <AlertTriangle size={16} /> Missing Critical Documents
          </h4>
          {documents.missingDocumentAlerts.map((alert, i) => (
            <div key={i} className="glass-card p-5 bg-red-50 border border-red-100 rounded-lg">
              <div className="text-sm font-bold text-red-900">{alert.document}</div>
              <p className="text-sm mt-1 text-red-700">{alert.impact}</p>
              <div className="mt-3 flex items-start gap-2 text-sm text-red-600 bg-white p-2.5 rounded border border-red-50 leading-relaxed">
                <Target size={16} className="shrink-0 mt-1" />
                <div>{renderTextWithLinks(alert.howToGet)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Categories */}
      {(documents.categories || []).map((cat, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
          <h4 className="text-sm font-bold text-gray-900 mb-3">{cat.name}</h4>
          <div className="space-y-2">
            {(cat.documents || []).map((doc, j) => (
              <div key={j} className="glass-card p-4 flex items-center gap-4 bg-white shadow-sm border border-gray-200">
                <div className={`p-2 rounded-lg ${doc.likelyAvailable ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                  {doc.likelyAvailable ? <FileCheck size={20} /> : <File size={20} />}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-gray-900">{renderTextWithLinks(doc.name)}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Clock size={12} /> {doc.estimatedTime}
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${doc.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                  {doc.priority.toUpperCase()}
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
  const [checkedItems, setCheckedItems] = useState({})

  if (!roadmap) return <p className="text-gray-500 text-sm">No roadmap data yet.</p>

  const toggleItem = (phaseIdx, stepIdx, itemIdx) => {
    const key = `${phaseIdx}-${stepIdx}-${itemIdx}`
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const isStepDone = (phaseIdx, stepIdx, actionItems) => {
    if (!actionItems || actionItems.length === 0) return false
    return actionItems.every((_, i) => checkedItems[`${phaseIdx}-${stepIdx}-${i}`])
  }

  return (
    <div className="space-y-8">
      <div className="flex gap-4 mb-6">
        <div className="glass-card flex-1 p-5 bg-white border border-gray-200 text-center">
          <div className="text-3xl font-extrabold text-indigo-600">{roadmap.totalSteps}</div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">Total Steps</div>
        </div>
        <div className="glass-card flex-1 p-5 bg-white border border-gray-200 text-center">
          <div className="text-3xl font-extrabold text-emerald-600">
            {Object.values(checkedItems).filter(Boolean).length}
          </div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">Actions Completed</div>
        </div>
      </div>

      {(roadmap.phases || []).map((phase, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
              {phase.phase}
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900">{phase.title}</h4>
            </div>
          </div>
          <div className="ml-5 border-l-2 border-gray-200 pl-8 space-y-4 pb-4">
            {(phase.steps || []).map((step, j) => (
              <div key={j} className="glass-card p-5 bg-white border border-gray-200 shadow-sm relative">
                <div className="absolute w-3 h-3 bg-white border-2 border-indigo-400 rounded-full -left-[39px] top-6" />
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-bold text-gray-900">
                    {step.step}. {step.title}
                  </div>
                  {isStepDone(i, j, step.actionItems) && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">{step.description}</p>
                {step.actionItems?.length > 0 && (
                  <div className="space-y-1.5 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-wider">Required Checklist</div>
                    {step.actionItems.map((item, k) => (
                      <label key={k} className="flex items-start gap-3 p-2 rounded-md hover:bg-white transition-colors cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={checkedItems[`${i}-${j}-${k}`] || false}
                          onChange={() => toggleItem(i, j, k)}
                        />
                        <span className={`text-xs font-medium transition-all ${checkedItems[`${i}-${j}-${k}`] ? 'text-gray-400 line-through' : 'text-gray-700 group-hover:text-indigo-600'}`}>
                          {item}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Quick Wins */}
      {roadmap.quickWins?.length > 0 && (
        <div className="glass-card p-6 bg-emerald-50 border border-emerald-100 mt-8">
          <h4 className="text-sm font-bold text-emerald-800 mb-4 flex items-center gap-2 uppercase tracking-wide">
            <Zap size={16} /> Quick Wins — Do These Today
          </h4>
          <div className="space-y-2">
            {roadmap.quickWins.map((win, i) => (
              <p key={i} className="text-sm flex items-start gap-2 text-emerald-700 font-medium">
                <CheckCircle2 size={18} className="shrink-0 text-emerald-500" /> {win}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryTab({ simplification, eligibilityResults }) {
  const [loadingLink, setLoadingLink] = useState(null)

  if (!simplification) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
      <p className="text-gray-500 text-sm">Generating your professional report...</p>
    </div>
  )

  const handleSmartApply = async (schemeName, currentLink) => {
    setLoadingLink(schemeName)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/chat/smart-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schemeName })
      })
      const data = await res.json()
      window.open(data.url || currentLink, '_blank')
    } catch (err) {
      window.open(currentLink, '_blank')
    } finally {
      setLoadingLink(null)
    }
  }

  const points = simplification.points || []
  const hasPoints = points.length > 0

  const cleanText = (text) => {
    if (typeof text !== 'string') return '';
    return text
      .replace(/\*\*/g, '') // Remove bold
      .replace(/[✅🎉❌⚠️🚀📋]/gu, '') // Remove unprofessional emojis
      .replace(/^[\s\d.-]+/gm, '') // Remove starting numbers/dots/dashes
      .trim();
  }

  const oldSummary = cleanText(simplification.summary || (typeof simplification === 'string' ? simplification : ''))

  return (
    <div className="space-y-8">
      {/* Intro section */}
      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Bot className="text-indigo-600" /> Executive Summary
        </h2>
        {(simplification.intro || (!hasPoints && oldSummary)) && (
          <p className="text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">
            {simplification.intro || oldSummary}
          </p>
        )}
      </div>

      {/* Structured Points as Cards */}
      {hasPoints ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {points.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                  {point.title}
                </h3>
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${point.status?.includes('Fully') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                  {point.status}
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-6 font-medium leading-relaxed line-clamp-3">
                {point.details}
              </p>

              <div className="space-y-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-xs font-bold p-2 bg-gray-50 rounded-lg text-gray-700">
                  <Sparkles size={14} className="text-indigo-500 shrink-0" />
                  <span className="line-clamp-1">{point.action}</span>
                </div>

                <button
                  onClick={() => handleSmartApply(point.title, point.link)}
                  disabled={loadingLink === point.title}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loadingLink === point.title ? (
                    <><Loader2 size={14} className="animate-spin" /> Finding Portal...</>
                  ) : (
                    <><ArrowRight size={14} /> Apply Online</>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : !oldSummary ? (
        <div className="p-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">Click "New Analysis" to generate a professional card-based report.</p>
        </div>
      ) : null}

      {/* Outro */}
      {(simplification.outro || (!hasPoints && oldSummary)) && (
        <div className="p-6 bg-gray-900 rounded-2xl border border-gray-800 text-white font-bold text-center shadow-lg">
          {simplification.outro || "Next Step: Review your document checklist and start your application today."}
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { status, eligibilityResults, simplification, documents, roadmap, setResults } = useWorkflowStore()
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('summary')
  const [isExporting, setIsExporting] = useState(false)
  const [isLoadingDB, setIsLoadingDB] = useState(true)
  const contentRef = useRef()

  // Load from DB or Save to DB
  useEffect(() => {
    let timeoutId;

    const handleDB = async () => {
      // 1. Instant Recovery: If we already have results locally, stop loading NOW
      if (status === 'completed' && eligibilityResults?.length > 0) {
        setIsLoadingDB(false)
        return
      }

      // 2. Safety Timeout: Don't hang for more than 2 seconds
      timeoutId = setTimeout(() => {
        setIsLoadingDB(false)
      }, 2000)

      if (!currentUser) {
        setIsLoadingDB(false)
        return
      }

      // 3. Try cloud fetch
      try {
        const savedData = await getUserResults(currentUser.uid)
        if (savedData) {
          setResults(savedData)
        }
      } catch (error) {
        console.warn("Database fetch failed:", error)
      } finally {
        setIsLoadingDB(false)
        if (timeoutId) clearTimeout(timeoutId)
      }
    }

    handleDB()
    return () => { if (timeoutId) clearTimeout(timeoutId) }
  }, [currentUser, status, eligibilityResults?.length])

  const exportPDF = () => {
    setIsExporting(true)
    // Wait for the full report to render, then print
    setTimeout(() => {
      window.print()
      setIsExporting(false)
    }, 500)
  }

  if (isLoadingDB) {
    return (
      <div className="min-h-screen pt-32 pb-12 px-6 flex justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
          <p className="font-medium text-sm">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (status !== 'completed') {
    return (
      <div className="min-h-screen pt-32 pb-12 px-6 text-center bg-gray-50">
        <div className="glass-card max-w-md mx-auto p-12 bg-white border border-gray-200 shadow-sm">
          <RotateCcw className="mx-auto mb-6 text-gray-300" size={48} />
          <h2 className="text-xl font-bold mb-2 text-gray-900">No Results Yet</h2>
          <p className="text-sm mb-8 text-gray-500">Complete the analysis workflow to generate your custom dashboard.</p>
          <button onClick={() => navigate('/onboarding')} className="glow-btn">Start Analysis</button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'summary', label: 'Summary', icon: <FileText size={16} /> },
    { id: 'eligibility', label: 'Eligibility', icon: <CheckCircle size={16} /> },
    { id: 'documents', label: 'Documents', icon: <Files size={16} /> },
    { id: 'roadmap', label: 'Roadmap', icon: <MapIcon size={16} /> },
  ]

  return (
    <div className="min-h-screen pt-32 pb-12 bg-gray-50">
      <div className="max-w-[1400px] w-full mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 items-start">

          {/* Sidebar */}
          <div className="lg:col-span-1 lg:sticky lg:top-32 space-y-8" data-html2canvas-ignore={isExporting}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">
                Results Dashboard
              </h1>
              <p className="text-sm font-medium text-gray-500">
                {eligibilityResults?.filter(r => r.status === 'eligible').length || 0} schemes found eligible
              </p>
            </motion.div>

            {/* Tabs */}
            <div className="flex flex-col gap-2">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 border ${activeTab === t.id ? 'bg-white border-gray-200 text-indigo-600 shadow-sm' : 'bg-transparent border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                    }`}>
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            {/* Action bar */}
            <div className="flex flex-col gap-3 pt-6 border-t border-gray-200">
              <button onClick={exportPDF} disabled={isExporting}
                className="glow-btn w-full !py-3">
                {isExporting ? <><Loader2 size={16} className="animate-spin" /> Exporting...</> : <><Download size={16} /> Download PDF</>}
              </button>
              <button onClick={() => { useWorkflowStore.getState().reset(); navigate('/onboarding') }}
                className="secondary-btn w-full !py-3">
                <RotateCcw size={16} /> New Analysis
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div ref={contentRef} className="p-2 sm:p-4 -m-2 sm:-m-4 rounded-2xl" style={{ background: isExporting ? '#f9fafb' : 'transparent' }}>

              {/* Optional header for PDF export visibility */}
              {isExporting && (
                <div className="mb-8 pb-4 border-b border-gray-200">
                  <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Funding Action Plan</h1>
                  <p className="text-gray-500 mt-2">Community Copilot AI Generated Report</p>
                </div>
              )}

              {isExporting ? (
                <div className="space-y-20">
                  <div>
                    <h2 className="text-2xl font-bold text-[#4f46e5] mb-8 uppercase tracking-widest border-l-4 border-[#4f46e5] pl-4">I. Executive Summary</h2>
                    <SummaryTab simplification={simplification} eligibilityResults={eligibilityResults} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#4f46e5] mb-8 uppercase tracking-widest border-l-4 border-[#4f46e5] pl-4">II. Scheme Eligibility</h2>
                    <EligibilityTab results={eligibilityResults} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#4f46e5] mb-8 uppercase tracking-widest border-l-4 border-[#4f46e5] pl-4">III. Required Documents</h2>
                    <DocumentsTab documents={documents} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#4f46e5] mb-8 uppercase tracking-widest border-l-4 border-[#4f46e5] pl-4">IV. Implementation Roadmap</h2>
                    <RoadmapTab roadmap={roadmap} />
                  </div>
                </div>
              ) : (
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  {activeTab === 'summary' && <SummaryTab simplification={simplification} eligibilityResults={eligibilityResults} />}
                  {activeTab === 'eligibility' && <EligibilityTab results={eligibilityResults} />}
                  {activeTab === 'documents' && <DocumentsTab documents={documents} />}
                  {activeTab === 'roadmap' && <RoadmapTab roadmap={roadmap} />}
                </motion.div>
              )}
            </div>
          </div>

        </div>
      </div>

      <AIChatbot context={{ eligibilityResults, simplification }} />
    </div>
  )
}
