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

  function getComplaintTypeBadge(type) {
    switch (type) {
      case 'Non-Payment':
        return isDark
          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 font-bold'
          : 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
      case 'Unsafe Job Site':
        return isDark
          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/40 font-bold'
          : 'bg-rose-100 text-rose-900 border border-rose-300 font-bold'
      case 'Customer Dispute':
        return isDark
          ? 'bg-blue-500/15 text-blue-300 border border-blue-500/40 font-bold'
          : 'bg-blue-100 text-blue-900 border border-blue-300 font-bold'
      case 'Harassment':
        return isDark
          ? 'bg-purple-500/15 text-purple-300 border border-purple-500/40 font-bold'
          : 'bg-purple-100 text-purple-900 border border-purple-300 font-bold'
      default:
        return isDark
          ? 'bg-slate-800 text-slate-200 border border-white/10 font-bold'
          : 'bg-slate-100 text-slate-800 border border-slate-300 font-bold'
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
            <span>{t('officialCaseRepo', 'Official Case Repository')}</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('masterDisputeRegistry', 'Master Dispute Registry')}
          </h1>
          <p className={`text-xs mt-1 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {t('disputeRegistrySub', 'Comprehensive archive of labor complaints, wage shortfalls, and customer claims across all Delhi-NCR zones.')}
          </p>
        </div>

        <Link
          to="/officer/dashboard"
          className="px-4 py-2 flow-btn-primary text-xs font-bold rounded-xl self-start sm:self-auto"
        >
          {t('backToAdjudicationQueue', '← Back to Adjudication Queue')}
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder={t('searchCasesPlaceholder', 'Search by Case ID, worker name, or subject...')}
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
          <option value="all">{t('allComplaintTypes', 'All Complaint Types')}</option>
          <option value="Non-Payment">{t('nonPayment', 'Non-Payment')}</option>
          <option value="Unsafe Job Site">{t('unsafeSite', 'Unsafe Job Site')}</option>
          <option value="Customer Dispute">{t('customerDispute', 'Customer Dispute')}</option>
          <option value="Harassment">{t('harassment', 'Harassment')}</option>
          <option value="Other">{t('otherComplaint', 'Other')}</option>
        </select>
      </div>

      {/* Cases Table */}
      <div className="flow-card p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b ${isDark ? 'border-white/[0.08] text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <th className="py-3 px-3 font-bold">{t('colCaseId', 'Case ID')}</th>
                <th className="py-3 px-3 font-bold">{t('colComplainant', 'Complainant')}</th>
                <th className="py-3 px-3 font-bold">{t('colType', 'Type')}</th>
                <th className="py-3 px-3 font-bold">{t('colSubject', 'Subject')}</th>
                <th className="py-3 px-3 font-bold">{t('colDateRegistered', 'Date Registered')}</th>
                <th className="py-3 px-3 font-bold">{t('colAssignedOfficer', 'Assigned Officer')}</th>
                <th className="py-3 px-3 font-bold">{t('colStatus', 'Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2.5">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-orange-500/10 border border-orange-500/30 text-[#ff7a00]">
                        ⚖️
                      </div>
                      <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {t('noDataAvailable', 'No Data Available')}
                      </div>
                      <p className="text-xs text-slate-400">
                        {t('noCasesFoundDesc', 'No grievance or dispute cases found matching the active status filter.')}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className={`transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
                    <td className={`py-3 px-3 font-mono font-bold ${isDark ? 'text-[#ff7a00]' : 'text-amber-700'}`}>{c.id}</td>
                    <td className="py-3 px-3">
                      <strong className={isDark ? 'text-white' : 'text-slate-900'}>{c.user_name}</strong>
                      <div className={`text-[10px] uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t(c.initiator_role, c.initiator_role)}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] inline-block whitespace-nowrap ${getComplaintTypeBadge(c.complaint_type)}`}>
                        {t(c.complaint_type, c.complaint_type)}
                      </span>
                    </td>
                    <td className="py-3 px-3 max-w-xs truncate">
                      <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{t(c.title, c.title)}</span>
                    </td>
                    <td className={`py-3 px-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className={`py-3 px-3 font-medium ${isDark ? 'text-amber-400' : 'text-amber-700 font-bold'}`}>{c.assigned_officer ? t(c.assigned_officer, c.assigned_officer) : t('unassigned', 'Unassigned')}</td>
                    <td className="py-3 px-3">
                      <span className={getStatusBadge(c.status)}>
                        {t(c.status, c.status?.toUpperCase())}{c.is_reopened ? ` ${t('reopened', '(Reopened)')}` : ''}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

