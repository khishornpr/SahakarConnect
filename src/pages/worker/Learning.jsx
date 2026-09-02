import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from '../../context/I18nContext'
import { useTheme } from '../../context/ThemeContext'

export default function WorkerLearning() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const [content, setContent] = useState([])

  useEffect(() => {
    if (user) loadContent()
  }, [user])

  async function loadContent() {
    const { data } = await supabase
      .from('learning_content')
      .select('*')
      .or(`assigned_to.eq.${user.id},assigned_to.is.null`)
      .order('created_at', { ascending: false })
    setContent(data || [])
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {t('learningDashboard', 'Skill Upskilling & Certifications')}
        </h1>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {t('learningSub', 'Federation vocational training modules, safety compliance, and trade certifications')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {content.map((item) => (
          <div key={item.id} className="flow-card glow-orange-hover p-5 space-y-3">
            <div className={`w-full h-1.5 rounded-full ${item.completed ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : isDark ? 'bg-[#1c222d]' : 'bg-slate-200'}`}></div>
            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.description}</p>
            <div className={`pt-2 border-t flex justify-between items-center text-xs ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
              <span className="text-[#ff7a00] font-bold">{item.category}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                item.completed
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              }`}>
                {item.completed ? t('completed', 'Completed') : t('inProgress', 'In Progress')}
              </span>
            </div>
          </div>
        ))}
        {content.length === 0 && (
          <div className="col-span-full flow-card p-12 text-center text-slate-500">
            {t('noLearningContent', 'No learning content assigned yet')}
          </div>
        )}
      </div>
    </div>
  )
}
