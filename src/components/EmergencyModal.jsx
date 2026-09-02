import { useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'
import { DELHI_NCR_AREAS } from '../lib/geoService'
import { useTheme } from '../context/ThemeContext'

export default function EmergencyModal({ isOpen, onClose, onConfirmEmergency }) {
  const { isDark } = useTheme()
  const [selectedEmergency, setSelectedEmergency] = useState('Electrical Sparking / Short Circuit')
  const [area, setArea] = useState(DELHI_NCR_AREAS[0].name)
  const [address, setAddress] = useState('B-42, South Extension Part 2, New Delhi')
  const [searching, setSearching] = useState(false)
  const [dispatched, setDispatched] = useState(false)

  if (!isOpen) return null

  const emergencies = [
    { type: 'Electrical Sparking / Short Circuit', icon: '⚡', time: '15-25 min', tariff: '₹500' },
    { type: 'Major Pipe Burst / Water Flooding', icon: '🌊', time: '20-30 min', tariff: '₹500' },
    { type: 'Main Door Lockout / Broken Key', icon: '🔐', time: '25-35 min', tariff: '₹600' },
    { type: 'Gas Line Appliance Safety Inspection', icon: '🔥', time: '15-20 min', tariff: '₹450' },
  ]

  async function handleTriggerEmergency() {
    setSearching(true)
    const tradeCategory = selectedEmergency.includes('Electrical')
      ? 'Electrician'
      : selectedEmergency.includes('Pipe')
      ? 'Plumber'
      : selectedEmergency.includes('Door')
      ? 'Carpenter'
      : 'Appliance Technician'

    const emergencyJob = {
      id: `emg-${Date.now()}`,
      household_id: 'h1',
      assigned_worker_id: 'w1',
      trade_category: tradeCategory,
      title: `🚨 EMERGENCY: ${selectedEmergency}`,
      description: `Urgent 30-min priority dispatch request at ${address}.`,
      area: area,
      address: address,
      latitude: 28.5728,
      longitude: 77.2217,
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time_slot: 'IMMEDIATE (30-Min SOS)',
      estimated_hours: 1.0,
      estimated_amount: 500.0,
      status: 'assigned',
      is_emergency: true,
      priority: 'EMERGENCY',
      otp_code: '9999',
    }

    await supabase.from('jobs').insert(emergencyJob)

    setTimeout(() => {
      setSearching(false)
      setDispatched(true)
      if (onConfirmEmergency) onConfirmEmergency(selectedEmergency, area, address)
    }, 1200)
  }

  const content = (
    <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className={`rounded-2xl max-w-lg w-full p-6 sm:p-7 my-auto shadow-2xl space-y-5 border transition-all ${
          isDark
            ? 'bg-[#150a10] border-rose-500/50 text-white shadow-[0_0_40px_rgba(244,63,94,0.3)]'
            : 'bg-white border-rose-200 text-slate-900 shadow-2xl'
        }`}
      >
        <div className={`flex justify-between items-start border-b pb-3 ${isDark ? 'border-rose-500/20' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/50 text-rose-500 flex items-center justify-center text-xl font-bold animate-pulse shrink-0">
              🚨
            </span>
            <div>
              <div className="inline-block px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 text-[10px] font-bold border border-rose-300 dark:border-rose-800 uppercase tracking-wider mb-0.5">
                Quick Response
              </div>
              <h2 className={`text-base sm:text-lg font-black ${isDark ? 'text-rose-100' : 'text-slate-900'}`}>
                30-Min Emergency Help
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
              isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            ✕
          </button>
        </div>

        {dispatched ? (
          <div className="p-6 text-center space-y-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800/80">
            <div className="text-4xl animate-bounce">🚑</div>
            <h3 className="text-base font-bold text-rose-800 dark:text-rose-200">Worker Dispatched!</h3>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              Nearest on-duty worker assigned (Ramesh Kumar - 1.8 km away).
              Expected arrival: <strong className="text-rose-600 dark:text-rose-400">18 minutes</strong>.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow"
            >
              Done & Return
            </button>
          </div>
        ) : searching ? (
          <div className="py-10 text-center space-y-4">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-rose-500/40 animate-ping"></div>
              <div className="absolute inset-2 rounded-full border-2 border-rose-400/60 animate-pulse"></div>
              <span className="text-2xl">📡</span>
            </div>
            <div className="text-sm font-bold text-rose-700 dark:text-rose-200">
              Finding nearest available emergency workers in {area}...
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Connecting directly...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Select Emergency Issue
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {emergencies.map((e) => (
                  <button
                    key={e.type}
                    type="button"
                    onClick={() => setSelectedEmergency(e.type)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      selectedEmergency === e.type
                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200 font-bold shadow-sm'
                        : isDark
                        ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-lg">{e.icon}</span>
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">⏱️ {e.time}</span>
                    </div>
                    <div className={`mt-1.5 font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{e.type}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Rate: {e.tariff}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Area / Hub</label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  {DELHI_NCR_AREAS.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleTriggerEmergency}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>🚨 Request 30-Min Emergency Help</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
