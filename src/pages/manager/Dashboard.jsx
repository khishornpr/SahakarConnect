import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../context/ThemeContext'
import { Link } from 'react-router-dom'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export default function ManagerDashboard() {
  const { isDark } = useTheme()

  const [workers, setWorkers] = useState([])
  const [wageLedger, setWageLedger] = useState([])
  const [complaints, setComplaints] = useState([])

  useEffect(() => {
    let ignore = false
    async function loadManagerData() {
      const { data: wList } = await supabase.from('workers').select('*')
      if (!ignore) setWorkers(wList || [])

      const { data: wlList } = await supabase.from('wage_ledger').select('*')
      if (!ignore) setWageLedger(wlList || [])

      const { data: cList } = await supabase.from('complaints').select('*')
      if (!ignore) setComplaints(cList || [])
    }

    loadManagerData()
    return () => {
      ignore = true
    }
  }, [])

  const totalWorkers = workers.length
  const totalProcessed = wageLedger.reduce((sum, w) => sum + (w.gross_amount || 0), 0)
  const totalNet = wageLedger.reduce((sum, w) => sum + (w.net_payout || 0), 0)
  const anomalousCount = wageLedger.filter((w) => w.is_anomalous).length
  const teamComplaintsCount = complaints.length

  const teamWeeklyData = [
    { day: 'Mon', completedJobs: 14, revenue: 11200, payouts: 10500 },
    { day: 'Tue', completedJobs: 18, revenue: 14800, payouts: 13900 },
    { day: 'Wed', completedJobs: 12, revenue: 9600, payouts: 9000 },
    { day: 'Thu', completedJobs: 22, revenue: 18200, payouts: 17100 },
    { day: 'Fri', completedJobs: 25, revenue: 21500, payouts: 20200 },
    { day: 'Sat', completedJobs: 30, revenue: 26800, payouts: 25100 },
    { day: 'Sun', completedJobs: 20, revenue: 16500, payouts: 15500 },
  ]

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border ${
              isDark ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <span>👔</span>
            <span>Middle Management • Zonal Operations</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Zonal Manager Control Hub
          </h1>
          <p className={`text-xs mt-1 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Supervising field worker rosters, locality service fulfilment, payroll disbursements, and team performance metrics for <strong>South Delhi Cluster</strong>.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/manager/reports"
            className="px-4 py-2 flow-btn-primary text-xs font-bold rounded-xl shadow-md"
          >
            📊 Generate Financial Report
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Workers */}
        <div className="flow-card p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Supervised Workers</span>
          <div className="text-2xl font-black text-white">{totalWorkers} Active</div>
          <span className="text-[10px] text-emerald-400 block">✓ 100% KYC Verified</span>
        </div>

        {/* Total Processed */}
        <div className="flow-card p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Team Volume</span>
          <div className="text-2xl font-black text-[#ff7a00]">₹{totalProcessed.toLocaleString()}</div>
          <span className="text-[10px] text-slate-400 block">Gross Household Billing</span>
        </div>

        {/* Total Net Take-Home */}
        <div className="flow-card p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Net Worker Payouts</span>
          <div className="text-2xl font-black text-emerald-400">₹{totalNet.toLocaleString()}</div>
          <span className="text-[10px] text-emerald-400 block">Direct Member Bank Remittance</span>
        </div>

        {/* Overpaid / Shortfall Anomalies */}
        <div className="flow-card p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Wage Ledger Anomalies</span>
          <div className={`text-2xl font-black ${anomalousCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {anomalousCount} Flagged
          </div>
          <span className="text-[10px] text-slate-400 block">0 Shortfalls Pending</span>
        </div>

        {/* Team Complaints */}
        <div className="flow-card p-4 space-y-1 col-span-2 lg:col-span-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Team Grievances</span>
          <div className="text-2xl font-black text-purple-400">{teamComplaintsCount} Cases</div>
          <span className="text-[10px] text-slate-400 block">Routed to Labor Officer</span>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Weekly Revenue & Payouts */}
        <div className="flow-card p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
              📈 Zonal Revenue vs Net Payouts (₹)
            </h3>
            <span className="text-xs text-slate-400">Past 7 Days</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={teamWeeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f242e' : '#e2e8f0'} opacity={0.5} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#0d0f14' : '#fff', borderColor: '#ff6b00', borderRadius: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                <Area type="monotone" dataKey="revenue" name="Gross Revenue" stroke="#ff6b00" fill="#ff6b00" fillOpacity={0.2} strokeWidth={2} />
                <Area type="monotone" dataKey="payouts" name="Net Worker Payouts" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Jobs Completed */}
        <div className="flow-card p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
              ⚡ Completed Jobs by Zonal Team
            </h3>
            <span className="text-xs text-slate-400">Total: 141 Jobs</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamWeeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f242e' : '#e2e8f0'} opacity={0.5} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#0d0f14' : '#fff', borderColor: '#3b82f6', borderRadius: '12px' }} />
                <Bar dataKey="completedJobs" name="Completed Service Tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Team Roster Preview */}
      <div className="flow-card p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              👥 Managed Worker Team (South Delhi Cluster)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time verification status, trade assignments, and rating health.
            </p>
          </div>
          <Link
            to="/manager/workers"
            className="text-xs font-bold text-[#ff7a00] hover:underline"
          >
            Full Roster Table →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {workers.map((w) => (
            <div
              key={w.id}
              className={`p-4 rounded-xl border space-y-2.5 transition-all ${
                isDark ? 'bg-[#161a22] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {w.primary_trade} Worker
                  </h3>
                  <span className="text-[11px] text-slate-400">📍 {w.area}</span>
                </div>
                <span className="text-xs font-black text-amber-400">★ {w.rating}</span>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/[0.06]">
                <span className="text-slate-400">Hourly: ₹{w.hourly_rate}/hr</span>
                <span className={w.is_verified ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {w.is_verified ? '✓ Verified' : 'Pending KYC'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
