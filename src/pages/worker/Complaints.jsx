import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from '../../context/I18nContext'
import { useTheme } from '../../context/ThemeContext'

const ALLOWED_EXTENSIONS = ['txt', 'doc', 'docx', 'pdf', 'png', 'jpeg', 'jpg']

export default function WorkerComplaints() {
  const { user, profile } = useAuth()
  const { t } = useTranslation()
  const { isDark } = useTheme()

  const [complaints, setComplaints] = useState([])
  const [jobs, setJobs] = useState([])
  const [activeTab, setActiveTab] = useState('list') // 'list' | 'create'
  const [selectedCase, setSelectedCase] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // Form State
  const [complaintType, setComplaintType] = useState('Non-Payment')
  const [selectedJobId, setSelectedJobId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [attachmentName, setAttachmentName] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileError, setFileError] = useState('')

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) {
      setFileName('')
      setFileError('')
      return
    }

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setFileError(`⚠️ Invalid file format (.${ext || 'unknown'}). Please upload only TXT, DOC, DOCX, PDF, PNG, JPEG, or JPG files.`)
      setFileName('')
      e.target.value = '' // Reset input so unallowed file is never attached
      return
    }

    setFileError('')
    setFileName(file.name)
  }

  useEffect(() => {
    let ignore = false
    async function loadData() {
      if (!user) return
      // Load worker's complaints
      const { data: compList } = await supabase
        .from('complaints')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!ignore) {
        setComplaints(compList || [])
      }

      // Load worker's past jobs for linking
      const { data: jobList } = await supabase
        .from('jobs')
        .select('*')
        .eq('assigned_worker_id', user.id)
        .order('created_at', { ascending: false })

      if (!ignore) {
        setJobs(jobList || [])
      }
    }

    loadData()
    return () => {
      ignore = true
    }
  }, [user])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)

    const caseId = `CASE-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
    const newComplaint = {
      id: caseId,
      user_id: user.id,
      user_name: profile?.full_name || 'Ramesh Kumar',
      initiator_role: 'worker',
      complaint_type: complaintType,
      job_id: selectedJobId || null,
      title: title.trim(),
      description: description.trim(),
      attachment_name: fileName || attachmentName || 'proof_document.pdf',
      status: 'submitted',
      assigned_officer: 'Unassigned',
      resolution_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('complaints').insert(newComplaint)
    setSubmitting(false)

    if (!error) {
      setComplaints((prev) => [newComplaint, ...prev])
      setSuccessMsg(`Grievance ${caseId} submitted successfully to the Labor Department Officer queue!`)
      setTitle('')
      setDescription('')
      setSelectedJobId('')
      setFileName('')
      setAttachmentName('')
      setTimeout(() => {
        setSuccessMsg('')
        setActiveTab('list')
      }, 2000)
    }
  }

  function getStatusBadge(status) {
    switch (status?.toLowerCase()) {
      case 'submitted':
        return 'status-pill-blue'
      case 'under review':
        return 'status-pill-purple'
      case 'in progress':
        return 'status-pill-orange'
      case 'resolved':
        return 'status-pill-emerald'
      case 'rejected':
      case 'closed':
        return 'status-pill-rose'
      default:
        return 'status-pill-blue'
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border ${
              isDark ? 'bg-[#ff6b00]/15 border-[#ff6b00]/30 text-[#ff7a00]' : 'bg-orange-50 border-orange-200 text-orange-800'
            }`}
          >
            <span>⚖️</span>
            <span>{t('grievanceBadge', 'Labor Protection & Dispute Resolution')}</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('grievancesHeading', 'Worker Grievances & Complaints')}
          </h1>
          <p className={`text-xs mt-1 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {t('grievancesSubheading', 'Report wage non-payment, unsafe work conditions, harassment, or customer disputes directly to official Labor Officers.')}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className={`flex p-1 rounded-xl border text-xs ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-slate-100 border-slate-200'}`}>
            <button
              onClick={() => setActiveTab('list')}
              aria-selected={activeTab === 'list'}
              data-selected={activeTab === 'list' ? 'true' : undefined}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'list'
                  ? 'flow-btn-primary cursor-default'
                  : isDark
                  ? 'text-slate-400 hover:text-white cursor-pointer hover:scale-105'
                  : 'text-slate-600 hover:text-slate-900 cursor-pointer hover:scale-105'
              }`}
            >
              📋 {t('myComplaintsTab', 'My Complaints')} ({complaints.length})
            </button>
            <button
              onClick={() => setActiveTab('create')}
              aria-selected={activeTab === 'create'}
              data-selected={activeTab === 'create' ? 'true' : undefined}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'create'
                  ? 'flow-btn-primary cursor-default'
                  : isDark
                  ? 'text-slate-400 hover:text-white cursor-pointer hover:scale-105'
                  : 'text-slate-600 hover:text-slate-900 cursor-pointer hover:scale-105'
              }`}
            >
              ✍️ {t('raiseComplaintTab', '+ Raise Complaint')}
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-fade-in-up">
          <span className="text-base">✅</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* VIEW 1: RAISE COMPLAINT FORM */}
      {activeTab === 'create' && (
        <div className="flow-card glow-orange-hover p-6 sm:p-8 max-w-3xl space-y-5">
          <div className="border-b pb-4">
            <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('newGrievanceFormTitle', 'File an Official Labor Dispute')}
            </h2>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Your complaint will be assigned a permanent Case ID and reviewed by the Zonal Labor Department Officer.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Complaint Type */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {t('complaintType', 'Complaint Type')} *
                </label>
                <select
                  value={complaintType}
                  onChange={(e) => setComplaintType(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                    isDark ? 'bg-[#161a22] border-white/[0.08] text-white focus:border-[#ff6b00]' : 'bg-white border-slate-300 text-slate-900 focus:border-[#ff6b00]'
                  }`}
                  required
                >
                  <option value="Non-Payment">{t('nonPayment', '💰 Non-Payment / Wage Shortfall')}</option>
                  <option value="Unsafe Job Site">{t('unsafeSite', '⚠️ Unsafe Job Site / Hazard')}</option>
                  <option value="Customer Dispute">{t('customerDispute', '🗣️ Customer Dispute / Hostile Behavior')}</option>
                  <option value="Harassment">{t('harassment', '🛑 Harassment / Discrimination')}</option>
                  <option value="Other">{t('otherComplaint', '📝 Other Issue')}</option>
                </select>
              </div>

              {/* Related Job ID */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {t('relatedJobId', 'Related Job (Optional)')}
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                    isDark ? 'bg-[#161a22] border-white/[0.08] text-white focus:border-[#ff6b00]' : 'bg-white border-slate-300 text-slate-900 focus:border-[#ff6b00]'
                  }`}
                >
                  <option value="">-- {t('noSpecificJob', 'None / General Complaint')} --</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} ({j.scheduled_date}) - ₹{j.final_amount || j.estimated_amount}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subject / Title */}
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {t('detailedDescription', 'Subject / Issue Summary')} *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="example: Wage dispute / Safety issue"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition-all ${
                  isDark ? 'bg-[#161a22] border-white/[0.08] text-white focus:border-[#ff6b00]' : 'bg-white border-slate-300 text-slate-900 focus:border-[#ff6b00]'
                }`}
              />
            </div>

            {/* Description */}
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {t('detailedDescription', 'Detailed Description')} *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('descriptionPlaceholder', 'Explain clearly what happened, location details, timestamps, customer communication, and requested resolution...')}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition-all ${
                  isDark ? 'bg-[#161a22] border-white/[0.08] text-white focus:border-[#ff6b00]' : 'bg-white border-slate-300 text-slate-900 focus:border-[#ff6b00]'
                }`}
              />
            </div>

            {/* Supporting Document Upload */}
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {t('supportingDocs', 'Supporting Documents / Photos')}
              </label>
              <div
                className={`border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center transition-all ${
                  fileError
                    ? 'border-rose-500/80 bg-rose-950/20'
                    : isDark
                    ? 'border-white/10 bg-[#161a22]/50 hover:border-[#ff6b00]/40'
                    : 'border-slate-300 bg-slate-50 hover:border-orange-400'
                }`}
              >
                <div className="text-2xl mb-1">{fileError ? '⚠️' : '📎'}</div>
                <div className="text-xs font-semibold text-slate-400">
                  {fileName && !fileError ? (
                    <span className="text-emerald-400 font-bold">✓ Attached: {fileName}</span>
                  ) : (
                    <span>{t('uploadProof', 'Click to attach photo evidence, bill receipts, documents or work logs')}</span>
                  )}
                </div>

                <p className={`text-[11px] mt-1.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Upload the files in any of these formats: <span className="font-bold text-[#ff7a00]">TXT, DOC, DOCX, PDF, PNG, JPEG, JPG</span>
                </p>

                {fileError && (
                  <div className="mt-2.5 p-3 rounded-xl bg-rose-950/90 border border-rose-500/70 text-rose-200 text-xs font-bold flex items-center justify-center gap-2 shadow-lg">
                    <span>{fileError}</span>
                  </div>
                )}

                <input
                  type="file"
                  accept=".txt,.doc,.docx,.pdf,.png,.jpeg,.jpg,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg"
                  onChange={handleFileChange}
                  className="mt-2.5 text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#ff6b00] file:text-white cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 flow-btn-primary text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  <span>{t('submittingComplaint', 'Submitting to Labor Department...')}</span>
                </>
              ) : (
                <span>{t('submitComplaintBtn', 'Submit Grievance to Labor Officer')}</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* VIEW 2: MY COMPLAINTS LIST */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {complaints.length === 0 ? (
            <div className="flow-card p-10 text-center space-y-3">
              <div className="text-4xl">⚖️</div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t('noComplaintsFound', 'No Complaints Filed')}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {t('grievancesSubheading', 'You have not filed any grievances. If you encounter non-payment or unsafe conditions, file a claim anytime.')}
              </p>
              <button
                onClick={() => setActiveTab('create')}
                className="mt-2 px-4 py-2 flow-btn-primary text-xs font-bold uppercase rounded-xl"
              >
                + {t('raiseAComplaint', 'Raise a Complaint')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {complaints.map((c) => (
                <div
                  key={c.id}
                  className="flow-card glow-orange-hover p-5 space-y-3 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2.5 border-white/[0.06]">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-black px-2 py-0.5 rounded-lg bg-orange-500/15 border border-orange-500/30 text-[#ff7a00]">
                        {c.id}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                        {t(c.complaint_type, c.complaint_type)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={getStatusBadge(c.status)}>
                        {t('status' + c.status?.charAt(0).toUpperCase() + c.status?.slice(1), c.status?.toUpperCase())}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {c.title}
                    </h3>
                    <p className={`text-xs mt-1 line-clamp-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {c.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-[11px] border-white/[0.06] text-slate-400">
                    <div>
                      <span>{t('dateRaised', 'Date Raised')}: </span>
                      <strong className="text-slate-300">{new Date(c.created_at).toLocaleDateString()}</strong>
                      {c.assigned_officer && (
                        <span className="ml-3">
                          {t('officerRole', 'Assigned')}: <strong className="text-amber-400">{c.assigned_officer}</strong>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedCase(c)}
                      className="px-3 py-1 rounded-lg border text-xs font-bold text-[#ff7a00] border-[#ff6b00]/40 hover:bg-[#ff6b00]/10 transition-colors"
                    >
                      {t('viewInvestigation', 'View Case Timeline & Notes →')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CASE DETAILS MODAL */}
      {selectedCase &&
        createPortal(
          <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div
              className={`rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-4 border my-auto max-h-[90vh] overflow-y-auto ${
                isDark
                  ? 'bg-[#12151b] border-white/[0.1] text-white shadow-[0_0_40px_rgba(0,0,0,0.8)]'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex justify-between items-start border-b pb-3 border-white/[0.08]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-black text-[#ff7a00]">{selectedCase.id}</span>
                    <span className={getStatusBadge(selectedCase.status)}>
                      {t('status' + selectedCase.status?.charAt(0).toUpperCase() + selectedCase.status?.slice(1), selectedCase.status?.toUpperCase())}
                    </span>
                  </div>
                  <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {selectedCase.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  ✕
                </button>
              </div>

              {/* Complaint Details */}
              <div className="space-y-3 text-xs">
                <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#161a22] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-400 font-medium block mb-1">{t('detailedDescription', 'Detailed Description')}:</span>
                  <p className="leading-relaxed">{selectedCase.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#161a22] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-slate-400 block">{t('complaintType', 'Complaint Type')}</span>
                    <strong className="text-slate-200">{t(selectedCase.complaint_type, selectedCase.complaint_type)}</strong>
                  </div>
                  <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#161a22] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-slate-400 block">{t('officerRole', 'Assigned Labor Officer')}</span>
                    <strong className="text-amber-400">{selectedCase.assigned_officer || 'Unassigned'}</strong>
                  </div>
                </div>

                {/* Attached Document */}
                {selectedCase.attachment_name && (
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${isDark ? 'bg-[#161a22] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center gap-2">
                      <span>📄</span>
                      <span className="font-mono">{selectedCase.attachment_name}</span>
                    </div>
                    <span className="text-emerald-400 font-bold text-[10px]">✓ {t('verified', 'Document Verified')}</span>
                  </div>
                )}

                {/* Resolution Notes */}
                <div className={`p-4 rounded-xl border space-y-1.5 ${isDark ? 'bg-amber-950/20 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                  <div className="font-bold flex items-center gap-1.5">
                    <span>📝</span>
                    <span>{t('officialRulingNotes', 'Officer Investigation Notes')}:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {selectedCase.resolution_notes || t('rulingPending', 'Case has been logged in the Labor Department jurisdiction queue. An adjudicating officer is cross-referencing Geo-Dispatch and wage ledger audit trail.')}
                  </p>
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setSelectedCase(null)}
                  className="px-5 py-2 flow-btn-primary text-xs font-bold rounded-xl"
                >
                  {t('closeModal', 'Close View')}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
