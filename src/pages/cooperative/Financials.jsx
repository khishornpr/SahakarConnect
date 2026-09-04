import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { detectWageAnomalies } from '../../lib/aiEngine'
import { useTranslation } from '../../context/I18nContext'
import { useTheme } from '../../context/ThemeContext'
import InvoiceModal from '../../components/InvoiceModal'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export default function CooperativeFinancials() {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const [ledger, setLedger] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [resolvedIds, setResolvedIds] = useState([])

  // Interactive Chart Options
  const [chartType, setChartType] = useState('bar') // 'bar', 'line', 'area', 'stacked'
  const [metricFilter, setMetricFilter] = useState('all') // 'all', 'net', 'coop', 'gross'

  useEffect(() => {
    let ignore = false
    async function loadLedger() {
      const { data } = await supabase
        .from('wage_ledger')
        .select('*, worker:profiles(*), job:jobs(*)')
        .order('created_at', { ascending: false })
      if (!ignore) {
        setLedger(data || [])
      }
    }
    loadLedger()
    return () => {
      ignore = true
    }
  }, [])

  function handleResolveAnomaly(id) {
    setResolvedIds([...resolvedIds, id])
  }

  const allAnomalies = detectWageAnomalies(ledger)
  const activeAnomalies = allAnomalies.filter((a) => !resolvedIds.includes(a.id))
  const normalEntries = ledger.filter((l) => !l.is_anomalous || resolvedIds.includes(l.id))

  const totalGross = ledger.reduce((acc, row) => acc + (row.gross_amount || 0), 0)
  const totalCoopRetained = ledger.reduce((acc, row) => acc + (row.cooperative_fee_amount || 0), 0)
  const totalNetDisbursed = ledger.reduce((acc, row) => acc + (row.net_payout || 0), 0)

  // Chart data transformed from ledger entries
  const chartData = ledger.slice(0, 8).map((row, idx) => ({
    label: `Job #${idx + 1}`,
    gross: row.gross_amount,
    net: row.net_payout,
    coop: row.cooperative_fee_amount,
    welfare: row.welfare_fund_amount,
    isAnomalous: row.is_anomalous && !resolvedIds.includes(row.id),
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border ${
              isDark
                ? 'bg-[#ff6b00]/15 border-[#ff6b00]/30 text-[#ff7a00]'
                : 'bg-orange-50 border-orange-200 text-orange-800'
            }`}
          >
            <span>🔍</span>
            <span>SIH26089 Feature 8 • {t('financialsAnomalies', 'Wage Ledger & Anomalies')}</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('fairWageLedger', 'Cooperative Financial Audit & Wage Disbursal')}
          </h1>
          <p className={`text-xs mt-1 max-w-3xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Real-time audit of gross customer billings, cooperative 5% retentions, worker social security fund, and AI anomaly detection
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flow-card glow-orange-hover p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('grossBilled', 'Gross Billed Value')}
              </span>
              <div className={`text-2xl font-black mt-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                ₹{totalGross.toLocaleString()}
              </div>
            </div>
            <div className="flow-icon-badge-orange shrink-0">
              <span className="text-xl">💼</span>
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Total Marketplace GMV</div>
        </div>

        <div className="flow-card glow-orange-hover p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('coopRetained', 'Co-op 5% Surplus Pool')}
              </span>
              <div className="text-2xl font-black mt-1.5 text-[#ff7a00]">
                ₹{totalCoopRetained.toLocaleString()}
              </div>
            </div>
            <div className="flow-icon-badge-orange shrink-0">
              <span className="text-xl">🏛️</span>
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Federation Operations</div>
        </div>

        <div className="flow-card glow-emerald-hover p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('netDisbursed', 'Net Direct Disbursed')}
              </span>
              <div className="text-2xl font-black mt-1.5 text-emerald-400">
                ₹{totalNetDisbursed.toLocaleString()}
              </div>
            </div>
            <div className="flow-icon-badge-emerald shrink-0">
              <span className="text-xl">💰</span>
            </div>
          </div>
          <div className="text-xs text-emerald-400 mt-2 font-bold">100% Settled to Workers</div>
        </div>

        <div className="flow-card glow-rose-hover p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('aiAnomalyAlerts', 'AI Anomaly Alerts')}
              </span>
              <div className="text-2xl font-black mt-1.5 text-rose-400">
                {activeAnomalies.length} Flagged
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
              <span className="text-xl">🚨</span>
            </div>
          </div>
          <div className="text-xs text-rose-400 mt-2 font-bold">
            {activeAnomalies.length > 0 ? 'Requires Federation Audit' : 'All Clear'}
          </div>
        </div>
      </div>

      {/* Interactive Financial Velocity & Audit Chart */}
      <div className="flow-card glow-orange-hover p-6 space-y-4">
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
          <div>
            <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Fee Retention & Disbursal Velocity Chart
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Interactive audit comparison of gross billed amounts, 5% co-op fee, and net direct payouts
            </p>
          </div>

          {/* Chart Controls & Series Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-slate-100 border-slate-200'}`}>
              {[
                { id: 'bar', label: '📊 Bar' },
                { id: 'line', label: '📈 Line' },
                { id: 'area', label: '🌊 Area' },
                { id: 'stacked', label: '⚡ Stacked' },
              ].map((c) => {
                const isSelected = chartType === c.id
                return (
                  <button
                    key={c.id}
                    aria-selected={isSelected ? 'true' : undefined}
                    data-selected={isSelected ? 'true' : undefined}
                    onClick={() => !isSelected && setChartType(c.id)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      isSelected
                        ? 'flow-btn-primary shadow-[0_0_12px_rgba(255,107,0,0.5)] cursor-default'
                        : isDark
                        ? 'text-slate-400 hover:text-white hover:scale-105 hover:-translate-y-0.5 cursor-pointer'
                        : 'text-slate-600 hover:text-slate-900 hover:scale-105 hover:-translate-y-0.5 cursor-pointer'
                    }`}
                  >
                    {c.label}
                  </button>
                )
              })}
            </div>

            {/* Metric Filter Selector to Declutter Multi-Series */}
            <div className={`hidden sm:flex items-center p-1 rounded-xl border ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-slate-100 border-slate-200'}`}>
              {[
                { id: 'all', label: '✨ All' },
                { id: 'net', label: '💰 Net Payouts' },
                { id: 'coop', label: '🏛️ Co-op Retained' },
              ].map((m) => {
                const isSelected = metricFilter === m.id
                return (
                  <button
                    key={m.id}
                    aria-selected={isSelected ? 'true' : undefined}
                    data-selected={isSelected ? 'true' : undefined}
                    onClick={() => !isSelected && setMetricFilter(m.id)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#10b981] to-[#059669] text-white shadow-sm cursor-default'
                        : isDark
                        ? 'text-slate-400 hover:text-white hover:scale-105 hover:-translate-y-0.5 cursor-pointer'
                        : 'text-slate-600 hover:text-slate-900 hover:scale-105 hover:-translate-y-0.5 cursor-pointer'
                    }`}
                  >
                    {m.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={chartData} barGap={4} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f242e' : '#e2e8f0'} opacity={isDark ? 0.2 : 0.4} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: isDark ? '#cbd5e1' : '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#0d0f14' : '#fff', borderColor: '#ff6b00', borderRadius: '12px', color: isDark ? '#fff' : '#000', fontSize: '13px' }} />
                <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '8px' }} />
                {(metricFilter === 'all' || metricFilter === 'gross') && (
                  <Bar dataKey="gross" name="Gross Billed" fill={isDark ? '#334155' : '#cbd5e1'} radius={[6, 6, 0, 0]} />
                )}
                {(metricFilter === 'all' || metricFilter === 'net') && (
                  <Bar dataKey="net" name="Net Direct Payout (95%)" fill="#10b981" radius={[6, 6, 0, 0]} />
                )}
                {(metricFilter === 'all' || metricFilter === 'coop') && (
                  <Bar dataKey="coop" name="Co-op 5% Retained" fill="#ff6b00" radius={[6, 6, 0, 0]} />
                )}
              </BarChart>
            ) : chartType === 'line' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f242e' : '#e2e8f0'} opacity={isDark ? 0.2 : 0.4} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: isDark ? '#cbd5e1' : '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#0d0f14' : '#fff', borderColor: '#ff6b00', borderRadius: '12px', color: isDark ? '#fff' : '#000', fontSize: '13px' }} />
                <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '8px' }} />
                {metricFilter === 'all' && (
                  <Line type="monotone" dataKey="gross" name="Gross Billed" stroke={isDark ? '#475569' : '#94a3b8'} strokeWidth={1.5} strokeDasharray="3 3" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                )}
                {(metricFilter === 'all' || metricFilter === 'net') && (
                  <Line type="monotone" dataKey="net" name="Net Direct Payout (95%)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3.5, fill: '#10b981', stroke: isDark ? '#12151b' : '#fff', strokeWidth: 1.5 }} activeDot={{ r: 6 }} />
                )}
                {(metricFilter === 'all' || metricFilter === 'coop') && (
                  <Line type="monotone" dataKey="coop" name="Co-op 5% Retained" stroke="#ff6b00" strokeWidth={2.5} dot={{ r: 3.5, fill: '#ff6b00', stroke: isDark ? '#12151b' : '#fff', strokeWidth: 1.5 }} activeDot={{ r: 6 }} />
                )}
              </LineChart>
            ) : chartType === 'area' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="areaFin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f242e' : '#e2e8f0'} opacity={isDark ? 0.2 : 0.4} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: isDark ? '#cbd5e1' : '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#0d0f14' : '#fff', borderColor: '#ff6b00', borderRadius: '12px', color: isDark ? '#fff' : '#000', fontSize: '13px' }} />
                <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="net" stroke="#10b981" strokeWidth={2.5} fill="url(#areaFin)" name="Net Direct Payout" dot={{ r: 3 }} activeDot={{ r: 6 }} />
              </AreaChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f242e' : '#e2e8f0'} opacity={isDark ? 0.2 : 0.4} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: isDark ? '#cbd5e1' : '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#0d0f14' : '#fff', borderColor: '#ff6b00', borderRadius: '12px', color: isDark ? '#fff' : '#000', fontSize: '13px' }} />
                <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '8px' }} />
                <Bar dataKey="net" stackId="a" name="Net Worker Disbursal" fill="#10b981" />
                <Bar dataKey="coop" stackId="a" name="Co-op 5% Surplus" fill="#ff6b00" />
                <Bar dataKey="welfare" stackId="a" name="Welfare Fund" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Anomaly Detection Alert Panel */}
      <div className="flow-card glow-rose-hover p-6 sm:p-7 space-y-4">
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3.5 ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-400 flex items-center justify-center text-xl shrink-0">
              🚨
            </div>
            <div>
              <h2 className={`text-base font-black ${isDark ? 'text-rose-200' : 'text-rose-950'}`}>
                AI Financial Anomaly Engine • Active Audit Warnings ({activeAnomalies.length})
              </h2>
              <p className={`text-xs ${isDark ? 'text-rose-300/80' : 'text-rose-800'}`}>
                Automated heuristic inspection detects commission rate deviations (&gt;5.0% statutory ceiling) and tariff spikes
              </p>
            </div>
          </div>
          <span className="status-pill-rose">
            Federation Compliance Watchdog
          </span>
        </div>

        {activeAnomalies.length > 0 ? (
          activeAnomalies.map((anomaly) => (
            <div
              key={anomaly.id}
              className={`p-5 space-y-3 text-xs rounded-xl border ${
                isDark ? 'bg-[#161a22] border-rose-500/40 text-slate-200' : 'bg-rose-50/50 border-rose-200 text-slate-800'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono font-bold text-sm text-rose-400">
                    {anomaly.id}
                  </span>
                  <span className={`ml-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    (Job: {anomaly.job_id} • {new Date(anomaly.created_at).toLocaleDateString()})
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded font-black text-[10px] bg-rose-950 text-rose-300 border border-rose-500/60">
                  SEVERITY: {anomaly.severity || 'HIGH'}
                </span>
              </div>

              <div className={`p-3.5 rounded-xl border text-xs space-y-1 ${isDark ? 'bg-rose-950/30 border-rose-900/50 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                <div className="font-bold">⚠️ Audit Reasons Detected:</div>
                <ul className="list-disc list-inside space-y-0.5 pl-1">
                  {(anomaly.detectedReasons || [anomaly.anomaly_reason]).map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
                <div className={`p-2.5 rounded-lg border ${isDark ? 'bg-[#1c222d] border-white/[0.06]' : 'bg-white border-slate-200'}`}>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Gross Billed</span>
                  <strong className={`text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{anomaly.gross_amount}</strong>
                </div>
                <div className={`p-2.5 rounded-lg border ${isDark ? 'bg-[#1c222d] border-white/[0.06]' : 'bg-white border-slate-200'}`}>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Deducted Fee</span>
                  <strong className="text-rose-400 text-sm">
                    ₹{anomaly.cooperative_fee_amount} ({anomaly.cooperative_fee_pct}%)
                  </strong>
                </div>
                <div className={`p-2.5 rounded-lg border ${isDark ? 'bg-[#1c222d] border-white/[0.06]' : 'bg-white border-slate-200'}`}>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Worker Net Payout</span>
                  <strong className="text-emerald-400 text-sm">₹{anomaly.net_payout}</strong>
                </div>
                <div className={`p-2.5 rounded-lg border ${isDark ? 'bg-[#1c222d] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Statutory Ceiling</span>
                  <strong className="text-slate-300 text-sm">5.0% Max</strong>
                </div>
              </div>

              <div className={`flex justify-end gap-2 pt-2 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                <button
                  onClick={() => setSelectedInvoice(anomaly)}
                  className={`px-3.5 py-1.5 font-bold rounded-lg text-xs transition-all border ${
                    isDark
                      ? 'bg-[#161a22] border-white/[0.08] text-slate-300 hover:text-white'
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  Inspect Invoice 📄
                </button>
                <button
                  onClick={() => handleResolveAnomaly(anomaly.id)}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-lg text-xs shadow-md transition-all"
                >
                  ✓ Mark Audited & Resolve Flag
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-emerald-400 bg-emerald-950/40 rounded-xl border border-emerald-500/30 text-xs font-semibold">
            ✓ All transactions are 100% compliant with the cooperative statutory 5% fee limit and standard tariffs.
          </div>
        )}
      </div>

      {/* Verified Wage Ledger Table */}
      <div className="flow-card glow-orange-hover p-6 space-y-4">
        <div className={`flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-3.5 ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></span>
            <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Standard Verified Disbursals ({normalEntries.length})
            </h2>
          </div>
          <span className="status-pill-emerald">
            ✓ Statutory Compliant
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b font-bold uppercase tracking-wider text-[11px] ${
              isDark ? 'bg-[#161a22] text-[#ff7a00] border-white/[0.08]' : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}>
              <tr>
                <th className="px-4 py-3.5">Ledger ID</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Gross Billing</th>
                <th className="px-4 py-3.5">Co-op 5% Surplus</th>
                <th className="px-4 py-3.5">Welfare Fund</th>
                <th className="px-4 py-3.5 text-emerald-400">Net Disbursal</th>
                <th className="px-4 py-3.5">Audit Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/[0.06] text-slate-200' : 'divide-slate-200 text-slate-800'}`}>
              {normalEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2.5">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-orange-500/10 border border-orange-500/30 text-[#ff7a00]">
                        💳
                      </div>
                      <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        No Data Available
                      </div>
                      <p className="text-xs text-slate-400">
                        No standard verified disbursal entries recorded in the ledger yet.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                normalEntries.map((row) => (
                  <tr key={row.id} className="interactive-row">
                    <td className="px-4 py-3.5 font-mono font-bold text-emerald-400">{row.id}</td>
                    <td className={`px-4 py-3.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                    <td className={`px-4 py-3.5 font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      ₹{row.gross_amount}
                    </td>
                    <td className="px-4 py-3.5 text-amber-400 font-bold">+ ₹{row.cooperative_fee_amount}</td>
                    <td className="px-4 py-3.5 text-cyan-400 font-bold">+ ₹{row.welfare_fund_amount}</td>
                    <td className="px-4 py-3.5 font-black text-emerald-400 text-sm">₹{row.net_payout}</td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => setSelectedInvoice(row)}
                        className="px-3 py-1 flow-btn-primary rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                      >
                        <span>📄</span>
                        <span>Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal
          job={selectedInvoice.job || { id: selectedInvoice.job_id, title: 'Service Engagement', estimated_amount: selectedInvoice.gross_amount }}
          worker={selectedInvoice.worker || { full_name: 'Verified Cooperative Member' }}
          household={{ full_name: 'Household Customer' }}
          wageLedgerItem={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  )
}
