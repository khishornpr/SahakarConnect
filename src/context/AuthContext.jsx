import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }

  async function signUp(email, password, role = 'worker', fullName = '', extra = {}) {
    const redirectUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/#/auth/confirm`
        : undefined

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          full_name: fullName,
          ...extra,
        },
        emailRedirectTo: redirectUrl,
      },
    })
    if (error) return { error }

    // If email confirmation is enabled in Supabase, session is null until user confirms email
    const needsConfirmation = data?.user && !data?.session

    if (data?.session && data?.user) {
      setUser(data.user)
      await fetchProfile(data.user.id)
    }

    return { data, needsConfirmation }
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      const isUnconfirmed =
        error.message?.toLowerCase().includes('email not confirmed') ||
        error.message?.toLowerCase().includes('email_not_confirmed')
      return { data: null, error, isUnconfirmed }
    }

    if (data?.user) {
      setUser(data.user)
      await fetchProfile(data.user.id)
    }
    return { data, error: null }
  }

  async function resendVerification(email) {
    const redirectUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/#/auth/confirm`
        : undefined

    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    })
    return { data, error }
  }

  async function verifyConfirmationToken(params) {
    const { data, error } = await supabase.auth.verifyOtp(params)
    if (!error && data?.user) {
      setUser(data.user)
      await fetchProfile(data.user.id)
    }
    return { data, error }
  }

  async function switchDemoRole(roleEmail) {
    return signIn(roleEmail, 'demo123')
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        resendVerification,
        verifyConfirmationToken,
        switchDemoRole,
        refreshProfile: () => user && fetchProfile(user.id),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
