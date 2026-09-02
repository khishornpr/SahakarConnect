/**
 * SahakarConnect Password Reset Client Service
 * 
 * All security-critical operations (rate limiting, PIN generation,
 * verification token issuance, and password hashing/updating) are
 * delegated to Supabase Edge Functions:
 *  - forgot-password
 *  - verify-pin
 *  - reset-password
 * 
 * No secrets, HMAC signing, or rate-limiting state are stored in the client.
 */

import { supabase } from './supabase.js'

/**
 * Utility: Clean & normalize email address
 */
export const normalizeEmail = (email) => (email || '').trim().toLowerCase()

/**
 * STEP 1: Request Password Reset PIN
 * Invokes the 'forgot-password' Supabase Edge Function (server-side rate limiting & email dispatch)
 */
export async function requestPasswordReset(rawEmail) {
  const email = normalizeEmail(rawEmail)

  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  try {
    const { data, error } = await supabase.functions.invoke('forgot-password', {
      body: { email },
    })

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to dispatch reset code. Please try again.',
      }
    }

    return {
      success: true,
      message: data?.message || 'If this email is registered, a 4-digit verification code has been dispatched.',
      email,
    }
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Network error occurred while requesting password reset.',
    }
  }
}

/**
 * STEP 2: Verify 4-Digit PIN Code
 * Invokes the 'verify-pin' Supabase Edge Function (server-side PIN verification & UUID token issuance)
 */
export async function verifyResetPin(rawEmail, inputPin) {
  const email = normalizeEmail(rawEmail)
  const pin = (inputPin || '').toString().trim()

  if (!email || !pin || pin.length !== 4) {
    return { success: false, error: 'Please enter the complete 4-digit verification code.' }
  }

  try {
    const { data, error } = await supabase.functions.invoke('verify-pin', {
      body: { email, pin },
    })

    if (error || !data?.verified) {
      return {
        success: false,
        error: error?.message || data?.error || 'Invalid or expired PIN code. Please try again.',
        canResend: data?.canResend !== undefined ? data.canResend : true,
      }
    }

    return {
      success: true,
      verificationToken: data.resetToken,
      resetToken: data.resetToken,
      email: data.email || email,
      message: data.message || 'PIN verified successfully.',
    }
  } catch (err) {
    return {
      success: false,
      error: err.message || 'An unexpected error occurred while verifying the code.',
    }
  }
}

/**
 * STEP 3: Reset Password with Verified Token
 * Invokes the 'reset-password' Supabase Edge Function (server-side token validation & Supabase Auth update)
 */
export async function resetPasswordWithToken(verificationToken, newPassword, confirmPassword, email = '') {
  if (!verificationToken) {
    return { success: false, error: 'Missing or invalid verification reset token.' }
  }

  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long.' }
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: 'Passwords do not match.' }
  }

  try {
    const { data, error } = await supabase.functions.invoke('reset-password', {
      body: {
        email: normalizeEmail(email),
        resetToken: verificationToken,
        newPassword,
      },
    })

    if (error || !data?.success) {
      return {
        success: false,
        error: error?.message || data?.error || 'Failed to update password. Reset token may have expired.',
      }
    }

    return {
      success: true,
      message: data.message || 'Your password has been reset successfully! You can now log in.',
      email,
    }
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Failed to update password. Please try again.',
    }
  }
}
