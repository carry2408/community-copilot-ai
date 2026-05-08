import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useWorkflowStore } from '../store/workflowStore'
import { useAuth } from '../contexts/AuthContext'
import { saveUserResults, getUserResults } from '../services/db'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { 
  FileText, CheckCircle, Files, Map as MapIcon, 
  CheckCircle2, AlertCircle, XCircle, Lightbulb,
  AlertTriangle, FileCheck, File, Clock, Zap, Target,
  RotateCcw, Download, Loader2
} from 'lucide-react'

function TabButton({ active, onClick, icon, children }) {
  return (
    <button onClick={onClick}
      className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 border ${
        active ? 'bg-white border-gray-200 text-indigo-600 shadow-sm' : 'bg-transparent border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100'
      }`}>
      {icon}
      {children}
    </button>
  )
}

function EligibilityTab({ results }) {
  if (!results || !results.length) return <p className="text-gray-500 text-sm">No eligibility results yet.</p>

  const statusConfig = {
    eligible: { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <CheckCircle2 size={16} />, label: 'Eligible' },
    partially_eligible: { color: 'text-amber-600', bg: 'bg-amber-50', icon: <AlertCircle size={16} />, label: 'Partially Eligible' },
    not_eligible: { color: 'text-red-600', bg: 'bg-red-50', icon: <XCircle size={16} />, label: 'Not Eligible' }
  }

  return (
    <div className="space-y-4">
      {results.map((r, i) => {
        const conf = statusConfig[r.status] || statusConfig.not_eligible;
        return (
          <motion.div key={r.schemeId || i}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="glass-card p-6 bg-white shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <h4 className="text-base font-bold text-gray-900">{r.schemeName}</h4>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${conf.bg} ${conf.color}`}>
                {conf.icon}
                {conf.label}
              </span>
            </div>
            
            {r.confidence && (
              <div className="mb-5">
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-gray-500">Confidence Score</span>
                  <span className={conf.color}>{r.confidence}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full transition-all ${conf.bg.replace('bg-', 'bg-').replace('50', '500')}`} style={{ width: `${r.confidence}%` }} />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              {(r.reasons || []).map((reason, j) => (
                <p key={j} className="text-sm flex items-start gap-2 text-gray-600 leading-relaxed">
                  <span className="text-gray-400 mt-1">•</span> {reason}
                </p>
              ))}
            </div>
            
            {r.tip && (
              <div className="mt-5 p-3 rounded-lg text-sm bg-indigo-50 text-indigo-700 flex items-start gap-2 border border-indigo-100">
                <Lightbulb size={18} className="shrink-0 mt-0.5" />
                <span>{r.tip}</span>
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

function DocumentsTab({ documents }) {
  if (!documents) return <p className="text-gray-500 text-sm">No document data yet.</p>

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
              <div className="mt-3 flex items-start gap-2 text-sm text-red-600 bg-white p-2.5 rounded border border-red-50">
                <Target size={16} className="shrink-0 mt-0.5" />
                <span>{alert.howToGet}</span>
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
                  <div className="text-sm font-bold text-gray-900">{doc.name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Clock size={12} /> {doc.estimatedTime}
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  doc.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
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
  if (!roadmap) return <p className="text-gray-500 text-sm">No roadmap data yet.</p>

  return (
    <div className="space-y-8">
      <div className="flex gap-4 mb-6">
        <div className="glass-card flex-1 p-5 bg-white border border-gray-200 text-center">
          <div className="text-3xl font-extrabold text-indigo-600">{roadmap.totalSteps}</div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">Steps</div>
        </div>
        <div className="glass-card flex-1 p-5 bg-white border border-gray-200 text-center">
          <div className="text-3xl font-extrabold text-emerald-600">{roadmap.estimatedTotalDays}</div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">Days</div>
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
              <span className="text-xs font-medium text-gray-500 flex items-center gap-1 mt-0.5">
                <Clock size={12} /> {phase.duration}
              </span>
            </div>
          </div>
          <div className="ml-5 border-l-2 border-gray-200 pl-8 space-y-4 pb-4">
            {(phase.steps || []).map((step, j) => (
              <div key={j} className="glass-card p-5 bg-white border border-gray-200 shadow-sm relative">
                <div className="absolute w-3 h-3 bg-white border-2 border-indigo-400 rounded-full -left-[39px] top-6" />
                <div className="text-sm font-bold text-gray-900 mb-2">
                  {step.step}. {step.title}
                </div>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">{step.description}</p>
                {step.actionItems?.length > 0 && (
                  <ul className="space-y-1.5 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {step.actionItems.map((item, k) => (
                      <li key={k} className="text-xs flex items-start gap-2 text-gray-600 font-medium">
                        <Target size={14} className="text-indigo-400 shrink-0 mt-0.5" /> 
                        {item}
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

function SummaryTab({ simplification }) {
  if (!simplification) return <p className="text-gray-500 text-sm">No summary yet.</p>
  return (
    <div className="glass-card p-8 bg-white shadow-sm border border-gray-200">
      <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Bot className="text-indigo-600" /> AI Executive Summary
      </h4>
      <div className="text-sm leading-relaxed text-gray-600 whitespace-pre-wrap font-medium">
        {simplification.summary}
      </div>
      <div className="flex gap-8 mt-8 pt-6 border-t border-gray-100">
        <div>
          <div className="text-2xl font-extrabold text-emerald-600">{simplification.eligibleCount}</div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">Eligible Schemes</div>
        </div>
        <div>
          <div className="text-2xl font-extrabold text-gray-900">{simplification.totalChecked}</div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">Total Checked</div>
        </div>
      </div>
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
    const handleDB = async () => {
      if (!currentUser) {
        setIsLoadingDB(false)
        return
      }

      try {
        if (status === 'completed') {
          // We just finished a workflow, save it!
          await saveUserResults(currentUser.uid, { eligibilityResults, simplification, documents, roadmap })
        } else {
          // We arrived here empty, try to fetch from DB
          const savedData = await getUserResults(currentUser.uid)
          if (savedData) {
            setResults(savedData)
          }
        }
      } catch (error) {
        console.warn("Database sync failed (likely blocked by client):", error)
      } finally {
        setIsLoadingDB(false)
      }
    }
    handleDB()
  }, [currentUser, status, eligibilityResults, simplification, documents, roadmap, setResults])

  const exportPDF = async () => {
    if (!contentRef.current) return
    setIsExporting(true)
    try {
      const canvas = await html2canvas(contentRef.current, { scale: 2, backgroundColor: '#f9fafb' })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save('Community-Copilot-Plan.pdf')
    } catch (err) {
      console.error("Failed to export PDF", err)
    }
    setIsExporting(false)
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
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 border ${
                    activeTab === t.id ? 'bg-white border-gray-200 text-indigo-600 shadow-sm' : 'bg-transparent border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
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

              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {activeTab === 'summary' && <SummaryTab simplification={simplification} />}
                {activeTab === 'eligibility' && <EligibilityTab results={eligibilityResults} />}
                {activeTab === 'documents' && <DocumentsTab documents={documents} />}
                {activeTab === 'roadmap' && <RoadmapTab roadmap={roadmap} />}
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
