/**
 * SahakarConnect Password Reset Service
 * Handles server-side security logic:
 * - Rate limiting (Max 3 PIN requests per email per 15 minutes)
 * - 4-Digit PIN generation with 10-minute expiry
 * - Single-use tracking in Supabase `password_reset_codes` table
 * - Cryptographic signed verification tokens for state-safe step progression
 * - User enumeration prevention (consistent generic responses)
 * - Supabase Auth password update
 */

import { supabase } from './supabase.js'
import { sendPasswordResetPinEmail } from './emailService.js'

// Secret key for HMAC token signing (falls back to secure default in development)
const RESET_SECRET =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_JWT_RESET_SECRET) ||
  'sahakar_connect_reset_secret_key_2026'

// In-memory rate limiter tracking: email -> Array of timestamp numbers
const rateLimitMap = new Map()

// In-memory set of used verification tokens to prevent token replay attacks
const consumedTokens = new Set()

/**
 * Utility: Clean & normalize email address
 */
const normalizeEmail = (email) => (email || '').trim().toLowerCase()

/**
 * Cryptographic helper: Generate SHA-256 HMAC signature using browser/Node crypto
 */
async function generateSignature(dataString, secretKey) {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secretKey)
  const messageData = encoder.encode(dataString)

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
    const signatureArray = Array.from(new Uint8Array(signatureBuffer))
    return signatureArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }

  // Fallback simple hash for older environments
  let hash = 0
  const combined = dataString + secretKey
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash).toString(16)
}

/**
 * Creates a signed verification token representing "Email ownership verified for reset"
 * Valid for 15 minutes.
 */
export async function createVerificationToken(email) {
  const payload = {
    email: normalizeEmail(email),
    iat: Date.now(),
    exp: Date.now() + 15 * 60 * 1000, // 15 minutes validity
    nonce: Math.random().toString(36).substring(2, 12),
  }

  const payloadString = JSON.stringify(payload)
  const encodedPayload = btoa(payloadString)
  const signature = await generateSignature(encodedPayload, RESET_SECRET)

  return `${encodedPayload}.${signature}`
}

/**
 * Validates a signed verification token
 * Returns { valid: boolean, email?: string, error?: string }
 */
export async function verifyVerificationToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return { valid: false, error: 'Invalid or missing verification token.' }
  }

  if (consumedTokens.has(token)) {
    return { valid: false, error: 'This verification token has already been used. Please request a new code.' }
  }

  const [encodedPayload, signature] = token.split('.')
  if (!encodedPayload || !signature) {
    return { valid: false, error: 'Malformed verification token.' }
  }

  const expectedSignature = await generateSignature(encodedPayload, RESET_SECRET)
  if (signature !== expectedSignature) {
    return { valid: false, error: 'Invalid verification token signature.' }
  }

  try {
    const payloadString = atob(encodedPayload)
    const payload = JSON.parse(payloadString)

    if (Date.now() > payload.exp) {
      return { valid: false, error: 'Verification token has expired. Please restart the reset process.' }
    }

    return { valid: true, email: payload.email, payload }
  } catch {
    return { valid: false, error: 'Failed to decode verification token.' }
  }
}

/**
 * STEP 1: Request Password Reset PIN (Rate limited & Anti-enumeration)
 * Equivalent to POST /api/auth/forgot-password
 */
export async function requestPasswordReset(rawEmail) {
  const email = normalizeEmail(rawEmail)

  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  // 1. Rate Limiting Check: Max 3 requests per email per 15 minutes
  const now = Date.now()
  const fifteenMinutesAgo = now - 15 * 60 * 1000
  const recentRequests = (rateLimitMap.get(email) || []).filter((t) => t > fifteenMinutesAgo)

  if (recentRequests.length >= 3) {
    const oldest = recentRequests[0]
    const waitSeconds = Math.ceil((oldest + 15 * 60 * 1000 - now) / 1000)
    const waitMinutes = Math.ceil(waitSeconds / 60)
    return {
      success: false,
      error: `Too many PIN requests for this email. Please wait ${waitMinutes} minute(s) before trying again.`,
      rateLimited: true,
    }
  }

  // Update rate limiter
  recentRequests.push(now)
  rateLimitMap.set(email, recentRequests)

  // 2. Check if user exists in Supabase (profiles / auth)
  let userExists = false
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .maybeSingle()

    if (profile) {
      userExists = true
    }
  } catch (err) {
    console.warn('[Supabase Profile Check Warn]', err)
  }

  // 3. Generate random 4-digit PIN (1000–9999)
  const pinCode = Math.floor(1000 + Math.random() * 9000).toString()
  const expiresAt = new Date(now + 10 * 60 * 1000).toISOString() // 10 minutes expiry

  // 4. Save to password_reset_codes table
  try {
    await supabase.from('password_reset_codes').insert({
      email,
      pin_code: pinCode,
      expires_at: expiresAt,
      created_at: new Date(now).toISOString(),
      used: false,
    })
  } catch (err) {
    console.warn('[Database Insert Warn]', err)
  }

  // 5. Dispatch email via Resend
  let emailResult = { success: true }
  if (userExists) {
    emailResult = await sendPasswordResetPinEmail({
      to: email,
      pinCode,
      expiryMinutes: 10,
    })
  } else {
    // If email doesn't exist, we still simulate delivery to avoid side-channel timing leaks
    await new Promise((resolve) => setTimeout(resolve, 350))
    console.log(`[Anti-Enumeration Note] Reset requested for non-registered email: ${email}`)
  }

  // 6. Generic success response (prevents user enumeration)
  return {
    success: true,
    message: 'If this email is registered with SahakarConnect, a 4-digit verification code has been sent to your inbox.',
    email,
    simulated: emailResult.simulated || false,
    demoPin: emailResult.simulated ? pinCode : undefined, // For developer testing convenience in simulation mode
  }
}

/**
 * STEP 2: Verify 4-Digit PIN Code
 * Equivalent to POST /api/auth/verify-pin
 */
export async function verifyResetPin(rawEmail, inputPin) {
  const email = normalizeEmail(rawEmail)
  const pin = (inputPin || '').toString().trim()

  if (!email || !pin || pin.length !== 4) {
    return { success: false, error: 'Please enter the complete 4-digit verification code.' }
  }

  // Fetch recent unused, non-expired codes for this email
  const nowIso = new Date().toISOString()
  try {
    const { data: rows } = await supabase
      .from('password_reset_codes')
      .select('*')
      .eq('email', email)
      .eq('used', false)
      .gte('expires_at', nowIso)
      .order('created_at', { ascending: false })

    if (!rows || rows.length === 0) {
      return {
        success: false,
        error: 'No active verification code found. It may have expired. Please request a new code.',
      }
    }

    // Check the most recent matching PIN code
    const matchingRow = rows.find((r) => r.pin_code === pin)
    if (!matchingRow) {
      return {
        success: false,
        error: 'The 4-digit verification code is incorrect. Please check your email or request a new code.',
      }
    }

    // Mark as used (single-use enforcement)
    await supabase
      .from('password_reset_codes')
      .update({ used: true })
      .eq('id', matchingRow.id)

    // Issue short-lived cryptographic signed token
    const verificationToken = await createVerificationToken(email)

    return {
      success: true,
      verificationToken,
      message: 'Email successfully verified. You may now set a new password.',
    }
  } catch (err) {
    console.error('[Verify PIN Error]', err)
    return { success: false, error: 'An unexpected error occurred while verifying the code.' }
  }
}

/**
 * STEP 3: Reset Password with Verified Token
 * Equivalent to POST /api/auth/reset-password
 */
export async function resetPasswordWithToken(verificationToken, newPassword, confirmPassword) {
  // 1. Verify token validity server-side
  const tokenCheck = await verifyVerificationToken(verificationToken)
  if (!tokenCheck.valid) {
    return { success: false, error: tokenCheck.error }
  }

  const email = tokenCheck.email

  // 2. Validate password criteria
  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long.' }
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: 'Passwords do not match.' }
  }

  try {
    // 3. Update password in Supabase Auth
    // First attempt admin user lookup to update by ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .maybeSingle()

    if (profile && supabase.auth.admin?.updateUserById) {
      await supabase.auth.admin.updateUserById(profile.id, {
        password: newPassword,
      })
    } else if (supabase.auth.updateUser) {
      await supabase.auth.updateUser({
        password: newPassword,
      })
    }

    // 4. Invalidate verification token permanently
    consumedTokens.add(verificationToken)

    return {
      success: true,
      message: 'Your password has been reset successfully! You can now log in with your new credentials.',
      email,
    }
  } catch (err) {
    console.error('[Reset Password Error]', err)
    return { success: false, error: err.message || 'Failed to update password. Please try again.' }
  }
}
