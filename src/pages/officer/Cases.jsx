import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../context/ThemeContext'
import { useTranslation } from '../../context/I18nContext'
import { Link } from 'react-router-dom'

export default function OfficerCases() {
  const { isDark } = useTheme()
  const { t } = useTranslation()
  const [cases, setCases] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    let ignore = false
    async function loadCases() {
      const { data } = await supabase.from('complaints').select('*').order('created_at', { ascending: false })
      if (!ignore) {
        setCases(data || [])
      }
    }
    loadCases()
    return () => {
      ignore = true
    }
  }, [])

  const filtered = cases.filter((c) => {
    const matchSearch =
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchType = typeFilter === 'all' || c.complaint_type === typeFilter
    return matchSearch && matchType
  })

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border ${
              isDark ? 'bg-blue-500/15 border-blue-500/30 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <span>🗂️</span>
            <span>Official Case Repository</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Master Dispute Registry
          </h1>
          <p className={`text-xs mt-1 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Comprehensive archive of labor complaints, wage shortfalls, and customer claims across all Delhi-NCR zones.
          </p>
        </div>

        <Link
          to="/officer/dashboard"
          className="px-4 py-2 flow-btn-primary text-xs font-bold rounded-xl self-start sm:self-auto"
        >
          ← Back to Adjudication Queue
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by Case ID, worker name, or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`flex-1 px-4 py-2.5 rounded-xl border text-xs outline-none transition-all ${
            isDark ? 'bg-[#161a22] border-white/[0.08] text-white focus:border-[#ff6b00]' : 'bg-white border-slate-300 text-slate-900 focus:border-[#ff6b00]'
          }`}
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={`px-4 py-2.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
            isDark ? 'bg-[#161a22] border-white/[0.08] text-white focus:border-[#ff6b00]' : 'bg-white border-slate-300 text-slate-900 focus:border-[#ff6b00]'
          }`}
        >
          <option value="all">All Complaint Types</option>
          <option value="Non-Payment">Non-Payment</option>
          <option value="Unsafe Job Site">Unsafe Job Site</option>
          <option value="Customer Dispute">Customer Dispute</option>
          <option value="Harassment">Harassment</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Cases Table */}
      <div className="flow-card p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b ${isDark ? 'border-white/[0.08] text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <th className="py-3 px-3 font-bold">Case ID</th>
                <th className="py-3 px-3 font-bold">Complainant</th>
                <th className="py-3 px-3 font-bold">Type</th>
                <th className="py-3 px-3 font-bold">Subject</th>
                <th className="py-3 px-3 font-bold">Date Registered</th>
                <th className="py-3 px-3 font-bold">Assigned Officer</th>
                <th className="py-3 px-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#ff7a00]">{c.id}</td>
                  <td className="py-3 px-3">
                    <strong className={isDark ? 'text-white' : 'text-slate-900'}>{c.user_name}</strong>
                    <div className="text-[10px] text-slate-400 uppercase">{c.initiator_role}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold text-[11px]">
                      {c.complaint_type}
                    </span>
                  </td>
                  <td className="py-3 px-3 max-w-xs truncate">
                    <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{c.title}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-3 text-amber-400 font-medium">{c.assigned_officer || 'Unassigned'}</td>
                  <td className="py-3 px-3">
                    <span className={getStatusBadge(c.status)}>{c.status?.toUpperCase()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
