import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../../lib/supabase'
import { useTranslation } from '../../context/I18nContext'
import { useTheme } from '../../context/ThemeContext'

export default function WorkerLearning() {
  const { t } = useTranslation()
  const { isDark } = useTheme()

  const [modules, setModules] = useState([])
  const [activeModule, setActiveModule] = useState(null)
  const [activeLessonIndex, setActiveLessonIndex] = useState(0)
  const [completedBadgeModal, setCompletedBadgeModal] = useState(null)

  useEffect(() => {
    let ignore = false
    async function loadLearningModules() {
      const { data } = await supabase.from('learning_modules').select('*')
      if (!ignore) {
        setModules(data || [])
      }
    }
    loadLearningModules()
    return () => {
      ignore = true
    }
  }, [])

  function handleOpenModule(mod) {
    setActiveModule(mod)
    const firstIncomplete = mod.lessons?.findIndex((l) => !l.completed)
    setActiveLessonIndex(firstIncomplete >= 0 ? firstIncomplete : 0)
  }

  function handleCompleteLesson(modId, lessonId) {
    if (!activeModule) return

    const updatedLessons = activeModule.lessons.map((l) =>
      l.id === lessonId ? { ...l, completed: true } : l
    )
    const completedCount = updatedLessons.filter((l) => l.completed).length
    const totalCount = updatedLessons.length
    const progressPct = Math.round((completedCount / totalCount) * 100)
    const isAllDone = completedCount === totalCount

    const updatedModule = {
      ...activeModule,
      lessons: updatedLessons,
      completed_lessons: completedCount,
      progress_pct: progressPct,
      status: isAllDone ? 'completed' : 'in_progress',
      completed_at: isAllDone ? new Date().toISOString() : activeModule.completed_at,
    }

    setActiveModule(updatedModule)
    setModules((prev) => prev.map((m) => (m.id === modId ? updatedModule : m)))
    supabase.from('learning_modules').update(updatedModule).eq('id', modId)

    if (isAllDone) {
      setCompletedBadgeModal(updatedModule)
    } else if (activeLessonIndex < updatedLessons.length - 1) {
      setActiveLessonIndex((prev) => prev + 1)
    }
  }

  const completedModulesCount = modules.filter((m) => m.progress_pct === 100).length
  const avgProgress = modules.length
    ? Math.round(modules.reduce((acc, m) => acc + (m.progress_pct || 0), 0) / modules.length)
    : 0

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border ${
              isDark ? 'bg-[#ff6b00]/15 border-[#ff6b00]/30 text-[#ff7a00]' : 'bg-orange-50 border-orange-200 text-orange-800'
            }`}
          >
            <span>🎓</span>
            <span>{t('learningBadge', 'Cooperative Academy & Skill Certification')}</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('learningHeading', 'Learning & Upskilling Dashboard')}
          </h1>
          <p className={`text-xs mt-1 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {t('learningSubheading', 'Complete certified safety & trade micro-courses to boost your dispatch matching priority and increase customer trust ratings.')}
          </p>
        </div>

        {/* Quick Academy Stats */}
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2.5 rounded-2xl border ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('overallProgress', 'Overall Progress')}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-lg font-black text-[#ff7a00]">{avgProgress}%</span>
              <div className="w-16 h-2 rounded-full bg-slate-700 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400" style={{ width: `${avgProgress}%` }}></div>
              </div>
            </div>
          </div>

          <div className={`px-4 py-2.5 rounded-2xl border ${isDark ? 'bg-[#161a22] border-white/[0.08]' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('earnedBadges', 'Earned Badges')}</span>
            <span className="text-lg font-black text-emerald-400 mt-0.5 block">{completedModulesCount} / {modules.length}</span>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {modules.map((mod) => {
          const isDone = mod.progress_pct === 100
          const isInProgress = mod.progress_pct > 0 && mod.progress_pct < 100

          return (
            <div
              key={mod.id}
              className="flow-card glow-orange-hover p-6 flex flex-col justify-between space-y-4 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                      mod.category === 'Safety Training'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : mod.category === 'Upskilling'
                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                        : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    }`}
                  >
                    {t(mod.category, mod.category)} • {t(mod.trade, mod.trade)}
                  </span>

                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      isDone
                        ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
                        : isInProgress
                        ? 'bg-amber-500/15 border border-amber-500/40 text-amber-400'
                        : 'bg-slate-500/15 border border-slate-500/30 text-slate-400'
                    }`}
                  >
                    {isDone ? t('completedBadge', '✓ Certified') : isInProgress ? t('inProgressTab', 'In Progress') : t('notStarted', 'Not Started')}
                  </span>
                </div>

                <div>
                  <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {mod.title}
                  </h3>
                  <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {mod.description}
                  </p>
                </div>

                {/* Progress Bar & Details */}
                <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">{t('approxDuration', 'Duration')}: {mod.duration}</span>
                    <span className={isDone ? 'text-emerald-400' : 'text-[#ff7a00]'}>
                      {mod.completed_lessons || 0}/{mod.total_lessons} {t('moduleLessons', 'Lessons')} ({mod.progress_pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isDone
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-[#ff6b00] to-amber-400'
                      }`}
                      style={{ width: `${mod.progress_pct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Reward Badge Preview */}
                <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                  isDone
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    : isDark
                    ? 'bg-[#161a22] border-white/[0.06] text-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-base">{mod.badge?.split(' ')[0] || '🏆'}</span>
                    <span>{mod.badge || 'Certified Badge'}</span>
                  </div>
                  {isDone ? (
                    <span className="text-emerald-400 text-[11px]">✓ {t('completedBadge', 'Badge Unlocked!')}</span>
                  ) : (
                    <span className="text-[11px] text-slate-500">{t('unlockCertificate', 'Unlocks on completion')}</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleOpenModule(mod)}
                className={`w-full py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
                  isDone
                    ? 'border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'
                    : 'flow-btn-primary shadow-lg'
                }`}
              >
                {isDone ? t('completedBadge', 'Review Course Lessons') : isInProgress ? t('continueLearning', 'Continue →') : t('startLearning', 'Start Learning →')}
              </button>
            </div>
          )
        })}
      </div>

      {/* INTERACTIVE LESSON VIEWER MODAL */}
      {activeModule &&
        createPortal(
          <div className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div
              className={`rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 border my-auto max-h-[90vh] overflow-y-auto ${
                isDark
                  ? 'bg-[#12151b] border-white/[0.1] text-white shadow-[0_0_40px_rgba(0,0,0,0.8)]'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b pb-3 border-white/[0.08]">
                <div>
                  <span className="text-[11px] font-bold text-[#ff7a00] uppercase tracking-wider">
                    {t(activeModule.category, activeModule.category)} • {t('moduleLessons', 'Lesson')} {activeLessonIndex + 1} / {activeModule.lessons?.length || 4}
                  </span>
                  <h3 className={`text-base sm:text-lg font-black mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {activeModule.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveModule(null)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  ✕
                </button>
              </div>

              {/* Lesson Playlist Pills */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {activeModule.lessons?.map((les, idx) => (
                  <button
                    key={les.id}
                    onClick={() => setActiveLessonIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                      activeLessonIndex === idx
                        ? 'bg-[#ff6b00] border-[#ff6b00] text-white'
                        : les.completed
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400'
                        : isDark
                        ? 'bg-[#161a22] border-white/[0.08] text-slate-400'
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    {les.completed ? '✓' : idx + 1}. {les.title}
                  </button>
                ))}
              </div>

              {/* Lesson Content Viewer */}
              {activeModule.lessons?.[activeLessonIndex] && (
                <div className={`p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-[#161a22] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#ff7a00]">
                      {activeModule.lessons[activeLessonIndex].title}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ⏱ {activeModule.lessons[activeLessonIndex].duration}
                    </span>
                  </div>

                  {/* Interactive Micro-Lesson Text */}
                  <div className="space-y-2 text-xs leading-relaxed text-slate-300">
                    <p>
                      <strong>{t('safetyProtocolAcademy', 'Standard Operating Protocol')}:</strong> Always conduct a visual audit before starting service. Ensure main switches or secondary isolators are clearly locked out with tagout warnings.
                    </p>
                    <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1.5 text-[11px]">
                      <div className="font-bold text-amber-300">{t('safetyProtocolAcademy', 'Key Safety Checklist')}:</div>
                      <ul className="list-disc list-inside space-y-1 text-slate-300">
                        <li>Test tool handles for 1000V dielectric insulation certification.</li>
                        <li>Always wear rubber-soled ISI-approved footwear on tile or wet floors.</li>
                        <li>Inform household occupants not to touch auxiliary fuse boards during work.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Mark as completed action */}
                  <div className="pt-2 flex justify-between items-center border-t border-white/[0.06]">
                    <span className="text-xs text-slate-400">
                      {activeModule.lessons[activeLessonIndex].completed ? (
                        <span className="text-emerald-400 font-bold">✓ {t('done', 'Lesson Finished')}</span>
                      ) : (
                        <span>{t('curriculumLessons', 'Ready to complete?')}</span>
                      )}
                    </span>

                    <button
                      onClick={() =>
                        handleCompleteLesson(
                          activeModule.id,
                          activeModule.lessons[activeLessonIndex].id
                        )
                      }
                      className="px-4 py-2 flow-btn-primary text-xs font-bold rounded-xl"
                    >
                      {activeModule.lessons[activeLessonIndex].completed
                        ? `${t('continueLearning', 'Next Lesson')} →`
                        : `✓ ${t('completeLessonBtn', 'Mark Lesson Complete & Continue')}`}
                    </button>
                  </div>
                </div>
              )}

              {/* Progress Summary in Modal */}
              <div className="flex items-center justify-between text-xs text-slate-400 border-t pt-3 border-white/[0.08]">
                <span>{t('overallProgress', 'Overall Module Progress')}: {activeModule.progress_pct}%</span>
                <button
                  onClick={() => setActiveModule(null)}
                  className="px-4 py-1.5 rounded-lg border border-slate-600 hover:text-white"
                >
                  {t('closeModal', 'Close Course')}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* CONGRATULATIONS BADGE UNLOCKED MODAL */}
      {completedBadgeModal &&
        createPortal(
          <div className="fixed inset-0 z-[999999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div
              className={`rounded-2xl max-w-md w-full p-6 text-center space-y-4 border my-auto animate-fade-in-up ${
                isDark ? 'bg-[#12151b] border-emerald-500/50 text-white shadow-[0_0_50px_rgba(16,185,129,0.3)]' : 'bg-white border-emerald-300 text-slate-900'
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-3xl mx-auto animate-bounce">
                {completedBadgeModal.badge?.split(' ')[0] || '🏆'}
              </div>
              <div>
                <h3 className="text-lg font-black text-emerald-400">{t('congratsBadgeUnlocked', 'Course Completed!')}</h3>
                <h4 className="text-sm font-bold text-white mt-1">{completedBadgeModal.title}</h4>
                <p className="text-xs text-slate-300 mt-2">
                  {t('badgeUnlockedDesc', 'You have successfully unlocked the official certification badge! This is now attached to your public Skill Profile and enhances your dispatch matching score.')}
                </p>
              </div>
              <button
                onClick={() => setCompletedBadgeModal(null)}
                className="w-full py-2.5 flow-btn-primary text-xs font-bold rounded-xl"
              >
                {t('unlockCertificate', 'Awesome, View My Badges!')}
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
