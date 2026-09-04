import { useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'

const ALLOWED_EXTENSIONS = ['txt', 'doc', 'docx', 'pdf', 'png', 'jpeg', 'jpg']

export default function ReportIssueModal({ isOpen, onClose, job, currentUser, onSubmitted }) {
  const { isDark } = useTheme()
  const [issueType, setIssueType] = useState('Unsatisfactory Service')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileError, setFileError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

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
      e.target.value = '' // Reset input
      return
    }

    setFileError('')
    setFileName(file.name)
  }

  if (!isOpen || !job) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)

    const caseId = `CASE-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
    const newComplaint = {
      id: caseId,
      user_id: currentUser?.id || 'h1',
      user_name: currentUser?.user_metadata?.full_name || currentUser?.email || 'Priya Sharma',
      initiator_role: 'household',
      complaint_type: issueType,
      job_id: job.id,
      title: subject.trim() || `Dispute on Service: ${job.title}`,
      description: description.trim(),
      attachment_name: fileName || 'photo_receipt_proof.jpg',
      status: 'submitted',
      assigned_officer: 'Unassigned',
      resolution_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('complaints').insert(newComplaint)
    setSubmitting(false)

    if (!error) {
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        if (onSubmitted) onSubmitted(newComplaint)
        onClose()
      }, 1800)
    }
  }

  const content = (
    <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div
        className={`rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 border my-auto max-h-[90vh] overflow-y-auto transition-all ${
          isDark
            ? 'bg-[#12151b] border-amber-500/40 text-white shadow-[0_0_40px_rgba(245,158,11,0.2)]'
            : 'bg-white border-amber-300 text-slate-900 shadow-2xl'
        }`}
      >
        <div className="flex justify-between items-start border-b pb-3 border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg font-bold">
              ⚠️
            </span>
            <div>
              <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Report an Issue / Dispute
              </h2>
              <span className="text-[11px] text-slate-400">
                Routed to Labor Department Adjudication Queue
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
              isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="text-4xl animate-bounce">⚖️</div>
            <h3 className="text-sm font-bold text-emerald-400">Dispute Filed Successfully</h3>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              Your claim has been logged with the Labor Department Officer. You will be notified when an investigation is completed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Linked Job Badge */}
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              isDark ? 'bg-[#161a22] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <span className="text-slate-400 block text-[10px]">Service Booking</span>
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>{job.title}</strong>
              </div>
              <span className="font-mono text-[#ff7a00] font-bold">₹{job.final_amount || job.estimated_amount}</span>
            </div>

            {/* Issue Type */}
            <div>
              <label className="block font-bold mb-1 text-slate-300">Issue Category *</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className={`w-full p-2.5 rounded-xl border font-semibold outline-none transition-all ${
                  isDark ? 'bg-[#161a22] border-white/[0.08] text-white focus:border-[#ff6b00]' : 'bg-white border-slate-300 text-slate-900'
                }`}
                required
              >
                <option value="Unsatisfactory Service">🛠️ Unsatisfactory Work / Defective Service</option>
                <option value="Overcharging">💰 Overcharging / Unwarranted Price Hike</option>
                <option value="Unsafe Behavior">⚠️ Unsafe Behavior / Security Concern</option>
                <option value="Property Damage">💥 Accidental Property Damage</option>
                <option value="Other">📝 Other Dispute</option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block font-bold mb-1 text-slate-300">Summary / Subject *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="example: Pipe started leaking 24 hrs after repair"
                className={`w-full p-2.5 rounded-xl border outline-none transition-all ${
                  isDark ? 'bg-[#161a22] border-white/[0.08] text-white focus:border-[#ff6b00]' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold mb-1 text-slate-300">Description of What Happened *</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what went wrong, damages observed, or communication with the worker..."
                className={`w-full p-2.5 rounded-xl border outline-none transition-all ${
                  isDark ? 'bg-[#161a22] border-white/[0.08] text-white focus:border-[#ff6b00]' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block font-bold mb-1 text-slate-300">Evidence Photo / Receipt / Document</label>
              <p className="text-[11px] text-slate-400 mb-1.5 font-medium">
                Upload the files in any of these formats: <span className="font-bold text-[#ff7a00]">TXT, DOC, DOCX, PDF, PNG, JPEG, JPG</span>
              </p>

              {fileError && (
                <div className="mb-2 p-2.5 rounded-xl bg-rose-950/90 border border-rose-500/70 text-rose-200 text-xs font-bold flex items-center gap-1.5 shadow-md">
                  <span>{fileError}</span>
                </div>
              )}

              {fileName && !fileError && (
                <div className="mb-2 text-xs font-bold text-emerald-400">
                  ✓ Attached: {fileName}
                </div>
              )}

              <input
                type="file"
                accept=".txt,.doc,.docx,.pdf,.png,.jpeg,.jpg,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg"
                onChange={handleFileChange}
                className="w-full text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-[#ff6b00] file:text-white cursor-pointer"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-xl font-bold ${
                  isDark ? 'border border-slate-700 text-slate-300' : 'border border-slate-300 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 flow-btn-primary font-black uppercase tracking-wider rounded-xl shadow-md disabled:opacity-50"
              >
                {submitting ? 'Filing Claim...' : 'Submit to Labor Officer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null
}
