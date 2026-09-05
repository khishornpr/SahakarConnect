import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from '../../context/I18nContext'
import { useTheme } from '../../context/ThemeContext'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function OfficerDashboard() {
  const { profile } = useAuth()
  const { t } = useTranslation()
  const { isDark } = useTheme()

  const [cases, setCases] = useState([])
  const [jobs, setJobs] = useState([])
  const [selectedCase, setSelectedCase] = useState(null)
  const [resolutionNoteInput, setResolutionNoteInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updating, setUpdating] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState('')

  useEffect(() => {
    let ignore = false
    async function loadOfficerData() {
      const { data: compList } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false })

      if (!ignore) {
        setCases(compList || [])
      }

      const { data: jobList } = await supabase.from('jobs').select('*')
      if (!ignore) {
        setJobs(jobList || [])
      }
    }

    loadOfficerData()
    return () => {
      ignore = true
    }
  }, [])

  const totalCases = cases.length
  const pendingCases = cases.filter((c) =>
    ['submitted', 'under review', 'in progress'].includes(c.status?.toLowerCase())
  ).length
  const resolvedCases = cases.filter((c) => c.status?.toLowerCase() === 'resolved').length
  const rejectedCases = cases.filter((c) =>
    ['rejected', 'closed'].includes(c.status?.toLowerCase())
  ).length

  const filteredCases = cases.filter((c) => {
    if (statusFilter === 'all') return true
    if (statusFilter === 'pending')
      return ['submitted', 'under review', 'in progress'].includes(c.status?.toLowerCase())
    if (statusFilter === 'resolved') return c.status?.toLowerCase() === 'resolved'
    if (statusFilter === 'closed')
      return ['rejected', 'closed'].includes(c.status?.toLowerCase())
    return true
  })

  // Category chart data
  const categoryCounts = cases.reduce((acc, c) => {
    acc[c.complaint_type] = (acc[c.complaint_type] || 0) + 1
    return acc
  }, {})

  const categoryChartData = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count,
  }))

  const pieColors = ['#ff6b00', '#3b82f6', '#10b981', '#f43f5e', '#a855f7', '#eab308']

  const categoryPalette = ['#ff6b00', '#3b82f6', '#10b981', '#a855f7', '#f43f5e', '#eab308', '#06b6d4', '#ec4899']

  const statusPieData = [
    { name: 'Submitted / New', value: cases.filter((c) => c.status?.toLowerCase() === 'submitted').length },
    { name: 'Under Review', value: cases.filter((c) => c.status?.toLowerCase() === 'under review').length },
    { name: 'In Progress', value: cases.filter((c) => c.status?.toLowerCase() === 'in progress').length },
    { name: 'Resolved', value: resolvedCases },
  ].filter((d) => d.value > 0)

  async function handleUpdateCaseStatus(newStatus, actionLabel) {
    if (!selectedCase) return
    setUpdating(true)

    const officerName = profile?.full_name || 'Sanjay Verma (Labor Officer)'
    const wasResolvedOrClosed = ['resolved', 'rejected', 'closed'].includes(selectedCase.status?.toLowerCase())
    const willBeReopened = wasResolvedOrClosed && !['resolved', 'rejected', 'closed'].includes(newStatus.toLowerCase())
    const isReopenedNow = selectedCase.is_reopened || willBeReopened

    const now = new Date()
    const formattedDate = now.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

    const newHistoryEntry = {
      timestamp: now.toISOString(),
      date: formattedDate,
      officer_name: officerName,
      from_status: selectedCase.status || 'submitted',
      to_status: newStatus,
      action: actionLabel || (willBeReopened ? 'Case Reopened for Investigation' : `Status Updated to ${newStatus.toUpperCase()}`),
      notes: resolutionNoteInput.trim() || `Status updated from ${selectedCase.status?.toUpperCase()} to ${newStatus.toUpperCase()}${isReopenedNow ? ' (Reopened)' : ''}.`,
    }

    const currentHistory = Array.isArray(selectedCase.history) && selectedCase.history.length > 0
      ? selectedCase.history
      : [
          {
            timestamp: selectedCase.created_at || now.toISOString(),
            date: new Date(selectedCase.created_at || now).toLocaleString('en-IN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }),
            officer_name: selectedCase.initiator_role === 'worker' ? selectedCase.user_name || 'Worker' : selectedCase.user_name || 'Household',
            from_status: 'none',
            to_status: 'submitted',
            action: 'Case Docket Registered',
            notes: selectedCase.description || 'Initial dispute claim registered.',
          },
        ]

    const updatedHistory = [...currentHistory, newHistoryEntry]

    const updated = {
      ...selectedCase,
      status: newStatus,
      is_reopened: isReopenedNow,
      assigned_officer: officerName,
      resolution_notes: resolutionNoteInput.trim() || selectedCase.resolution_notes,
      history: updatedHistory,
      updated_at: now.toISOString(),
      resolved_at: ['resolved', 'rejected', 'closed'].includes(newStatus)
        ? now.toISOString()
        : (willBeReopened ? null : selectedCase.resolved_at),
    }

    const { error } = await supabase.from('complaints').update(updated).eq('id', selectedCase.id)
    setUpdating(false)

    if (!error) {
      setCases((prev) => prev.map((c) => (c.id === selectedCase.id ? updated : c)))
      setSelectedCase(updated)
      setFeedbackMsg(`Case ${selectedCase.id} successfully updated to "${newStatus.toUpperCase()}${isReopenedNow ? ' (Reopened)' : ''}"`)
      setTimeout(() => setFeedbackMsg(''), 3500)
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

  const linkedJob = selectedCase?.job_id ? jobs.find((j) => j.id === selectedCase.job_id) : null

  return (
    <div className="space-y-6">
      {/* Top Banner & Jurisdiction Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/[0.08]">
        <div>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border ${
              isDark ? 'bg-blue-500/15 border-blue-500/30 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <span>🏛️</span>
            <span>Government of NCT of Delhi • Labor Department</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('welcome', 'Welcome')}, {profile?.full_name || 'Officer'} 👋
          </h1>
          <p className={`text-xs mt-1 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Statutory dispute resolution bench for household gig workers and registered consumer complaints across Delhi-NCR cooperative clusters.
          </p>
        </div>

        <div className={`p-3 rounded-2xl border text-xs font-semibold ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-white border-slate-200'}`}>
          <div className="text-slate-400 text-[10px] uppercase font-bold">Officer on Duty</div>
          <div className={`font-black text-sm mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {profile?.full_name || 'Sanjay Verma (Labor Officer)'}
          </div>
          <div className="text-[11px] text-emerald-400 mt-0.5">● Active Session • Delhi NCR Zone</div>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in-up">
          <span>✅</span>
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="flow-card p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Case Docket</span>
          <div className="text-2xl font-black text-white">{totalCases}</div>
          <span className="text-[10px] text-slate-400 block">Registered Claims</span>
        </div>

        <div className="flow-card p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-400 block">Active & In Review</span>
          <div className="text-2xl font-black text-amber-400">{pendingCases}</div>
          <span className="text-[10px] text-amber-400/80 block">Requires Attention</span>
        </div>

        <div className="flow-card p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-400 block">Resolved Cases</span>
          <div className="text-2xl font-black text-emerald-400">{resolvedCases}</div>
          <span className="text-[10px] text-emerald-400/80 block">Settled with Payout</span>
        </div>

        <div className="flow-card p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-rose-400 block">Rejected / Closed</span>
          <div className="text-2xl font-black text-rose-400">{rejectedCases}</div>
          <span className="text-[10px] text-slate-400 block">No Merit Found</span>
        </div>

        <div className="flow-card p-4 space-y-1 col-span-2 lg:col-span-1">
          <span className="text-[10px] uppercase font-bold text-cyan-400 block">Avg. Resolution Time</span>
          <div className="text-2xl font-black text-cyan-400">2.4 Days</div>
          <span className="text-[10px] text-slate-400 block">Statutory Benchmark: 7d</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category Breakdown */}
        <div className="flow-card p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
              📊 Grievance Category Breakdown
            </h3>
            <span className="text-xs text-slate-400 font-medium">Delhi-NCR</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} layout="vertical" margin={{ top: 10, right: 15, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f242e' : '#e2e8f0'} opacity={isDark ? 0.18 : 0.35} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: isDark ? '#cbd5e1' : '#475569', fontWeight: 600 }} width={130} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#0d0f14' : '#fff', borderColor: '#ff6b00', borderRadius: '12px', fontSize: '13px', color: isDark ? '#fff' : '#000' }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {categoryChartData.map((_, index) => (
                    <Cell key={`cat-cell-${index}`} fill={categoryPalette[index % categoryPalette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="flow-card p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
              ⏱️ Case Status Lifecycle
            </h3>
            <span className="text-xs text-slate-400 font-medium">Current Docket</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {statusPieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#0d0f14' : '#fff', borderRadius: '12px', fontSize: '13px', color: isDark ? '#fff' : '#000' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Case Docket Table */}
      <div className="flow-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              🏛️ Labor Dispute Docket & Case Queue
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a case to inspect full evidence, review linked Geo-Dispatch logs, and record official rulings.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1.5 p-1 rounded-xl bg-slate-900/40 border border-white/5 text-xs">
            {['all', 'pending', 'resolved', 'closed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                aria-selected={statusFilter === tab}
                data-selected={statusFilter === tab ? 'true' : undefined}
                className={`px-3 py-1 rounded-lg font-bold capitalize transition-all ${
                  statusFilter === tab
                    ? 'bg-[#ff6b00] text-white cursor-default'
                    : 'text-slate-400 hover:text-white cursor-pointer'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b ${isDark ? 'border-white/[0.08] text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <th className="py-3 px-3 font-bold">Case ID</th>
                <th className="py-3 px-3 font-bold">Initiator</th>
                <th className="py-3 px-3 font-bold">Type</th>
                <th className="py-3 px-3 font-bold">Subject / Description</th>
                <th className="py-3 px-3 font-bold">Date</th>
                <th className="py-3 px-3 font-bold">Status</th>
                <th className="py-3 px-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2.5">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-orange-500/10 border border-orange-500/30 text-[#ff7a00]">
                        ⚖️
                      </div>
                      <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        No Data Available
                      </div>
                      <p className="text-xs text-slate-400">
                        No dispute or grievance cases match the selected status tab.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-white/[0.02] transition-colors ${
                      selectedCase?.id === c.id ? 'bg-orange-500/10' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-bold text-[#ff7a00]">{c.id}</td>
                    <td className="py-3 px-3">
                      <strong className={isDark ? 'text-white' : 'text-slate-900'}>{c.user_name || 'Worker'}</strong>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        {c.initiator_role || 'worker'}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold text-[11px]">
                        {c.complaint_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 max-w-xs truncate">
                      <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{c.title}</span>
                      <p className="text-[10px] text-slate-400 truncate">{c.description}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-3">
                      <span className={getStatusBadge(c.status)}>
                        {c.status?.toUpperCase()}{c.is_reopened ? ' (Reopened)' : ''}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedCase(c)
                          setResolutionNoteInput(c.resolution_notes || '')
                        }}
                        className="px-3 py-1.5 rounded-lg flow-btn-primary text-[11px] font-bold shadow-md"
                      >
                        Investigate →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED INVESTIGATION & ADJUDICATION MODAL */}
      {selectedCase &&
        createPortal(
          <div className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div
              className={`rounded-2xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl space-y-5 border my-auto max-h-[92vh] overflow-y-auto ${
                isDark
                  ? 'bg-[#12151b] border-white/[0.1] text-white shadow-[0_0_50px_rgba(0,0,0,0.8)]'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-start border-b pb-3.5 border-white/[0.08]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-black text-[#ff7a00]">{selectedCase.id}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                      {selectedCase.complaint_type}
                    </span>
                    <span className={getStatusBadge(selectedCase.status)}>
                      {selectedCase.status?.toUpperCase()}{selectedCase.is_reopened ? ' (Reopened)' : ''}
                    </span>
                  </div>
                  <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
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

              {/* Grid: Complainant Details & Linked Geo-Dispatch Job */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Complainant Statement */}
                <div className={`p-4 rounded-xl border space-y-2.5 ${isDark ? 'bg-[#161a22] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="font-bold text-[#ff7a00] uppercase text-[11px]">
                    👤 Complainant Evidence & Statement
                  </h4>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Filed By</span>
                    <strong className="text-white text-sm">{selectedCase.user_name}</strong> ({selectedCase.initiator_role})
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Statement</span>
                    <p className="mt-0.5 text-slate-300 leading-relaxed">{selectedCase.description}</p>
                  </div>
                  {selectedCase.attachment_name && (
                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                      <span>📎 Attachment:</span>
                      <span className="font-mono text-cyan-400 font-bold">{selectedCase.attachment_name}</span>
                    </div>
                  )}
                </div>

                {/* Linked Geo-Dispatch Record */}
                <div className={`p-4 rounded-xl border space-y-2.5 ${isDark ? 'bg-[#161a22] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="font-bold text-cyan-400 uppercase text-[11px]">
                    📍 Linked Geo-Dispatch Audit Log
                  </h4>
                  {linkedJob ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Job Title:</span>
                        <strong className="text-white">{linkedJob.title}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Trade:</span>
                        <strong className="text-slate-200">{linkedJob.trade_category}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Site Address:</span>
                        <span className="text-slate-300 truncate max-w-[150px]">{linkedJob.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Final Tariff:</span>
                        <strong className="text-emerald-400 font-bold">₹{linkedJob.final_amount || linkedJob.estimated_amount}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Completed At:</span>
                        <span className="text-slate-300">{new Date(linkedJob.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-slate-400">
                      <span>No specific job ID attached. (General dispute filed).</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Case Action & Status Audit History */}
              <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-[#161a22] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-amber-400 uppercase text-[11px] flex items-center gap-1.5">
                    <span>📜</span>
                    <span>Case Action & Status Audit History</span>
                  </h4>
                  {selectedCase.is_reopened && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Reopened Case
                    </span>
                  )}
                </div>

                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 divide-y divide-white/[0.06]">
                  {(selectedCase.history && selectedCase.history.length > 0
                    ? selectedCase.history
                    : [
                        {
                          date: new Date(selectedCase.created_at).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          }),
                          officer_name: selectedCase.user_name || 'Complainant',
                          action: 'Case Docket Registered',
                          from_status: 'none',
                          to_status: 'submitted',
                          notes: selectedCase.description,
                        },
                        ...(selectedCase.status !== 'submitted'
                          ? [
                              {
                                date: new Date(selectedCase.updated_at || selectedCase.created_at).toLocaleString('en-IN', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true,
                                }),
                                officer_name: selectedCase.assigned_officer || 'Sanjay Verma (Labor Officer)',
                                action: `Status Updated to ${selectedCase.status?.toUpperCase()}`,
                                from_status: 'submitted',
                                to_status: selectedCase.status,
                                notes: selectedCase.resolution_notes || 'Action recorded by presiding Labor Officer.',
                              },
                            ]
                          : []),
                      ]
                  ).map((hist, idx) => (
                    <div key={idx} className="pt-2 first:pt-0 space-y-1 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{hist.action}</span>
                        <span className="text-[11px] font-mono text-slate-400">{hist.date}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                        <span>Officer / Actor: <strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>{hist.officer_name}</strong></span>
                        <span>•</span>
                        <span>Transition: <span className="font-mono text-amber-400 font-semibold">{hist.from_status?.toUpperCase()} → {hist.to_status?.toUpperCase()}</span></span>
                      </div>
                      {hist.notes && (
                        <p className={`text-[11px] leading-relaxed p-2 rounded-lg border ${
                          isDark ? 'bg-black/30 text-slate-300 border-white/[0.04]' : 'bg-white text-slate-700 border-slate-200'
                        }`}>
                          {hist.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Adjudication Notes Input */}
              <div className="space-y-2">
                <label className={`block text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Official Adjudication & Resolution Notes *
                </label>
                <textarea
                  rows={3}
                  value={resolutionNoteInput}
                  onChange={(e) => setResolutionNoteInput(e.target.value)}
                  placeholder="Record findings from Geo-Dispatch timestamp cross-verification, customer interview, compensation orders, or corrective action..."
                  className={`w-full p-3 rounded-xl border text-xs outline-none transition-all ${
                    isDark ? 'bg-[#161a22] border-white/[0.08] text-white focus:border-[#ff6b00]' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Action Buttons for Officer */}
              <div className="pt-2 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  Assigned Officer: <strong className="text-amber-400">{selectedCase.assigned_officer || profile?.full_name || 'Sanjay Verma'}</strong>
                </span>

                <div className="flex flex-wrap gap-2">
                  {['resolved', 'rejected', 'closed'].includes(selectedCase.status?.toLowerCase()) ? (
                    <button
                      disabled={updating}
                      onClick={() => handleUpdateCaseStatus('under review', 'Case Reopened for Adjudication')}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md cursor-pointer"
                    >
                      🔄 Reopen Case
                    </button>
                  ) : null}

                  <button
                    disabled={updating}
                    onClick={() => handleUpdateCaseStatus('under review', 'Marked Under Review')}
                    className="px-3 py-1.5 rounded-xl border border-purple-500/50 text-purple-300 hover:bg-purple-500/20 text-xs font-bold cursor-pointer"
                  >
                    🔍 Mark Under Review
                  </button>

                  <button
                    disabled={updating}
                    onClick={() => handleUpdateCaseStatus('in progress', 'Investigation Initiated')}
                    className="px-3 py-1.5 rounded-xl border border-amber-500/50 text-amber-300 hover:bg-amber-500/20 text-xs font-bold cursor-pointer"
                  >
                    ⚡ Start Investigation
                  </button>

                  <button
                    disabled={updating}
                    onClick={() => handleUpdateCaseStatus('resolved', 'Case Resolved & Settlement Issued')}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    ✓ Resolve & Issue Settlement
                  </button>

                  {selectedCase.status?.toLowerCase() !== 'resolved' && (
                    <button
                      disabled={updating}
                      onClick={() => handleUpdateCaseStatus('rejected', 'Case Dismissed / Rejected')}
                      className="px-3 py-1.5 rounded-xl border border-rose-500/50 text-rose-400 hover:bg-rose-500/20 text-xs font-bold cursor-pointer"
                    >
                      ✕ Dismiss / Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
