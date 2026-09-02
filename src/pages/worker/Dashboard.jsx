import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from '../../context/I18nContext'
import { useTheme } from '../../context/ThemeContext'
import { Link } from 'react-router-dom'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export default function WorkerDashboard() {
  const { user, profile } = useAuth()
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const [workerInfo, setWorkerInfo] = useState(null)
  const [jobs, setJobs] = useState([])
  const [wageLedger, setWageLedger] = useState([])
  const [chartType, setChartType] = useState('bar') // 'bar', 'line', 'area', 'stacked'
  const [chartTimeframe, setChartTimeframe] = useState('weekly') // 'weekly', 'monthly'

  useEffect(() => {
    if (user) loadData()
  }, [user])

  async function loadData() {
    const { data: worker } = await supabase
      .from('workers')
      .select('*')
      .eq('user_id', user.id)
      .single()
    setWorkerInfo(worker)

    const { data: jobList } = await supabase
      .from('jobs')
      .select('*')
      .eq('assigned_worker_id', user.id)
      .order('created_at', { ascending: false })
    setJobs(jobList || [])

    const { data: ledger } = await supabase
      .from('wage_ledger')
      .select('*')
      .eq('worker_id', user.id)
      .order('created_at', { ascending: false })
    setWageLedger(ledger || [])
  }

  const totalNet = wageLedger.reduce((sum, w) => sum + (w.net_payout || 0), 0)
  const coOpDeduction = wageLedger.reduce((sum, w) => sum + (w.cooperative_fee_amount || 0), 0)
  const activeJobs = jobs.filter((j) => ['assigned', 'in_progress'].includes(j.status))
  const completedJobsCount = jobs.filter((j) => j.status === 'completed').length

  const sparklineOrange = totalNet > 0
    ? [{ v: 12 }, { v: 24 }, { v: 18 }, { v: 35 }, { v: 28 }, { v: 48 }, { v: 42 }, { v: 60 }]
    : [{ v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }]
  const sparklineGreen = totalNet > 0
    ? [{ v: 10 }, { v: 18 }, { v: 25 }, { v: 20 }, { v: 38 }, { v: 45 }, { v: 55 }]
    : [{ v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }]

  const weeklyData = [
    { date: 'Mon', gross: 950, netPayout: 890, deductions: 60 },
    { date: 'Tue', gross: 1200, netPayout: 1130, deductions: 70 },
    { date: 'Wed', gross: 800, netPayout: 750, deductions: 50 },
    { date: 'Thu', gross: 1500, netPayout: 1415, deductions: 85 },
    { date: 'Fri', gross: 1100, netPayout: 1035, deductions: 65 },
    { date: 'Sat', gross: 1800, netPayout: 1700, deductions: 100 },
    { date: 'Sun', gross: 1400, netPayout: 1320, deductions: 80 },
  ]

  const monthlyData = [
    { date: 'Week 1', gross: 6500, netPayout: 6100, deductions: 400 },
    { date: 'Week 2', gross: 7800, netPayout: 7350, deductions: 450 },
    { date: 'Week 3', gross: 8900, netPayout: 8400, deductions: 500 },
    { date: 'Week 4', gross: 10200, netPayout: 9650, deductions: 550 },
  ]

  const activeChartData = chartTimeframe === 'weekly' ? weeklyData : monthlyData

  return (
    <div className="space-y-6">
      {/* 4 FlowBoard KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Net Disbursed */}
        <div className="flow-card glow-emerald-hover p-5 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Total Net Disbursed
                </span>
                <div className={`text-2xl font-black mt-1.5 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ₹{totalNet.toLocaleString()}
                </div>
              </div>
              <div className="flow-icon-badge-emerald shrink-0">
                <span className="text-xl">💰</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-400">
              {totalNet > 0 ? (
                <>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">↑ 12.5%</span>
                  <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Direct Bank/UPI</span>
                </>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-400 font-medium">
                  0 Payouts • Direct Bank/UPI
                </span>
              )}
            </div>
          </div>
          <div className="h-10 mt-2 -mx-2 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineGreen}>
                <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2.5} fill="#10b981" fillOpacity={0.15} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Completed Service Tasks */}
        <div className="flow-card glow-orange-hover p-5 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Completed Service Tasks
                </span>
                <div className={`text-2xl font-black mt-1.5 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {completedJobsCount} Jobs
                </div>
              </div>
              <div className="flow-icon-badge-orange shrink-0">
                <span className="text-xl">✓</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-[#ff7a00]">
              <span className="px-2 py-0.5 rounded-md bg-[#ff6b00]/10 border border-[#ff6b00]/20">
                ★ {workerInfo?.rating || '5.0'} Rating
              </span>
              <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                ({workerInfo?.total_ratings || 0} reviews)
              </span>
            </div>
          </div>
          <div className="h-10 mt-2 -mx-2 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineOrange}>
                <Area type="monotone" dataKey="v" stroke="#ff6b00" strokeWidth={2.5} fill="#ff6b00" fillOpacity={0.15} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 3: Cooperative Retention */}
        <div className="flow-card glow-orange-hover p-5 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Cooperative Retention
                </span>
                <div className={`text-2xl font-black mt-1.5 tracking-tight ${isDark ? 'text-[#ff7a00]' : 'text-orange-600'}`}>
                  ₹{coOpDeduction.toLocaleString()}
                </div>
              </div>
              <div className="flow-icon-badge-orange shrink-0">
                <span className="text-xl">🏛️</span>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 mt-2 text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">5% Statutory Max</span>
            </div>
          </div>
          <div className="h-10 mt-2 -mx-2 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineOrange}>
                <Area type="monotone" dataKey="v" stroke="#ff6b00" strokeWidth={2.5} fill="#ff6b00" fillOpacity={0.15} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 4: Statutory Hourly Floor */}
        <div className="flow-card glow-emerald-hover p-5 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Statutory Hourly Floor
                </span>
                <div className={`text-2xl font-black mt-1.5 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ₹{workerInfo?.hourly_rate || 350}/hr
                </div>
              </div>
              <div className="flow-icon-badge-emerald shrink-0">
                <span className="text-xl">🛡️</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-400">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">✓ Verified Member</span>
            </div>
          </div>
          <div className="h-10 mt-2 -mx-2 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineGreen}>
                <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2.5} fill="#10b981" fillOpacity={0.15} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart & Active Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flow-card glow-orange-hover p-6 space-y-4">
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
            <div>
              <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Net Payout & Fair Wage Velocity
              </h2>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Transparent breakdown of gross billings vs 100% direct take-home pay
              </p>
            </div>

            {/* Interactive Chart Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Chart Types */}
              <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-slate-100 border-slate-200'}`}>
                {[
                  { id: 'bar', label: '📊 Bar' },
                  { id: 'line', label: '📈 Line' },
                  { id: 'area', label: '🌊 Area' },
                  { id: 'stacked', label: '⚡ Stacked' },
                ].map((tItem) => (
                  <button
                    key={tItem.id}
                    onClick={() => setChartType(tItem.id)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      chartType === tItem.id
                        ? 'flow-btn-primary shadow-[0_0_12px_rgba(255,107,0,0.5)]'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tItem.label}
                  </button>
                ))}
              </div>

              {/* Timeframe */}
              <select
                value={chartTimeframe}
                onChange={(e) => setChartTimeframe(e.target.value)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border outline-none cursor-pointer transition-all ${
                  isDark
                    ? 'bg-[#161a22] border-white/[0.08] text-slate-200 focus:border-[#ff6b00]'
                    : 'bg-white border-slate-200 text-slate-700 focus:border-[#ff6b00]'
                }`}
              >
                <option value="weekly">📅 Last 7 Days (Daily)</option>
                <option value="monthly">📅 This Month (Weekly)</option>
              </select>
            </div>
          </div>

          <div className="h-64">
            {wageLedger.length === 0 ? (
              <div className={`h-full flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-dashed ${
                isDark ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-slate-50'
              }`}>
                <div className="w-12 h-12 rounded-2xl bg-[#ff6b00]/10 border border-[#ff6b00]/20 text-[#ff7a00] flex items-center justify-center text-2xl mb-2.5">
                  📊
                </div>
                <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  No Earnings Activity Yet
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Once you accept and complete service bookings, your daily take-home earnings and statutory 5% co-op fee breakdown will be visualised here.
                </p>
                <Link
                  to="/worker/jobs"
                  className="mt-3.5 px-4 py-2 rounded-xl text-xs font-bold flow-btn-primary shadow-md inline-flex items-center gap-1.5"
                >
                  <span>⚡</span>
                  <span>View Open Job Requests →</span>
                </Link>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={activeChartData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f242e' : '#e2e8f0'} opacity={0.5} vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(val, name) => [`₹${val}`, name === 'gross' ? 'Gross Billed' : 'Net Take-Home']}
                      contentStyle={{ backgroundColor: isDark ? '#0d0f14' : '#fff', borderColor: '#ff6b00', borderRadius: '12px', color: isDark ? '#fff' : '#000' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <Bar dataKey="gross" name="Gross Customer Tariff" fill={isDark ? '#334155' : '#cbd5e1'} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="netPayout" name="Net Worker Payout (95%)" fill="#ff6b00" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : chartType === 'line' ? (
                  <LineChart data={activeChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f242e' : '#e2e8f0'} opacity={0.5} vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(val, name) => [`₹${val}`, name === 'gross' ? 'Gross' : 'Net Payout']}
                      contentStyle={{ backgroundColor: isDark ? '#0d0f14' : '#fff', borderColor: '#ff6b00', borderRadius: '12px', color: isDark ? '#fff' : '#000' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <Line type="monotone" dataKey="gross" name="Gross Billed" stroke={isDark ? '#64748b' : '#94a3b8'} strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="netPayout" name="Net Take-Home" stroke="#ff6b00" strokeWidth={3} dot={{ r: 5, fill: '#ff6b00' }} />
                  </LineChart>
                ) : chartType === 'area' ? (
                  <AreaChart data={activeChartData}>
                    <defs>
                      <linearGradient id="areaGradWorker" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff6b00" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#ff6b00" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f242e' : '#e2e8f0'} opacity={0.5} vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(val) => [`₹${val}`, 'Net Take-Home Payout']}
                      contentStyle={{ backgroundColor: isDark ? '#0d0f14' : '#fff', borderColor: '#ff6b00', borderRadius: '12px', color: isDark ? '#fff' : '#000' }}
                    />
                    <Area type="monotone" dataKey="netPayout" stroke="#ff6b00" strokeWidth={3} fill="url(#areaGradWorker)" dot={{ r: 4, fill: '#ff7a00' }} />
                  </AreaChart>
                ) : (
                  <BarChart data={activeChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f242e' : '#e2e8f0'} opacity={0.5} vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(val, name) => [`₹${val}`, name === 'netPayout' ? 'Net Worker Payout' : '5% Co-op + Welfare Fund']}
                      contentStyle={{ backgroundColor: isDark ? '#0d0f14' : '#fff', borderColor: '#ff6b00', borderRadius: '12px', color: isDark ? '#fff' : '#000' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <Bar dataKey="netPayout" stackId="a" name="Net Direct Disbursed (95%)" fill="#ff6b00" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="deductions" stackId="a" name="Cooperative 5% + ₹10 Welfare" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Current Assignments */}
        <div className="flow-card glow-orange-hover p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className={`flex items-center justify-between border-b pb-3 mb-3 ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
              <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Current Job Queue
              </h2>
              <Link to="/worker/jobs" className="text-xs text-[#ff7a00] hover:underline font-bold">
                Manage All →
              </Link>
            </div>

            <div className="space-y-3">
              {activeJobs.length > 0 ? (
                activeJobs.map((job) => (
                  <div
                    key={job.id}
                    className={`p-3.5 rounded-xl border space-y-2 transition-all hover:border-[#ff6b00] ${
                      isDark ? 'bg-[#161a22] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>{job.title}</span>
                      <span className="px-2 py-0.5 rounded-md bg-[#ff6b00]/20 text-[#ff7a00] border border-[#ff6b00]/40 text-[10px] font-bold uppercase">
                        {job.status}
                      </span>
                    </div>
                    <div className={`text-[11px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>📍 {job.address}</div>
                    <div className={`flex justify-between items-center text-xs pt-1.5 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
                      <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{job.scheduled_time_slot}</span>
                      <strong className="text-emerald-400 font-bold">₹{job.estimated_amount}</strong>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`p-6 text-center rounded-xl border ${isDark ? 'bg-[#161a22]/50 border-white/[0.04] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  <div className="text-2xl mb-1 text-[#ff7a00]">⚡</div>
                  <div className={`font-bold text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Ready for Assignments</div>
                  <p className="text-[11px] text-slate-500 mt-1">Geo-matching engine is active.</p>
                </div>
              )}
            </div>
          </div>

          <Link
            to="/worker/welfare"
            className="flow-btn-primary block text-center py-2.5 text-xs font-bold uppercase tracking-wider shadow-md"
          >
            PMSBY Welfare Active 🛡️
          </Link>
        </div>
      </div>
    </div>
  )
}
