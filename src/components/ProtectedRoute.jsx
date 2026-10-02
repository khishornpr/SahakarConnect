import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../context/I18nContext'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuth()
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600 font-bold">{t('loadingEllipsis', 'Loading...')}</div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" />

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/unauthorized" />
  }

  return children
}
