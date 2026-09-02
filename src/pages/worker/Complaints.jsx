import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from '../../context/I18nContext'
import { useTheme } from '../../context/ThemeContext'

export default function WorkerComplaints() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const [complaints, setComplaints] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '' })

  useEffect(() => {
    if (user) loadComplaints()
  }, [user])

  async function loadComplaints() {
    const { data } = await supabase
      .from('complaints')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setComplaints(data || [])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await supabase.from('complaints').insert({
      user_id: user.id,
      title: form.title,
      description: form.description,
      status: 'submitted',
    })
    setForm({ title: '', description: '' })
    setShowForm(false)
    loadComplaints()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('complaintsHeading', 'Grievances & Dispute Redressal')}
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {t('complaintsSub', 'Submit dispute tickets or wage reconciliation requests directly to Federation Ombudsman')}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flow-btn-primary px-4 py-2 font-bold text-xs rounded-xl shadow self-start sm:self-auto uppercase tracking-wider"
        >
          {showForm ? t('cancel', 'Cancel') : t('newComplaint', '+ New Grievance')}
        </button>
      </div>

      {showForm && (
        <div className="flow-card glow-orange-hover p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {t('title', 'Title / Subject')}
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs outline-none ${
                  isDark ? 'bg-[#161a22] border-white/[0.08] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
                required
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {t('description', 'Description & Specific Details')}
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={`w-full px-3.5 py-2 border rounded-xl text-xs outline-none ${
                  isDark ? 'bg-[#161a22] border-white/[0.08] text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
                rows={4}
                required
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow"
            >
              {t('submitComplaint', 'Submit to Federation Ombudsman')}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {complaints.map((c) => (
          <div key={c.id} className="flow-card glow-orange-hover p-5 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{c.title}</h3>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{c.description}</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#ff6b00]/15 text-[#ff7a00] border border-[#ff6b00]/30">
                {c.status}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 pt-2 border-t border-white/[0.06]">{new Date(c.created_at).toLocaleString()}</p>
          </div>
        ))}
        {complaints.length === 0 && (
          <div className="flow-card p-12 text-center text-slate-500">
            {t('noComplaintsYet', 'No grievances filed')}
          </div>
        )}
      </div>
    </div>
  )
}
