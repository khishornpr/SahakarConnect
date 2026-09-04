import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { computeDemandForecast } from '../../lib/aiEngine'
import { useTranslation } from '../../context/I18nContext'
import { useTheme } from '../../context/ThemeContext'
import { TRADE_GROUPS, getCategoryByTrade } from '../../lib/serviceCategories'
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
  const [selectedTradeCategoryGroup, setSelectedTradeCategoryGroup] = useState('Repair & maintenance trades')
  const [tradeSortBy, setTradeSortBy] = useState('default')
  const [selectedSingleTrade, setSelectedSingleTrade] = useState('all')

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

  // Clean Category Groups Definition (removed cluttered 'All Services' view)
  const CATEGORY_GROUPS = [
    { id: 'Repair & maintenance trades', label: 'Repair & Tech', icon: '🔧' },
    { id: 'Home improvement / renovation', label: 'Home Improvement', icon: '🏠' },
    { id: 'Cleaning & housekeeping', label: 'Cleaning & Hygiene', icon: '🧹' },
    { id: 'Domestic works', label: 'Domestic Work', icon: '🍳' },
    { id: 'Care & household support', label: 'Care & Support', icon: '🩺' },
    { id: 'Outdoor & occasional', label: 'Outdoor & Events', icon: '🌿' },
  ]

  // Compute category counts
  const categoryCounts = {}
  tradeForecasts.forEach((row) => {
    const grp = getCategoryByTrade(row.trade)?.group || 'Other'
    categoryCounts[grp] = (categoryCounts[grp] || 0) + 1
  })

  // Multiplier based on horizon
  const horizonMultiplier = tradeHorizon === '14d' ? 1.85 : tradeHorizon === '30d' ? 4.1 : 1.0

  const activeTradeData = tradeForecasts
    .filter((row) => {
      const cat = getCategoryByTrade(row.trade)
      if (cat?.group !== selectedTradeCategoryGroup) return false
      if (selectedSingleTrade !== 'all' && row.trade !== selectedSingleTrade) {
        return false
      }
      return true
    })
    .map((row) => ({
      ...row,
      displayTrade: t(row.trade, row.trade),
      categoryGroup: getCategoryByTrade(row.trade)?.group || 'General Trade',
      adjustedDemand: Math.round(row.projectedNextWeek * horizonMultiplier),
      adjustedSupply: Math.round(row.activeWorkers * (tradeHorizon === '7d' ? 1 : tradeHorizon === '14d' ? 1.4 : 2.5)),
      gap: Math.round(row.activeWorkers * (tradeHorizon === '7d' ? 1 : 1.4) - row.projectedNextWeek * horizonMultiplier),
    }))
    .sort((a, b) => {
      if (tradeSortBy === 'demand_desc') return b.adjustedDemand - a.adjustedDemand
      if (tradeSortBy === 'deficit_desc') return a.gap - b.gap
      if (tradeSortBy === 'supply_desc') return b.adjustedSupply - a.adjustedSupply
      if (tradeSortBy === 'alpha') return a.displayTrade.localeCompare(b.displayTrade)
      return 0
    })

  const availableTradesInCurrentGroup = tradeForecasts.filter((row) => {
    return getCategoryByTrade(row.trade)?.group === selectedTradeCategoryGroup
  })

  const renderCustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null
    const rowData = payload[0]?.payload
    const isDeficit = rowData?.gap < 0
    const isSurplus = rowData?.gap > 0
    return (
      <div
        className={`p-3.5 rounded-xl border shadow-xl text-xs space-y-2 max-w-xs backdrop-blur-md ${
          isDark
            ? 'bg-[#0d0f14]/95 border-[#ff6b00]/40 text-white shadow-[0_4px_25px_rgba(0,0,0,0.8)]'
            : 'bg-white/95 border-orange-200 text-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.15)]'
        }`}
      >
        <div className="font-extrabold text-sm border-b pb-1.5 border-orange-500/20 flex items-center justify-between gap-2">
          <span>{label}</span>
          <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[#ff6b00]/15 text-[#ff7a00]">
            {rowData?.categoryGroup}
          </span>
        </div>
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#ff6b00]"></span>
              Projected Demand:
            </span>
            <strong className="font-mono text-[#ff7a00] text-sm">
              {rowData?.adjustedDemand} jobs
            </strong>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981]"></span>
              Active Available Supply:
            </span>
            <strong className="font-mono text-emerald-400 text-sm">
              {rowData?.adjustedSupply} workers
            </strong>
          </div>
          <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/[0.06]">
            <span className="text-slate-400">Net Capacity Gap:</span>
            <strong
              className={`font-mono text-xs ${
                isDeficit
                  ? 'text-rose-400 font-bold'
                  : isSurplus
                  ? 'text-amber-400 font-bold'
                  : 'text-emerald-400 font-bold'
              }`}
            >
              {isDeficit
                ? `${Math.abs(rowData?.gap)} (Deficit)`
                : isSurplus
                ? `+${rowData?.gap} (Surplus)`
                : 'Balanced (0)'}
            </strong>
          </div>
        </div>
      </div>
    )
  }

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

      {/* Forecasting Hero Chart 1: Trade Demand Projection with In-Box Category Classification */}
      <div className="flow-card glow-orange-hover p-6 sm:p-7 space-y-5">
        {/* Card Header & Primary Chart Controls */}
        <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-4 ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff6b00]/15 border border-[#ff6b00]/30 text-[#ff7a00] flex items-center justify-center text-xl shrink-0 shadow-[0_0_15px_rgba(255,107,0,0.2)] mt-0.5">
              📊
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className={`text-base sm:text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t('projectedDemandVsSupplyTitle', 'Expected Service Demand vs Available Workers')}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  isDark ? 'bg-orange-500/15 border-orange-500/30 text-[#ff7a00]' : 'bg-orange-50 border-orange-200 text-orange-800'
                }`}>
                  {activeTradeData.length} {activeTradeData.length === 1 ? 'Trade' : 'Trades'} Showing
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('demandForecastSub', 'Granular AI forecast categorized by skill sector & labor allocation balance')}
              </p>
            </div>
          </div>

          {/* Chart Type, Metric Visibility & Horizon Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Chart Type Selector */}
            <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-slate-100 border-slate-200'}`}>
              {[
                { id: 'bar', label: '📊 Bar' },
                { id: 'line', label: '📈 Line' },
                { id: 'area', label: '🌊 Area' },
                { id: 'composed', label: '⚡ Combo' },
              ].map((tItem) => {
                const isSelected = tradeChartType === tItem.id
                return (
                  <button
                    key={tItem.id}
                    aria-selected={isSelected ? 'true' : undefined}
                    data-selected={isSelected ? 'true' : undefined}
                    onClick={() => !isSelected && setTradeChartType(tItem.id)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      isSelected
                        ? 'bg-[#ff6b00] text-white shadow-[0_0_12px_rgba(255,107,0,0.5)] cursor-default'
                        : isDark
                        ? 'text-slate-400 hover:text-white hover:scale-105 hover:-translate-y-0.5 cursor-pointer'
                        : 'text-slate-600 hover:text-slate-900 hover:scale-105 hover:-translate-y-0.5 cursor-pointer'
                    }`}
                  >
                    {tItem.label}
                  </button>
                )
              })}
            </div>

            {/* Series Filter Selector */}
            <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-slate-100 border-slate-200'}`}>
              {[
                { id: 'all', label: '✨ All Combined' },
                { id: 'demand', label: '⚡ Demand Only' },
                { id: 'supply', label: '👥 Supply Only' },
              ].map((fItem) => {
                const isSelected = tradeMetricFilter === fItem.id
                return (
                  <button
                    key={fItem.id}
                    aria-selected={isSelected ? 'true' : undefined}
                    data-selected={isSelected ? 'true' : undefined}
                    onClick={() => !isSelected && setTradeMetricFilter(fItem.id)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#ff7a00] to-[#ff5500] text-white shadow-sm cursor-default'
                        : isDark
                        ? 'text-slate-400 hover:text-white hover:scale-105 hover:-translate-y-0.5 cursor-pointer'
                        : 'text-slate-600 hover:text-slate-900 hover:scale-105 hover:-translate-y-0.5 cursor-pointer'
                    }`}
                  >
                    {fItem.label}
                  </button>
                )
              })}
            </div>

            {/* Time Horizon Selector */}
            <select
              value={tradeHorizon}
              onChange={(e) => setTradeHorizon(e.target.value)}
              className={`text-xs font-bold px-3 py-2 rounded-xl border outline-none cursor-pointer transition-all shadow-sm ${
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

        {/* In-Box Category Classification Ribbon */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#ff7a00]">
                📁 Category Classification
              </span>
              <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                (Select a category to declutter & focus trade forecast)
              </span>
            </div>

            {/* Secondary Controls: Specific Trade Zoom & Sorting */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={tradeSortBy}
                onChange={(e) => setTradeSortBy(e.target.value)}
                className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer ${
                  isDark
                    ? 'bg-[#161a22] border-white/[0.08] text-slate-300 focus:border-[#ff6b00]'
                    : 'bg-white border-slate-200 text-slate-700 focus:border-[#ff6b00]'
                }`}
                title="Sort Trade Order"
              >
                <option value="default">🔀 Sort: Default</option>
                <option value="demand_desc">🔥 Sort: Highest Demand</option>
                <option value="deficit_desc">🚨 Sort: Highest Deficit</option>
                <option value="supply_desc">👥 Sort: Highest Supply</option>
                <option value="alpha">🔤 Sort: A to Z</option>
              </select>

              <select
                value={selectedSingleTrade}
                onChange={(e) => setSelectedSingleTrade(e.target.value)}
                className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer ${
                  isDark
                    ? 'bg-[#161a22] border-white/[0.08] text-slate-300 focus:border-[#ff6b00]'
                    : 'bg-white border-slate-200 text-slate-700 focus:border-[#ff6b00]'
                }`}
                title="Zoom into specific trade"
              >
                <option value="all">🔍 Zoom: All in Category</option>
                {availableTradesInCurrentGroup.map((tr) => (
                  <option key={tr.trade} value={tr.trade}>
                    {tr.trade}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* In-Box Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
            {CATEGORY_GROUPS.map((cg) => {
              const isSelected = selectedTradeCategoryGroup === cg.id
              const count = cg.id === 'all' ? tradeForecasts.length : categoryCounts[cg.id] || 0
              return (
                <button
                  key={cg.id}
                  onClick={() => {
                    setSelectedTradeCategoryGroup(cg.id)
                    setSelectedSingleTrade('all')
                  }}
                  className={`px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 border shrink-0 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#ff7a00] to-[#ff5500] text-white border-transparent shadow-[0_0_15px_rgba(255,107,0,0.4)] scale-[1.02]'
                      : isDark
                      ? 'bg-[#161a22] border-white/[0.08] text-slate-300 hover:text-white hover:border-[#ff6b00]/50 hover:bg-[#1f242e]'
                      : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-orange-300 hover:bg-orange-50/50'
                  }`}
                >
                  <span className="text-sm">{cg.icon}</span>
                  <span>{cg.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black ${
                      isSelected
                        ? 'bg-black/25 text-white'
                        : isDark
                        ? 'bg-white/10 text-slate-400'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Large Chart Container */}
        <div className="h-[460px] w-full pt-2">
          {activeTradeData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-orange-500/10 border border-orange-500/30 text-[#ff7a00]">
                🔍
              </div>
              <div className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                No Trade Data Found
              </div>
              <p className="text-xs text-slate-400 max-w-sm text-center">
                No trades match the selected category filter. Select another category.
              </p>
              <button
                onClick={() => {
                  setSelectedTradeCategoryGroup('Repair & maintenance trades')
                  setSelectedSingleTrade('all')
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[#ff6b00] text-white shadow-md hover:scale-105 transition-all"
              >
                Reset Category Filter
              </button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {tradeChartType === 'bar' ? (
                <BarChart
                  data={activeTradeData}
                  margin={{
                    top: 15,
                    right: 20,
                    left: 0,
                    bottom: activeTradeData.length > 8 ? 65 : activeTradeData.length > 4 ? 45 : 25,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? '#1f242e' : '#e2e8f0'}
                    opacity={isDark ? 0.35 : 0.6}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="displayTrade"
                    tick={{
                      fontSize: activeTradeData.length > 12 ? 10 : activeTradeData.length > 6 ? 11 : 12,
                      fill: isDark ? '#cbd5e1' : '#334155',
                      fontWeight: 600,
                    }}
                    interval={0}
                    angle={activeTradeData.length > 6 ? -25 : 0}
                    textAnchor={activeTradeData.length > 6 ? 'end' : 'middle'}
                    height={activeTradeData.length > 8 ? 70 : activeTradeData.length > 4 ? 45 : 30}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={renderCustomTooltip} />
                  <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '15px' }} />
                  {(tradeMetricFilter === 'all' || tradeMetricFilter === 'demand') && (
                    <Bar
                      dataKey="adjustedDemand"
                      fill="#ff6b00"
                      name={t('projectedDemandBar', 'Projected Job Demand')}
                      radius={[6, 6, 0, 0]}
                      barSize={activeTradeData.length <= 4 ? 36 : activeTradeData.length <= 8 ? 26 : 16}
                    />
                  )}
                  {(tradeMetricFilter === 'all' || tradeMetricFilter === 'supply') && (
                    <Bar
                      dataKey="adjustedSupply"
                      fill="#10b981"
                      name={t('activeSupplyBar', 'Available Active Workforce')}
                      radius={[6, 6, 0, 0]}
                      barSize={activeTradeData.length <= 4 ? 36 : activeTradeData.length <= 8 ? 26 : 16}
                    />
                  )}
                </BarChart>
              ) : tradeChartType === 'line' ? (
                <LineChart
                  data={activeTradeData}
                  margin={{
                    top: 15,
                    right: 20,
                    left: 0,
                    bottom: activeTradeData.length > 8 ? 65 : activeTradeData.length > 4 ? 45 : 25,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? '#1f242e' : '#e2e8f0'}
                    opacity={isDark ? 0.35 : 0.6}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="displayTrade"
                    tick={{
                      fontSize: activeTradeData.length > 12 ? 10 : activeTradeData.length > 6 ? 11 : 12,
                      fill: isDark ? '#cbd5e1' : '#334155',
                      fontWeight: 600,
                    }}
                    interval={0}
                    angle={activeTradeData.length > 6 ? -25 : 0}
                    textAnchor={activeTradeData.length > 6 ? 'end' : 'middle'}
                    height={activeTradeData.length > 8 ? 70 : activeTradeData.length > 4 ? 45 : 30}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={renderCustomTooltip} />
                  <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '15px' }} />
                  {(tradeMetricFilter === 'all' || tradeMetricFilter === 'demand') && (
                    <Line
                      type="monotone"
                      dataKey="adjustedDemand"
                      stroke="#ff6b00"
                      strokeWidth={3}
                      name={t('projectedDemandBar', 'Projected Job Demand')}
                      dot={{ r: 4, fill: '#ff6b00', stroke: isDark ? '#12151b' : '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 7 }}
                    />
                  )}
                  {(tradeMetricFilter === 'all' || tradeMetricFilter === 'supply') && (
                    <Line
                      type="monotone"
                      dataKey="adjustedSupply"
                      stroke="#10b981"
                      strokeWidth={3}
                      name={t('activeSupplyBar', 'Available Active Workforce')}
                      dot={{ r: 4, fill: '#10b981', stroke: isDark ? '#12151b' : '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 7 }}
                    />
                  )}
                </LineChart>
              ) : tradeChartType === 'area' ? (
                <AreaChart
                  data={activeTradeData}
                  margin={{
                    top: 15,
                    right: 20,
                    left: 0,
                    bottom: activeTradeData.length > 8 ? 65 : activeTradeData.length > 4 ? 45 : 25,
                  }}
                >
                  <defs>
                    <linearGradient id="areaGradDem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff6b00" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#ff6b00" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="areaGradSup" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? '#1f242e' : '#e2e8f0'}
                    opacity={isDark ? 0.35 : 0.6}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="displayTrade"
                    tick={{
                      fontSize: activeTradeData.length > 12 ? 10 : activeTradeData.length > 6 ? 11 : 12,
                      fill: isDark ? '#cbd5e1' : '#334155',
                      fontWeight: 600,
                    }}
                    interval={0}
                    angle={activeTradeData.length > 6 ? -25 : 0}
                    textAnchor={activeTradeData.length > 6 ? 'end' : 'middle'}
                    height={activeTradeData.length > 8 ? 70 : activeTradeData.length > 4 ? 45 : 30}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={renderCustomTooltip} />
                  <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '15px' }} />
                  {(tradeMetricFilter === 'all' || tradeMetricFilter === 'demand') && (
                    <Area
                      type="monotone"
                      dataKey="adjustedDemand"
                      stroke="#ff6b00"
                      strokeWidth={3}
                      fill="url(#areaGradDem)"
                      name={t('projectedDemandBar', 'Projected Job Demand')}
                      dot={{ r: 3.5 }}
                      activeDot={{ r: 7 }}
                    />
                  )}
                  {(tradeMetricFilter === 'all' || tradeMetricFilter === 'supply') && (
                    <Area
                      type="monotone"
                      dataKey="adjustedSupply"
                      stroke="#10b981"
                      strokeWidth={3}
                      fill="url(#areaGradSup)"
                      name={t('activeSupplyBar', 'Available Active Workforce')}
                      dot={{ r: 3.5 }}
                      activeDot={{ r: 7 }}
                    />
                  )}
                </AreaChart>
              ) : (
                <ComposedChart
                  data={activeTradeData}
                  margin={{
                    top: 15,
                    right: 20,
                    left: 0,
                    bottom: activeTradeData.length > 8 ? 65 : activeTradeData.length > 4 ? 45 : 25,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? '#1f242e' : '#e2e8f0'}
                    opacity={isDark ? 0.35 : 0.6}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="displayTrade"
                    tick={{
                      fontSize: activeTradeData.length > 12 ? 10 : activeTradeData.length > 6 ? 11 : 12,
                      fill: isDark ? '#cbd5e1' : '#334155',
                      fontWeight: 600,
                    }}
                    interval={0}
                    angle={activeTradeData.length > 6 ? -25 : 0}
                    textAnchor={activeTradeData.length > 6 ? 'end' : 'middle'}
                    height={activeTradeData.length > 8 ? 70 : activeTradeData.length > 4 ? 45 : 30}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={renderCustomTooltip} />
                  <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '15px' }} />
                  <Bar
                    dataKey="adjustedDemand"
                    fill="#ff6b00"
                    name="Demand Volume"
                    radius={[6, 6, 0, 0]}
                    opacity={0.85}
                    barSize={activeTradeData.length <= 4 ? 36 : activeTradeData.length <= 8 ? 26 : 16}
                  />
                  <Line
                    type="monotone"
                    dataKey="adjustedSupply"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Supply Capacity"
                    dot={{ r: 4, fill: '#10b981' }}
                    activeDot={{ r: 7 }}
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 2: District Demand Breakdown in its own Spacious Card */}
      <div className="flow-card glow-orange-hover p-6 sm:p-7 space-y-4">
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3.5 ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center text-xl shrink-0">
              📍
            </div>
            <div>
              <h2 className={`text-base sm:text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t('districtDemandTitle', 'District Demand vs Field Worker Allocation')}
              </h2>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Delhi-NCR Geographic Cluster Breakdown & Dispatch Capacity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-slate-100 border-slate-200'}`}>
              {[
                { id: 'bar', label: '📊 Horizontal' },
                { id: 'vertical', label: '📈 Vertical' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setDistrictChartType(c.id)}
                  aria-selected={districtChartType === c.id}
                  data-selected={districtChartType === c.id ? 'true' : undefined}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    districtChartType === c.id
                      ? 'bg-[#ff6b00] text-white shadow-[0_0_12px_rgba(255,107,0,0.5)] cursor-default'
                      : isDark
                      ? 'text-slate-400 hover:text-white cursor-pointer hover:scale-105'
                      : 'text-slate-600 hover:text-slate-900 cursor-pointer hover:scale-105'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {districtChartType === 'bar' ? (
              <BarChart
                data={filteredDistrictData}
                layout="vertical"
                margin={{ top: 10, right: 25, left: 10, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#1f242e' : '#e2e8f0'}
                  opacity={isDark ? 0.25 : 0.5}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="displayDistrict"
                  type="category"
                  tick={{ fontSize: 12, fill: isDark ? '#cbd5e1' : '#475569', fontWeight: 600 }}
                  width={130}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0d0f14' : '#fff',
                    borderColor: '#ff6b00',
                    borderRadius: '12px',
                    color: isDark ? '#fff' : '#000',
                    fontSize: '13px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                <Bar
                  dataKey="forecastedDemand"
                  fill="#ff7a00"
                  name={t('forecastedDemandBar', 'Forecasted Demand')}
                  radius={[0, 6, 6, 0]}
                  barSize={18}
                />
                <Bar
                  dataKey="allocatedWorkers"
                  fill="#3b82f6"
                  name={t('allocatedWorkersBar', 'Allocated Workers')}
                  radius={[0, 6, 6, 0]}
                  barSize={18}
                />
              </BarChart>
            ) : (
              <BarChart
                data={filteredDistrictData}
                margin={{ top: 10, right: 15, left: -10, bottom: 25 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#1f242e' : '#e2e8f0'}
                  opacity={isDark ? 0.25 : 0.5}
                  vertical={false}
                />
                <XAxis
                  dataKey="displayDistrict"
                  tick={{ fontSize: 11, fill: isDark ? '#cbd5e1' : '#475569', fontWeight: 600 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={45}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0d0f14' : '#fff',
                    borderColor: '#ff6b00',
                    borderRadius: '12px',
                    color: isDark ? '#fff' : '#000',
                    fontSize: '13px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                <Bar
                  dataKey="forecastedDemand"
                  fill="#ff7a00"
                  name={t('forecastedDemandBar', 'Forecasted Demand')}
                  radius={[6, 6, 0, 0]}
                  barSize={20}
                />
                <Bar
                  dataKey="allocatedWorkers"
                  fill="#3b82f6"
                  name={t('allocatedWorkersBar', 'Allocated Workers')}
                  radius={[6, 6, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trade Demand & Worker Balance Table / Trade Capacity Matrix */}
      <div className="flow-card glow-orange-hover p-6 space-y-4">
        <div className={`flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-3.5 ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff6b00] shadow-[0_0_8px_#ff6b00]"></span>
            <h2 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('tradeCapacityMatrixTitle', 'Trade Demand & Worker Balance Matrix')}
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
              {tradeForecasts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2.5">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-orange-500/10 border border-orange-500/30 text-[#ff7a00]">
                        📊
                      </div>
                      <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        No Data Available
                      </div>
                      <p className="text-xs text-slate-400">
                        No trade capacity forecast models available to display.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                tradeForecasts.map((row) => (
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
                          {Math.abs(row.deficit)} {t('deficitText', 'workers (Deficit)')}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
