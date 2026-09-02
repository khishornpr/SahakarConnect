import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
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
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export default function CooperativeDashboard() {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const [workers, setWorkers] = useState([])
  const [jobs, setJobs] = useState([])
  const [ledger, setLedger] = useState([])
  const [loading, setLoading] = useState(true)

  // Interactive Chart 1 Controls (Revenue Overview)
  const [revenueChartType, setRevenueChartType] = useState('bar') // 'bar', 'line', 'area', 'composed'
  const [revenueTimeframe, setRevenueTimeframe] = useState('year') // 'year', '6m', 'qtr'

  // Interactive Chart 2 Controls (Trade Breakdown)
  const [expenseChartType, setExpenseChartType] = useState('donut') // 'donut', 'pie', 'bar', 'radial'

  // Interactive Chart 3 Controls (Cash Flow)
  const [cashFlowChartType, setCashFlowChartType] = useState('area') // 'area', 'line', 'bar', 'step'
  const [cashFlowMetric, setCashFlowMetric] = useState('net') // 'net', 'gross', 'coop'

  useEffect(() => {
    loadFederationData()
  }, [])

  async function loadFederationData() {
    setLoading(true)
    const { data: wList } = await supabase.from('workers').select('*, profiles(*)')
    const { data: jList } = await supabase.from('jobs').select('*')
    const { data: lList } = await supabase.from('wage_ledger').select('*')

    setWorkers(wList || [])
    setJobs(jList || [])
    setLedger(lList || [])
    setLoading(false)
  }

  const totalGrossVolume = ledger.reduce((acc, row) => acc + (row.gross_amount || 0), 48750.5)
  const totalNetWagesPaid = ledger.reduce((acc, row) => acc + (row.net_payout || 0), 23685.2)
  const totalCoopSurplus = ledger.reduce((acc, row) => acc + (row.cooperative_fee_amount || 0), 12347.9)
  const totalWelfareFund = ledger.reduce((acc, row) => acc + (row.welfare_fund_amount || 0), 11337.3)

  // Full Year Dataset
  const fullYearData = [
    { label: 'Jan', revenue: 14000, target: 12000, orders: 45 },
    { label: 'Feb', revenue: 19000, target: 15000, orders: 62 },
    { label: 'Mar', revenue: 22000, target: 18000, orders: 74 },
    { label: 'Apr', revenue: 28000, target: 22000, orders: 90 },
    { label: 'May', revenue: 38000, target: 28000, orders: 124, highlight: true },
    { label: 'Jun', revenue: 24000, target: 22000, orders: 78 },
    { label: 'Jul', revenue: 29000, target: 25000, orders: 95 },
    { label: 'Aug', revenue: 21000, target: 20000, orders: 68 },
    { label: 'Sep', revenue: 26000, target: 24000, orders: 84 },
    { label: 'Oct', revenue: 32000, target: 28000, orders: 105 },
    { label: 'Nov', revenue: 27000, target: 25000, orders: 88 },
    { label: 'Dec', revenue: 34000, target: 30000, orders: 112 },
  ]

  // Last 6 Months Dataset
  const sixMonthsData = fullYearData.slice(6)

  // Quarterly Dataset
  const quarterlyData = [
    { label: 'Q1 (Jan-Mar)', revenue: 55000, target: 45000, orders: 181 },
    { label: 'Q2 (Apr-Jun)', revenue: 90000, target: 72000, orders: 292 },
    { label: 'Q3 (Jul-Sep)', revenue: 76000, target: 69000, orders: 247 },
    { label: 'Q4 (Oct-Dec)', revenue: 93000, target: 83000, orders: 305 },
  ]

  const activeRevenueData =
    revenueTimeframe === '6m'
      ? sixMonthsData
      : revenueTimeframe === 'qtr'
      ? quarterlyData
      : fullYearData

  // Trade / Expense Breakdown Donut Data
  const expenseData = [
    { name: 'Electrical Works', value: 3200, percentage: '25.9%', fill: '#ff6b00', color: '#ff6b00' },
    { name: 'Plumbing & Drainage', value: 2850, percentage: '23.1%', fill: '#fb923c', color: '#fb923c' },
    { name: 'Carpentry & Woodwork', value: 2450, percentage: '19.8%', fill: '#ea580c', color: '#ea580c' },
    { name: 'Cleaning & Housekeeping', value: 2100, percentage: '17.0%', fill: '#c2410c', color: '#c2410c' },
    { name: 'Other Trade Services', value: 1747, percentage: '14.2%', fill: '#7c2d12', color: '#7c2d12' },
  ]

  // Cash Flow Trend Area Data with multiple selectable metrics
  const cashFlowData = [
    { day: 'May 1', net: 4200, gross: 6500, coop: 325 },
    { day: 'May 8', net: 8900, gross: 13500, coop: 675 },
    { day: 'May 15', net: 6400, gross: 9800, coop: 490 },
    { day: 'May 22', net: 9642, gross: 14800, coop: 740 },
    { day: 'May 29', net: 12400, gross: 18900, coop: 945 },
  ]

  // Mini Sparkline Data for 4 KPI Cards
  const sparklineOrange = [
    { v: 10 }, { v: 25 }, { v: 18 }, { v: 32 }, { v: 24 }, { v: 45 }, { v: 38 }, { v: 55 }
  ]
  const sparklineGreen = [
    { v: 15 }, { v: 20 }, { v: 35 }, { v: 28 }, { v: 42 }, { v: 38 }, { v: 60 }
  ]

  // Recent Transactions
  const recentTransactions = [
    { id: 1, name: 'South Delhi Electrical Rewiring', date: 'May 22, 2026 • 10:30 AM', amount: '₹1,450.00', status: 'Completed', positive: true, icon: '⚡' },
    { id: 2, name: 'Dwarka Sector 9 Plumbing Overhaul', date: 'May 22, 2026 • 09:15 AM', amount: '₹850.00', status: 'Completed', positive: true, icon: '🚰' },
    { id: 3, name: 'Janakpuri Woodwork & Lock Repair', date: 'May 21, 2026 • 08:45 PM', amount: '₹620.00', status: 'Completed', positive: true, icon: '🪚' },
    { id: 4, name: 'Connaught Place Deep House Sanitization', date: 'May 21, 2026 • 06:20 PM', amount: '₹1,200.00', status: 'Completed', positive: true, icon: '✨' },
  ]

  return (
    <div className="space-y-6">
      {/* 4 FlowBoard Top KPI Cards with Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="flow-card glow-orange-hover p-5 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Total Marketplace Volume 👁
                </span>
                <div className={`text-2xl font-black mt-1.5 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ₹{totalGrossVolume.toLocaleString()}
                </div>
              </div>
              <div className="flow-icon-badge-orange shrink-0">
                <span className="text-lg">💼</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-500">
              <span>↑ 12.5%</span>
              <span className={`font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>from last month</span>
            </div>
          </div>
          <div className="h-10 mt-2 -mx-2 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineOrange}>
                <defs>
                  <linearGradient id="sparkOrange1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff6b00" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#ff6b00" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#ff6b00" strokeWidth={2.5} fill="url(#sparkOrange1)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2 */}
        <div className="flow-card glow-emerald-hover p-5 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Total Worker Payouts
                </span>
                <div className={`text-2xl font-black mt-1.5 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ₹{totalNetWagesPaid.toLocaleString()}
                </div>
              </div>
              <div className="flow-icon-badge-emerald shrink-0">
                <span className="text-lg">📥</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-500">
              <span>↑ 8.4%</span>
              <span className={`font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>from last month</span>
            </div>
          </div>
          <div className="h-10 mt-2 -mx-2 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineGreen}>
                <defs>
                  <linearGradient id="sparkGreen1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2.5} fill="url(#sparkGreen1)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 3 */}
        <div className="flow-card glow-orange-hover p-5 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Cooperative 5% Retention
                </span>
                <div className={`text-2xl font-black mt-1.5 tracking-tight ${isDark ? 'text-[#ff7a00]' : 'text-orange-600'}`}>
                  ₹{totalCoopSurplus.toLocaleString()}
                </div>
              </div>
              <div className="flow-icon-badge-orange shrink-0">
                <span className="text-lg">🏛️</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-500">
              <span>↑ 4.7%</span>
              <span className={`font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>from last month</span>
            </div>
          </div>
          <div className="h-10 mt-2 -mx-2 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineOrange}>
                <Area type="monotone" dataKey="v" stroke="#ff6b00" strokeWidth={2.5} fill="url(#sparkOrange1)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 4 */}
        <div className="flow-card glow-orange-hover p-5 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Social Security Fund
                </span>
                <div className={`text-2xl font-black mt-1.5 tracking-tight ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                  ₹{totalWelfareFund.toLocaleString()}
                </div>
              </div>
              <div className="flow-icon-badge-orange shrink-0">
                <span className="text-lg">📈</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-500">
              <span>↑ 15.3%</span>
              <span className={`font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>from last month</span>
            </div>
          </div>
          <div className="h-10 mt-2 -mx-2 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineOrange}>
                <Area type="monotone" dataKey="v" stroke="#ff6b00" strokeWidth={2.5} fill="url(#sparkOrange1)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Middle Row: Revenue Overview (with Chart Type Switcher) & Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Overview Card */}
        <div className="lg:col-span-2 flow-card glow-orange-hover p-6 space-y-4">
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
            <div>
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Monthly Marketplace GMV
              </span>
              <div className="flex items-center gap-3 mt-0.5">
                <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>₹86,420.80</h2>
                <span className="text-xs font-bold text-emerald-500">↑ 15.6% vs last year</span>
              </div>
            </div>

            {/* Interactive Chart Options Bar */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Chart Type Selector Buttons */}
              <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-slate-100 border-slate-200'}`}>
                {[
                  { id: 'bar', label: '📊 Bar', tooltip: 'Bar Chart' },
                  { id: 'line', label: '📈 Line', tooltip: 'Line Trend' },
                  { id: 'area', label: '🌊 Area', tooltip: 'Smooth Area' },
                  { id: 'composed', label: '⚡ Combo', tooltip: 'Revenue + Target' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setRevenueChartType(type.id)}
                    title={type.tooltip}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      revenueChartType === type.id
                        ? 'bg-[#ff6b00] text-white shadow-[0_0_12px_rgba(255,107,0,0.5)]'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Timeframe Dropdown */}
              <select
                value={revenueTimeframe}
                onChange={(e) => setRevenueTimeframe(e.target.value)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border outline-none cursor-pointer transition-all ${
                  isDark
                    ? 'bg-[#161a22] border-white/[0.08] text-slate-200 focus:border-[#ff6b00]'
                    : 'bg-white border-slate-200 text-slate-700 focus:border-[#ff6b00]'
                }`}
              >
                <option value="year">📅 Full Year (12 Mo)</option>
                <option value="6m">📅 Last 6 Months</option>
                <option value="qtr">📅 Quarterly (Q1-Q4)</option>
              </select>
            </div>
          </div>

          {/* Dynamic Chart Container */}
          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {revenueChartType === 'bar' ? (
                <BarChart data={activeRevenueData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f242e' : '#e2e8f0'} opacity={0.5} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip
                    formatter={(val) => [`₹${val.toLocaleString()}`, 'Service Revenue']}
                    contentStyle={{ backgroundColor: isDark ? '#0d0f14' : '#fff', borderColor: '#ff6b00', borderRadius: '12px', color: isDark ? '#fff' : '#000' }}
                  />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]} fill="#ff6b00">
                    {activeRevenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.highlight ? '#ff7a00' : '#ff5500'} opacity={entry.highlight ? 1 : 0.85} />
                    ))}
                  </Bar>
                </BarChart>
              ) : revenueChartType === 'line' ? (
                <LineChart data={activeRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f242e' : '#e2e8f0'} opacity={0.5} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip
                    formatter={(val) => [`₹${val.toLocaleString()}`, 'Revenue']}
                    contentStyle={{ backgroundColor: isDark ? '#0d0f14' : '#fff', borderColor: '#ff6b00', borderRadius: '12px', color: isDark ? '#fff' : '#000' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#ff6b00" strokeWidth={3} dot={{ r: 5, fill: '#ff6b00', stroke: isDark ? '#0b0d11' : '#fff', strokeWidth: 2 }} activeDot={{ r: 7, fill: '#ff7a00' }} />
                </LineChart>
              ) : revenueChartType === 'area' ? (
                <AreaChart data={activeRevenueData}>
                  <defs>
                    <linearGradient id="areaGradRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff6b00" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#ff6b00" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f242e' : '#e2e8f0'} opacity={0.5} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip
                    formatter={(val) => [`₹${val.toLocaleString()}`, 'Revenue']}
                    contentStyle={{ backgroundColor: isDark ? '#0d0f14' : '#fff', borderColor: '#ff6b00', borderRadius: '12px', color: isDark ? '#fff' : '#000' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#ff6b00" strokeWidth={3} fill="url(#areaGradRev)" dot={false} />
                </AreaChart>
              ) : (
                <ComposedChart data={activeRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f242e' : '#e2e8f0'} opacity={0.5} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip
                    formatter={(val, name) => [`₹${val.toLocaleString()}`, name === 'revenue' ? 'Actual Revenue' : 'Cooperative Target']}
                    contentStyle={{ backgroundColor: isDark ? '#0d0f14' : '#fff', borderColor: '#ff6b00', borderRadius: '12px', color: isDark ? '#fff' : '#000' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="revenue" name="Actual GMV" radius={[6, 6, 0, 0]} fill="#ff6b00" opacity={0.85} />
                  <Line type="monotone" dataKey="target" name="Statutory Target" stroke="#10b981" strokeWidth={2.5} strokeDasharray="4 4" dot={false} />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown (with Donut / Pie / Bar / Radial Switcher) */}
        <div className="flow-card glow-orange-hover p-6 space-y-4 flex flex-col justify-between">
          <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
            <h2 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Service Trade Distribution
            </h2>

            {/* Chart Type Toggle */}
            <div className={`flex items-center p-0.5 rounded-lg border ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-slate-100 border-slate-200'}`}>
              {[
                { id: 'donut', label: '🍩', title: 'Donut Chart' },
                { id: 'pie', label: '🥧', title: 'Pie Chart' },
                { id: 'bar', label: '📊', title: 'Horizontal Bar' },
                { id: 'radial', label: '🎯', title: 'Radial Meter' },
              ].map((tItem) => (
                <button
                  key={tItem.id}
                  onClick={() => setExpenseChartType(tItem.id)}
                  title={tItem.title}
                  className={`px-2 py-0.5 text-xs rounded transition-all ${
                    expenseChartType === tItem.id
                      ? 'bg-[#ff6b00] text-white shadow-sm font-bold'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tItem.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              {expenseChartType === 'donut' ? (
                <PieChart>
                  <Pie data={expenseData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`₹${val}`, 'Volume']} contentStyle={{ backgroundColor: isDark ? '#0d0f14' : '#fff', borderColor: '#ff6b00', borderRadius: '12px', color: isDark ? '#fff' : '#000' }} />
                </PieChart>
              ) : expenseChartType === 'pie' ? (
                <PieChart>
                  <Pie data={expenseData} cx="50%" cy="50%" outerRadius={70} paddingAngle={2} dataKey="value">
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`₹${val}`, 'Volume']} contentStyle={{ backgroundColor: isDark ? '#0d0f14' : '#fff', borderColor: '#ff6b00', borderRadius: '12px', color: isDark ? '#fff' : '#000' }} />
                </PieChart>
              ) : expenseChartType === 'bar' ? (
                <BarChart data={expenseData} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 9, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(val) => [`₹${val}`, 'Volume']} contentStyle={{ backgroundColor: isDark ? '#0d0f14' : '#fff', borderColor: '#ff6b00', borderRadius: '12px', color: isDark ? '#fff' : '#000' }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" barSize={8} data={expenseData}>
                  <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={6} />
                  <Tooltip formatter={(val) => [`₹${val}`, 'Volume']} contentStyle={{ backgroundColor: isDark ? '#0d0f14' : '#fff', borderColor: '#ff6b00', borderRadius: '12px', color: isDark ? '#fff' : '#000' }} />
                </RadialBarChart>
              )}
            </ResponsiveContainer>
            {expenseChartType === 'donut' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total</span>
                <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>₹12,347.90</span>
              </div>
            )}
          </div>

          <div className="space-y-2 text-xs pt-2">
            {expenseData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span className={`truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{item.value.toLocaleString()}</span>
                  <span className="text-slate-500 font-mono text-[11px]">{item.percentage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Third Row: Recent Transactions, Cash Flow Curve (with Options), and Goals Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Transactions List */}
        <div className="flow-card glow-orange-hover p-6 space-y-4">
          <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
            <h2 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Recent Transactions</h2>
            <Link to="/cooperative/financials" className="text-xs text-[#ff7a00] hover:underline font-bold">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                  isDark ? 'hover:bg-[#161a22]' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 border ${
                      isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-slate-100 border-slate-200'
                    }`}
                  >
                    {tx.icon}
                  </div>
                  <div>
                    <div className={`text-xs font-bold truncate max-w-[140px] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {tx.name}
                    </div>
                    <div className="text-[10px] text-slate-500">{tx.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-emerald-500">+{tx.amount}</div>
                  <span className="text-[9px] text-slate-500 font-semibold uppercase">{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cash Flow Velocity (with interactive Chart Options) */}
        <div className="flow-card glow-orange-hover p-6 space-y-4 flex flex-col justify-between">
          <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
            <div>
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Disbursal Velocity</span>
              <div className={`text-xl font-black mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>₹9,642.30</div>
            </div>

            {/* Metric & Chart Switcher */}
            <div className="flex items-center gap-1.5">
              <select
                value={cashFlowMetric}
                onChange={(e) => setCashFlowMetric(e.target.value)}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg border outline-none ${
                  isDark ? 'bg-[#161a22] border-white/[0.08] text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <option value="net">Net Disbursed</option>
                <option value="gross">Gross Volume</option>
                <option value="coop">5% Co-op Fee</option>
              </select>

              <div className={`flex items-center p-0.5 rounded-lg border ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-slate-100 border-slate-200'}`}>
                {[
                  { id: 'area', label: '🌊' },
                  { id: 'line', label: '📈' },
                  { id: 'bar', label: '📊' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCashFlowChartType(c.id)}
                    className={`px-1.5 py-0.5 text-xs rounded ${
                      cashFlowChartType === c.id
                        ? 'bg-[#ff6b00] text-white font-bold'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              {cashFlowChartType === 'area' ? (
                <AreaChart data={cashFlowData}>
                  <defs>
                    <linearGradient id="cashFlowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff6b00" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#ff6b00" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f242e' : '#e2e8f0'} opacity={0.5} vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(val) => [`₹${val}`, cashFlowMetric.toUpperCase()]}
                    contentStyle={{ backgroundColor: isDark ? '#0d0f14' : '#fff', borderColor: '#ff6b00', borderRadius: '12px', color: isDark ? '#fff' : '#000' }}
                  />
                  <Area type="monotone" dataKey={cashFlowMetric} stroke="#ff7a00" strokeWidth={3} fill="url(#cashFlowGrad)" dot={{ r: 4, fill: '#ff7a00', stroke: isDark ? '#0b0d11' : '#fff' }} />
                </AreaChart>
              ) : cashFlowChartType === 'line' ? (
                <LineChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f242e' : '#e2e8f0'} opacity={0.5} vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(val) => [`₹${val}`, cashFlowMetric.toUpperCase()]}
                    contentStyle={{ backgroundColor: isDark ? '#0d0f14' : '#fff', borderColor: '#ff6b00', borderRadius: '12px', color: isDark ? '#fff' : '#000' }}
                  />
                  <Line type="monotone" dataKey={cashFlowMetric} stroke="#ff7a00" strokeWidth={3} dot={{ r: 5, fill: '#ff7a00' }} />
                </LineChart>
              ) : (
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f242e' : '#e2e8f0'} opacity={0.5} vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(val) => [`₹${val}`, cashFlowMetric.toUpperCase()]}
                    contentStyle={{ backgroundColor: isDark ? '#0d0f14' : '#fff', borderColor: '#ff6b00', borderRadius: '12px', color: isDark ? '#fff' : '#000' }}
                  />
                  <Bar dataKey={cashFlowMetric} radius={[4, 4, 0, 0]} fill="#ff7a00" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Goals Progress Bars */}
        <div className="flow-card glow-orange-hover p-6 space-y-4">
          <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
            <h2 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Cooperative Targets</h2>
            <Link to="/cooperative/demand-forecast" className="text-xs text-[#ff7a00] hover:underline font-bold">
              View All
            </Link>
          </div>

          <div className="space-y-4 text-xs pt-1">
            {/* Target 1 */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className={`font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <span>🎯</span>
                  <span>Monthly Service GMV Target</span>
                </span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>86%</span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#161a22]' : 'bg-slate-200'}`}>
                <div className="bg-[#ff6b00] h-full rounded-full shadow-[0_0_8px_#ff6b00]" style={{ width: '86%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>₹86,420</span>
                <span>Goal: ₹100,000</span>
              </div>
            </div>

            {/* Target 2 */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className={`font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <span>🛡️</span>
                  <span>Social Security Coverage</span>
                </span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>94%</span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#161a22]' : 'bg-slate-200'}`}>
                <div className="bg-emerald-500 h-full rounded-full shadow-[0_0_8px_#10b981]" style={{ width: '94%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>32/34 Artisans Enrolled</span>
                <span>Goal: 100%</span>
              </div>
            </div>

            {/* Target 3 */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className={`font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <span>⚡</span>
                  <span>Zero Fee-Anomaly Rate</span>
                </span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>98%</span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#161a22]' : 'bg-slate-200'}`}>
                <div className="bg-[#ff6b00] h-full rounded-full shadow-[0_0_8px_#ff6b00]" style={{ width: '98%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>100% Statutory Compliant</span>
                <span>Goal: 100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom FlowBoard Financial Insights Banner */}
      <div
        className={`flow-card glow-orange-hover p-6 sm:p-7 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 ${
          isDark
            ? 'bg-gradient-to-r from-[#12151c] via-[#181d26] to-[#12151c] border-white/[0.08]'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="space-y-1.5 max-w-2xl relative z-10">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[#ff7a00]">
            <span>✨</span>
            <span>Cooperative Intelligence & Financial Insights</span>
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Your labour cooperative service federation is performing exceptionally well! Revenue velocity is up by{' '}
            <strong className={isDark ? 'text-white' : 'text-slate-900'}>15.6%</strong> compared to last month. Zero commission leakage detected across 4–6 weeks of audit logs.
          </p>
          <div className="text-[10px] text-slate-500 pt-1">
            Synthesized from 4–6 week historical velocity, seasonality & district clustering • Delhi-NCR Grid
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <Link
            to="/cooperative/financials"
            className="flow-btn-primary px-6 py-3 text-xs font-black uppercase tracking-wider text-center"
          >
            View Detailed Audit Report
          </Link>
        </div>
      </div>
    </div>
  )
}
