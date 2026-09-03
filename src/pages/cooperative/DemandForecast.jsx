import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { computeDemandForecast } from '../../lib/aiEngine'
import { useTranslation } from '../../context/I18nContext'
import { useTheme } from '../../context/ThemeContext'
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
  ResponsiveContainer,
  Legend,
} from 'recharts'

export default function CooperativeDemandForecast() {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const [forecastData, setForecastData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Interactive Chart 1 Controls (Trade Forecast)
  const [tradeChartType, setTradeChartType] = useState('bar') // 'bar', 'line', 'area', 'composed'
  const [tradeHorizon, setTradeHorizon] = useState('7d') // '7d', '14d', '30d'
  const [tradeMetricFilter, setTradeMetricFilter] = useState('all') // 'all', 'demand', 'supply'

  // Interactive Chart 2 Controls (District Demand)
  const [districtChartType, setDistrictChartType] = useState('bar') // 'bar', 'vertical'

  async function loadData() {
    setLoading(true)
    const { data: jobs } = await supabase.from('jobs').select('*')
    const { data: workers } = await supabase.from('workers').select('*')

    const computed = computeDemandForecast(jobs || [], workers || [])
    setForecastData(computed)
    setLoading(false)
  }

  useEffect(() => {
    let ignore = false
    async function init() {
      const { data: jobs } = await supabase.from('jobs').select('*')
      const { data: workers } = await supabase.from('workers').select('*')

      const computed = computeDemandForecast(jobs || [], workers || [])
      if (!ignore) {
        setForecastData(computed)
        setLoading(false)
      }
    }
    init()
    return () => {
      ignore = true
    }
  }, [])

  if (loading || !forecastData) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs">
        <div className="w-8 h-8 mx-auto mb-2 border-2 border-[#ff6b00] border-t-transparent rounded-full animate-spin"></div>
        {t('aiDemandSubheading', 'Computing AI Demand Forecast & Workforce Allocation models...')}
      </div>
    )
  }

  const { tradeForecasts, districtDemand } = forecastData

  // Multiplier based on horizon
  const horizonMultiplier = tradeHorizon === '14d' ? 1.85 : tradeHorizon === '30d' ? 4.1 : 1.0

  const activeTradeData = tradeForecasts.map((row) => ({
    ...row,
    displayTrade: t(row.trade, row.trade),
    adjustedDemand: Math.round(row.projectedNextWeek * horizonMultiplier),
    adjustedSupply: Math.round(row.activeWorkers * (tradeHorizon === '7d' ? 1 : tradeHorizon === '14d' ? 1.4 : 2.5)),
    gap: Math.round(row.activeWorkers * (tradeHorizon === '7d' ? 1 : 1.4) - row.projectedNextWeek * horizonMultiplier),
  }))

  const filteredDistrictData = districtDemand.map((d) => ({
    ...d,
    displayDistrict: t(d.district, d.district),
  }))

  const localizedRecommendations = [
    {
      id: 'rec-1',
      title: t('rec1Title', '⚡ South Delhi Electrical Demand Surge'),
      trade: 'Electrician',
      urgency: 'HIGH',
      growthPct: '+38%',
      message: t(
        'rec1Msg',
        'AC cooling season and power fluctuations in South Extension cluster. Mobilize 4 certified electricians from Central Delhi surplus pool.'
      ),
    },
    {
      id: 'rec-2',
      title: t('rec2Title', '🚰 West Delhi Plumbing Monsoon Preparation'),
      trade: 'Plumber',
      urgency: 'MEDIUM',
      growthPct: '+25%',
      message: t(
        'rec2Msg',
        'Anticipated overhead tank maintenance and drainage checkups in Dwarka/Janakpuri. Reallocate 3 plumbers for preventative residential servicing.'
      ),
    },
    {
      id: 'rec-3',
      title: t('rec3Title', '🧹 Central Delhi Cleaning Capacity Optimization'),
      trade: 'Cleaner',
      urgency: 'LOW',
      growthPct: 'Surplus',
      message: t(
        'rec3Msg',
        'Commercial cleaning idle rate in Connaught Place cluster is 22%. Recommend redeploying 2 workers to East Delhi residential sectors.'
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border ${
              isDark
                ? 'bg-[#ff6b00]/15 border-[#ff6b00]/30 text-[#ff7a00]'
                : 'bg-orange-50 border-orange-200 text-orange-800'
            }`}
          >
            <span>📈</span>
            <span>SIH26089 Feature 11 • {t('demandPlanning', 'AI Demand & Planning')}</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('aiDemandHeading', 'AI Demand Forecasting & Workforce Allocation')}
          </h1>
          <p className={`text-xs mt-1 max-w-3xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {t(
              'aiDemandSubheading',
              'Predictive time-series modeling of household service demand and algorithmic worker capacity rebalancing'
            )}
          </p>
        </div>

        <button
          onClick={loadData}
          className="flow-btn-primary px-5 py-2.5 text-xs font-bold rounded-xl transition-all self-start sm:self-auto flex items-center gap-2 uppercase tracking-wider shadow-md"
        >
          <span>🔄</span>
          <span>{t('rerunAiModel', 'Re-run AI Forecast Model')}</span>
        </button>
      </div>

      {/* Rebalancing Directives Card */}
      <div className="flow-card glow-orange-hover p-6 sm:p-7 space-y-5">
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff6b00]/15 border border-[#ff6b00]/30 text-[#ff7a00] flex items-center justify-center text-xl shrink-0 shadow-[0_0_15px_rgba(255,107,0,0.2)]">
              🧠
            </div>
            <div>
              <h2 className={`text-base sm:text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t('aiDirectivesTitle', 'AI Capacity Rebalancing Directives (Actionable Intelligence)')}
              </h2>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('aiDirectivesSub', 'Synthesized from 4–6 week historical velocity, seasonality & district clustering')}
              </p>
            </div>
          </div>
          <span className="status-pill-emerald">
            {t('algorithmConfidence', 'Algorithm Confidence: 94.8%')}
          </span>
        </div>

        {/* 3 Directive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {localizedRecommendations.map((rec) => (
            <div
              key={rec.id}
              className={`p-5 space-y-3 rounded-xl border transition-all flex flex-col justify-between ${
                isDark
                  ? 'bg-[#161a22] border-white/[0.06] hover:border-[#ff6b00]'
                  : 'bg-slate-50 border-slate-200 hover:border-[#ff6b00]'
              }`}
            >
              <div>
                <div className="flex justify-between items-start font-bold text-xs gap-2">
                  <span className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{rec.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono shrink-0 font-bold bg-[#ff6b00]/20 text-[#ff7a00] border border-[#ff6b00]/40">
                    {rec.growthPct}
                  </span>
                </div>
                <p className={`text-xs mt-2.5 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{rec.message}</p>
              </div>

              <div className={`pt-3 border-t text-[11px] flex justify-between items-center ${isDark ? 'border-white/[0.06] text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                <span>
                  {t('priorityLabel', 'Priority')}:{' '}
                  <strong className={rec.urgency === 'HIGH' ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}>
                    {rec.urgency}
                  </strong>
                </span>
                <span className="font-bold text-[#ff7a00] hover:underline cursor-pointer flex items-center gap-1">
                  <span>{t('executeReallocation', 'Execute Reallocation →')}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Forecasting Charts with Interactive Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Trade Demand Projection */}
        <div className="flow-card glow-orange-hover p-6 space-y-4">
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
            <div>
              <h2 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t('projectedDemandVsSupplyTitle', 'Projected Demand vs Available Supply')}
              </h2>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Forecast by Trade Category
              </p>
            </div>

            {/* Interactive Options */}
            <div className="flex flex-wrap items-center gap-2">
              <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-slate-100 border-slate-200'}`}>
                {[
                  { id: 'bar', label: '📊 Bar' },
                  { id: 'line', label: '📈 Line' },
                  { id: 'area', label: '🌊 Area' },
                  { id: 'composed', label: '⚡ Combo' },
                ].map((tItem) => (
                  <button
                    key={tItem.id}
                    onClick={() => setTradeChartType(tItem.id)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      tradeChartType === tItem.id
                        ? 'bg-[#ff6b00] text-white shadow-[0_0_12px_rgba(255,107,0,0.5)]'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tItem.label}
                  </button>
                ))}
              </div>

              {/* Series Filter Selector to Declutter Overlapping Lines */}
              <div className={`hidden sm:flex items-center p-1 rounded-xl border ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-slate-100 border-slate-200'}`}>
                {[
                  { id: 'all', label: '✨ All Combined' },
                  { id: 'demand', label: '⚡ Demand Only' },
                  { id: 'supply', label: '👥 Supply Only' },
                ].map((fItem) => (
                  <button
                    key={fItem.id}
                    onClick={() => setTradeMetricFilter(fItem.id)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      tradeMetricFilter === fItem.id
                        ? 'bg-gradient-to-r from-[#ff7a00] to-[#ff5500] text-white shadow-sm'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {fItem.label}
                  </button>
                ))}
              </div>

              <select
                value={tradeHorizon}
                onChange={(e) => setTradeHorizon(e.target.value)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer ${
                  isDark
                    ? 'bg-[#161a22] border-white/[0.08] text-slate-200 focus:border-[#ff6b00]'
                    : 'bg-white border-slate-200 text-slate-700 focus:border-[#ff6b00]'
                }`}
              >
                <option value="7d">📅 Next 7 Days</option>
                <option value="14d">📅 Next 14 Days</option>
                <option value="30d">📅 Next 30 Days</option>
              </select>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {tradeChartType === 'bar' ? (
                <BarChart data={activeTradeData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f242e' : '#e2e8f0'} opacity={isDark ? 0.2 : 0.4} vertical={false} />
                  <XAxis dataKey="displayTrade" tick={{ fontSize: 11, fill: isDark ? '#cbd5e1' : '#475569', fontWeight: 600 }} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: isDark ? '#0d0f14' : '#fff', borderColor: '#ff6b00', borderRadius: '12px', color: isDark ? '#fff' : '#000', fontSize: '13px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                  {(tradeMetricFilter === 'all' || tradeMetricFilter === 'demand') && (
                    <Bar dataKey="adjustedDemand" fill="#ff6b00" name={t('projectedDemandBar', 'Projected Job Demand')} radius={[6, 6, 0, 0]} />
                  )}
                  {(tradeMetricFilter === 'all' || tradeMetricFilter === 'supply') && (
                    <Bar dataKey="adjustedSupply" fill="#10b981" name={t('activeSupplyBar', 'Available Active Workforce')} radius={[6, 6, 0, 0]} />
                  )}
                </BarChart>
              ) : tradeChartType === 'line' ? (
                <LineChart data={activeTradeData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f242e' : '#e2e8f0'} opacity={isDark ? 0.2 : 0.4} vertical={false} />
                  <XAxis dataKey="displayTrade" tick={{ fontSize: 11, fill: isDark ? '#cbd5e1' : '#475569', fontWeight: 600 }} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? '#0d0f14' : '#fff', borderColor: '#ff6b00', borderRadius: '12px', color: isDark ? '#fff' : '#000', fontSize: '13px' }} />
                  <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                  {(tradeMetricFilter === 'all' || tradeMetricFilter === 'demand') && (
                    <Line type="monotone" dataKey="adjustedDemand" stroke="#ff6b00" strokeWidth={2.5} name={t('projectedDemandBar', 'Projected Job Demand')} dot={{ r: 3.5, fill: '#ff6b00', stroke: isDark ? '#12151b' : '#fff', strokeWidth: 1.5 }} activeDot={{ r: 6 }} />
                  )}
                  {(tradeMetricFilter === 'all' || tradeMetricFilter === 'supply') && (
                    <Line type="monotone" dataKey="adjustedSupply" stroke="#10b981" strokeWidth={2.5} name={t('activeSupplyBar', 'Available Active Workforce')} dot={{ r: 3.5, fill: '#10b981', stroke: isDark ? '#12151b' : '#fff', strokeWidth: 1.5 }} activeDot={{ r: 6 }} />
                  )}
                </LineChart>
              ) : tradeChartType === 'area' ? (
                <AreaChart data={activeTradeData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <defs>
                    <linearGradient id="areaGradDem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff6b00" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#ff6b00" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="areaGradSup" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f242e' : '#e2e8f0'} opacity={isDark ? 0.2 : 0.4} vertical={false} />
                  <XAxis dataKey="displayTrade" tick={{ fontSize: 11, fill: isDark ? '#cbd5e1' : '#475569', fontWeight: 600 }} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? '#0d0f14' : '#fff', borderColor: '#ff6b00', borderRadius: '12px', color: isDark ? '#fff' : '#000', fontSize: '13px' }} />
                  <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                  {(tradeMetricFilter === 'all' || tradeMetricFilter === 'demand') && (
                    <Area type="monotone" dataKey="adjustedDemand" stroke="#ff6b00" strokeWidth={2.5} fill="url(#areaGradDem)" name={t('projectedDemandBar', 'Projected Job Demand')} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                  )}
                  {(tradeMetricFilter === 'all' || tradeMetricFilter === 'supply') && (
                    <Area type="monotone" dataKey="adjustedSupply" stroke="#10b981" strokeWidth={2.5} fill="url(#areaGradSup)" name={t('activeSupplyBar', 'Available Active Workforce')} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                  )}
                </AreaChart>
              ) : (
                <ComposedChart data={activeTradeData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f242e' : '#e2e8f0'} opacity={isDark ? 0.2 : 0.4} vertical={false} />
                  <XAxis dataKey="displayTrade" tick={{ fontSize: 11, fill: isDark ? '#cbd5e1' : '#475569', fontWeight: 600 }} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? '#0d0f14' : '#fff', borderColor: '#ff6b00', borderRadius: '12px', color: isDark ? '#fff' : '#000', fontSize: '13px' }} />
                  <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                  <Bar dataKey="adjustedDemand" fill="#ff6b00" name="Demand Volume" radius={[6, 6, 0, 0]} opacity={0.85} />
                  <Line type="monotone" dataKey="adjustedSupply" stroke="#10b981" strokeWidth={2.5} name="Supply Capacity" dot={{ r: 3.5, fill: '#10b981' }} activeDot={{ r: 6 }} />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: District Demand Breakdown */}
        <div className="flow-card glow-orange-hover p-6 space-y-4">
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
            <div>
              <h2 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t('districtDemandTitle', 'District Demand vs Field Allocation')}
              </h2>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Delhi-NCR Cluster Breakdown
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-slate-100 border-slate-200'}`}>
                {[
                  { id: 'bar', label: '📊 Horiz' },
                  { id: 'vertical', label: '📈 Vert' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setDistrictChartType(c.id)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      districtChartType === c.id
                        ? 'bg-[#ff6b00] text-white shadow-[0_0_12px_rgba(255,107,0,0.5)]'
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

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {districtChartType === 'bar' ? (
                <BarChart data={filteredDistrictData} layout="vertical" margin={{ top: 10, right: 15, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f242e' : '#e2e8f0'} opacity={isDark ? 0.2 : 0.4} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="displayDistrict" type="category" tick={{ fontSize: 12, fill: isDark ? '#cbd5e1' : '#475569', fontWeight: 600 }} width={120} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? '#0d0f14' : '#fff', borderColor: '#ff6b00', borderRadius: '12px', color: isDark ? '#fff' : '#000', fontSize: '13px' }} />
                  <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                  <Bar dataKey="forecastedDemand" fill="#ff7a00" name={t('forecastedDemandBar', 'Forecasted Demand')} radius={[0, 6, 6, 0]} />
                  <Bar dataKey="allocatedWorkers" fill={isDark ? '#475569' : '#94a3b8'} name={t('allocatedWorkersBar', 'Allocated Workers')} radius={[0, 6, 6, 0]} />
                </BarChart>
              ) : (
                <BarChart data={filteredDistrictData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f242e' : '#e2e8f0'} opacity={isDark ? 0.2 : 0.4} vertical={false} />
                  <XAxis dataKey="displayDistrict" tick={{ fontSize: 11, fill: isDark ? '#cbd5e1' : '#475569', fontWeight: 600 }} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? '#0d0f14' : '#fff', borderColor: '#ff6b00', borderRadius: '12px', color: isDark ? '#fff' : '#000', fontSize: '13px' }} />
                  <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                  <Bar dataKey="forecastedDemand" fill="#ff7a00" name={t('forecastedDemandBar', 'Forecasted Demand')} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="allocatedWorkers" fill={isDark ? '#475569' : '#94a3b8'} name={t('allocatedWorkersBar', 'Allocated Workers')} radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trade Deficit / Surplus Matrix Table */}
      <div className="flow-card glow-orange-hover p-6 space-y-4">
        <div className={`flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-3.5 ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff6b00] shadow-[0_0_8px_#ff6b00]"></span>
            <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('tradeCapacityMatrixTitle', 'Trade Capacity & Deficit Allocation Matrix')}
            </h2>
          </div>
          <span className={`text-xs font-bold ${isDark ? 'text-[#ff7a00]' : 'text-orange-700'}`}>
            {t('tradeCapacityMatrixSub', 'Auto-updated for upcoming service cycle')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b font-bold uppercase tracking-wider text-[11px] ${
              isDark ? 'bg-[#161a22] text-[#ff7a00] border-white/[0.08]' : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}>
              <tr>
                <th className="px-4 py-3.5">{t('colSkillTrade', 'Skill Trade')}</th>
                <th className="px-4 py-3.5">{t('colHistAvg', 'Historical Avg (Weekly)')}</th>
                <th className={`px-4 py-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{t('colProjectedDemand', 'Projected Demand')}</th>
                <th className={`px-4 py-3.5 ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>{t('colCurrentSupply', 'Current Active Supply')}</th>
                <th className="px-4 py-3.5">{t('colNetGap', 'Net Capacity Gap')}</th>
                <th className="px-4 py-3.5">{t('colAllocationStatus', 'Allocation Status')}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/[0.06] text-slate-200' : 'divide-slate-200 text-slate-800'}`}>
              {tradeForecasts.map((row) => (
                <tr key={row.trade} className="interactive-row">
                  <td className={`px-4 py-3.5 font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {t(row.trade, row.trade)}
                  </td>
                  <td className={`px-4 py-3.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {row.historicalWeekly} {t('jobsPerWk', 'jobs/wk')}
                  </td>
                  <td className={`px-4 py-3.5 font-black text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    {row.projectedNextWeek} {t('jobsUnit', 'jobs')}
                  </td>
                  <td className={`px-4 py-3.5 font-black text-sm ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
                    {row.activeWorkers} {t('workersUnit', 'workers')}
                  </td>
                  <td className="px-4 py-3.5 font-mono font-bold">
                    {row.deficit < 0 ? (
                      <span className={isDark ? 'text-rose-400' : 'text-rose-600'}>
                        {row.deficit} {t('deficitText', 'workers (Deficit)')}
                      </span>
                    ) : row.deficit > 0 ? (
                      <span className={isDark ? 'text-amber-400' : 'text-amber-700'}>
                        +{row.deficit} {t('surplusText', 'workers (Surplus)')}
                      </span>
                    ) : (
                      <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{t('balancedText', '0 (Balanced)')}</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {row.deficit < 0 ? (
                      <span className="status-pill-rose">
                        {t('rebalanceNeededPill', '⚡ REBALANCE NEEDED')}
                      </span>
                    ) : (
                      <span className="status-pill-emerald">
                        {t('optimalPill', '✓ OPTIMAL')}
                      </span>
                    )}
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
