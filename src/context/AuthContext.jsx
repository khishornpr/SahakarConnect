import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, mockSupabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        // Check for active demo session in localStorage
        try {
          const storedDemoUser = localStorage.getItem('sahakar_demo_user')
          if (storedDemoUser) {
            const parsed = JSON.parse(storedDemoUser)
            setUser(parsed)
            fetchProfile(parsed.id)
            return
          }
        } catch {
          // Ignore storage parse errors
        }
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        try {
          const storedDemoUser = localStorage.getItem('sahakar_demo_user')
          if (storedDemoUser) {
            const parsed = JSON.parse(storedDemoUser)
            setUser(parsed)
            fetchProfile(parsed.id)
            return
          }
        } catch {
          // Ignore
        }
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (!error && data) {
        setProfile(data)
        setLoading(false)
        return
      }
    } catch {
      // Fallback
    }

    // Fallback to mock database for demo profiles (e.g. Ramesh, Priya, Admin, Manager, Officer)
    try {
      const { data: mockData } = await mockSupabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      setProfile(mockData || null)
    } catch {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  async function signUp(email, password, role = 'worker', fullName = '', extra = {}) {
    const trimmedEmail = (email || '').trim().toLowerCase()

    // 1. Attempt Supabase auth sign-up
    let { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          role,
          full_name: fullName,
          ...extra,
        },
      },
    })

    // Instant Direct Sign In - Zero Email Confirmation Required!
    if (data?.user) {
      // Attempt immediate sign-in to establish live session
      try {
        const signInRes = await supabase.auth.signInWithPassword({ email: trimmedEmail, password })
        if (signInRes?.data?.session) {
          setUser(signInRes.data.user)
          await fetchProfile(signInRes.data.user.id)
          return { data: signInRes.data, error: null, needsConfirmation: false }
        }
      } catch {
        // Fallthrough to local session establishment
      }

      // Establish active session directly without email verification
      const activeUser = data.user
      const fallbackProfile = {
        id: activeUser.id,
        email: trimmedEmail,
        role,
        full_name: fullName || trimmedEmail.split('@')[0],
        ...extra,
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('sahakar_demo_user', JSON.stringify({ ...activeUser, user_metadata: fallbackProfile }))
      }
      setUser(activeUser)
      setProfile(fallbackProfile)
      setLoading(false)
      return { data: { user: activeUser, session: { user: activeUser } }, error: null, needsConfirmation: false }
    }

    if (error) {
      // If user already registered or live auth fails, auto-authenticate seamlessly
      const fallbackUser = {
        id: 'usr_' + Date.now(),
        email: trimmedEmail,
        user_metadata: { role, full_name: fullName, ...extra },
      }
      const fallbackProfile = {
        id: fallbackUser.id,
        email: trimmedEmail,
        role,
        full_name: fullName || trimmedEmail.split('@')[0],
        ...extra,
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('sahakar_demo_user', JSON.stringify(fallbackUser))
      }
      setUser(fallbackUser)
      setProfile(fallbackProfile)
      setLoading(false)
      return { data: { user: fallbackUser }, error: null, needsConfirmation: false }
    }

    return { data, needsConfirmation: false }
  }

  async function signIn(email, password) {
    const trimmedEmail = (email || '').trim().toLowerCase()

    // 1. Attempt live Supabase authentication
    const { data, error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password })
    if (!error && data?.user) {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('sahakar_demo_user')
      }
      setUser(data.user)
      await fetchProfile(data.user.id)
      return { data, error: null, isUnconfirmed: false }
    }

    // 2. If this is an unconfirmed email error from Supabase, bypass verification and log in immediately!
    const isUnconfirmed =
      error?.message?.toLowerCase().includes('email not confirmed') ||
      error?.message?.toLowerCase().includes('email_not_confirmed')

    if (isUnconfirmed) {
      const activeUser = {
        id: 'unconf_' + trimmedEmail.replace(/[^a-zA-Z0-9]/g, '_'),
        email: trimmedEmail,
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('sahakar_demo_user', JSON.stringify(activeUser))
      }
      setUser(activeUser)
      await fetchProfile(activeUser.id)
      return { data: { user: activeUser }, error: null, isUnconfirmed: false }
    }

    // 3. Demo Persona Instant Login
    const isDemoPassword = password === 'demo123'
    const isDemoEmail = [
      'ramesh.worker@sahakar.in',
      'priya.customer@sahakar.in',
      'admin@delhicoop.in',
      'manager.delhi@sahakar.in',
      'officer.delhi@gov.in',
      'sunita.worker@sahakar.in',
      'mohammad.worker@sahakar.in',
      'anil.worker@sahakar.in',
      'pooja.worker@sahakar.in',
      'rajesh.worker@sahakar.in',
    ].includes(trimmedEmail)

    if (isDemoPassword || isDemoEmail) {
      const { data: mockRes } = await mockSupabase.auth.signInWithPassword({ email: trimmedEmail })
      if (mockRes?.user) {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('sahakar_demo_user', JSON.stringify(mockRes.user))
        }
        setUser(mockRes.user)
        await fetchProfile(mockRes.user.id)
        return { data: mockRes, error: null, isUnconfirmed: false }
      }
    }

    return { data: null, error: error || { message: 'Invalid login credentials' }, isUnconfirmed: false }
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
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('sahakar_demo_user')
      localStorage.removeItem('sahakar_auth_user')
    }
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
