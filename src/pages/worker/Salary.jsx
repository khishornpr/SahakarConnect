import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from '../../context/I18nContext'
import { useTheme } from '../../context/ThemeContext'

export default function WorkerSalary() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const [salary, setSalary] = useState(null)
  const [increments, setIncrements] = useState([])

  useEffect(() => {
    let ignore = false
    async function loadData() {
      if (!user) return
      const { data } = await supabase
        .from('salaries')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (ignore) return
      setSalary(data)

      const { data: history } = await supabase
        .from('salary_increments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (!ignore) {
        setIncrements(history || [])
      }
    }
    loadData()
    return () => {
      ignore = true
    }
  }, [user])

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {t('salaryDetails', 'Salary & Wage Guarantee')}
        </h1>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {t('salarySub', 'Base statutory minimum wage index and periodic revision history')}
        </p>
      </div>

      <div className="flow-card glow-orange-hover p-6">
        <h2 className={`text-sm font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {t('currentSalary', 'Current Statutory Base Wage')}
        </h2>
        <p className="text-3xl font-black text-emerald-400">₹{salary?.amount?.toLocaleString() || '18,500'}</p>
      </div>

      <div className="flow-card glow-orange-hover p-6">
        <h2 className={`text-base font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {t('incrementHistory', 'Increment & Revision History')}
        </h2>
        <div className="overflow-x-auto">
          <table className={`w-full text-left text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            <thead className={`border-b font-bold uppercase tracking-wider text-[11px] ${
              isDark ? 'bg-[#161a22] text-[#ff7a00] border-white/[0.08]' : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}>
              <tr>
                <th className="px-4 py-3">{t('colDate', 'Date')}</th>
                <th className="px-4 py-3">{t('colPrevious', 'Previous')}</th>
                <th className="px-4 py-3">{t('colNew', 'New')}</th>
                <th className="px-4 py-3">{t('colIncrement', 'Increment')}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/[0.06]' : 'divide-slate-100'}`}>
              {increments.map((inc) => (
                <tr key={inc.id} className={`transition-colors ${isDark ? 'hover:bg-[#161a22]' : 'hover:bg-slate-50'}`}>
                  <td className="px-4 py-3">{new Date(inc.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">₹{inc.previous_amount?.toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold">₹{inc.new_amount?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-emerald-400 font-bold">+₹{(inc.new_amount - inc.previous_amount)?.toLocaleString()}</td>
                </tr>
              ))}
              {increments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    {t('noIncrementHistory', 'No increment history records')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
