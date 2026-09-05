import { useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'

export default function RatingModal({ job, currentUserRole, currentUserId, onClose, onRatingSubmitted }) {
  const { isDark } = useTheme()
  const [score, setScore] = useState(1)
  const [selectedTags, setSelectedTags] = useState([])
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const householdTags = [
    'On-Time',
    'Great Work',
    'Polite & Friendly',
    'Clean & Tidy',
    'Fair Pricing',
    'Had All Tools',
  ]

  const workerTags = [
    'Polite Customer',
    'Safe Workplace',
    'Fast OTP Sharing',
    'Clear Instructions',
    'Easy Access',
    'Respectful',
  ]

  const availableTags = currentUserRole === 'household' ? householdTags : workerTags

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)

    const targetUserId =
      currentUserRole === 'household'
        ? job.assigned_worker_id
        : job.household_id

    const finalReview = reviewText.trim() || 'No comments'

    await supabase.from('ratings').insert({
      job_id: job.id,
      rater_user_id: currentUserId,
      rated_user_id: targetUserId,
      rater_role: currentUserRole,
      score,
      tags: selectedTags,
      review_text: finalReview,
    })

    setSubmitting(false)
    setSuccess(true)
    if (onRatingSubmitted) onRatingSubmitted(score, finalReview)
    setTimeout(() => {
      onClose()
    }, 1500)
  }

  const modalContent = (
    <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div
        className={`rounded-2xl max-w-md w-full p-5 sm:p-7 shadow-2xl space-y-4 border my-auto max-h-[90vh] overflow-y-auto ${
          isDark
            ? 'bg-[#12151b] border-white/[0.08] text-white shadow-[0_0_40px_rgba(0,0,0,0.8)]'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className={`flex justify-between items-start border-b pb-3 ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl text-yellow-400">★</span>
              <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {currentUserRole === 'household' ? 'Rate Worker' : 'Rate Customer'}
              </h3>
            </div>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{job.title}</p>
          </div>
          <button
            onClick={onClose}
            className={`font-bold text-lg ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center text-emerald-400 bg-emerald-950/60 rounded-xl font-bold text-sm border border-emerald-500/40 space-y-1">
            <div>✓ Rating & Review Saved!</div>
            <p className="text-xs text-emerald-300 font-normal">
              Thank you for sharing your feedback.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star Rating */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {currentUserRole === 'household' ? 'How was the service?' : 'How was the customer experience?'}
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setScore(star)}
                    className={`text-3xl transition-transform hover:scale-125 focus:outline-none ${
                      star <= score ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : isDark ? 'text-slate-700' : 'text-slate-200'
                    }`}
                  >
                    ★
                  </button>
                ))}
                <span className="text-xs font-bold text-yellow-400 ml-2">{score} / 5</span>
              </div>
            </div>

            {/* Badges / Tags */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                What went well?
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 text-xs rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                          : isDark
                          ? 'bg-[#161a22] border-white/[0.08] text-slate-400 hover:text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Written Review */}
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Write a quick review
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={3}
                placeholder={
                  currentUserRole === 'household'
                    ? 'Tell us about the worker and service quality...'
                    : 'Tell us about your work experience at this household...'
                }
                className={`w-full p-3 border rounded-xl text-xs outline-none transition-all ${
                  isDark
                    ? 'bg-[#161a22] border-white/[0.08] text-white placeholder-slate-500 focus:border-[#ff6b00]'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-[#ff6b00]'
                }`}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border ${
                  isDark ? 'border-white/[0.08] text-slate-400 hover:text-white' : 'border-slate-200 text-slate-600'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 flow-btn-primary text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Submit Rating'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
