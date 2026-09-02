/**
 * Automated Test Suite for Supabase Email Verification Lifecycle
 */

import { supabase } from '../src/lib/supabase.js'

async function runEmailVerificationTests() {
  console.log('🧪 Starting Supabase Email Verification Lifecycle Tests...\n')

  let passed = 0
  let failed = 0

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`)
      passed++
    } else {
      console.error(`  ❌ FAIL: ${testName}`)
      failed++
    }
  }

  const testEmail = `artisan.test.${Date.now()}@sahakar.in`
  const testPassword = 'SecurePassword2026!'

  // TEST 1: SignUp with email confirmation required
  console.log('1. Testing User SignUp with Email Confirmation...')
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    role: 'worker',
    fullName: 'Test Artisan',
    options: {
      data: { trade: 'Electrician', area: 'South Extension, New Delhi' },
      emailRedirectTo: 'http://localhost:5173/#/auth/confirm',
    },
  })

  assert(!signUpError, 'SignUp request completed without error')
  assert(signUpData?.user?.email === testEmail, 'User profile created with target email')
  assert(signUpData?.session === null, 'Session is null pending email verification (Not auto-logged in)')

  // TEST 2: Attempting Login Before Email Confirmation
  console.log('\n2. Testing Login Attempt with Unconfirmed Email...')
  const { data: unconfirmedLoginData, error: unconfirmedLoginError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  })

  assert(unconfirmedLoginData === null, 'Login is blocked for unconfirmed user')
  assert(
    unconfirmedLoginError && unconfirmedLoginError.message.toLowerCase().includes('not confirmed'),
    'Returns "Email not confirmed" error message to user'
  )

  // TEST 3: Resending Verification Email
  console.log('\n3. Testing Resend Verification Email...')
  const { data: resendData, error: resendError } = await supabase.auth.resend({
    type: 'signup',
    email: testEmail,
  })
  assert(!resendError, 'Resend verification API call succeeded')
  assert(resendData?.message !== undefined, 'Received confirmation message')

  // TEST 4: Email Confirmation via Token Verification
  console.log('\n4. Testing Email Confirmation Verification (verifyOtp)...')
  const { data: confirmData, error: confirmError } = await supabase.auth.verifyOtp({
    email: testEmail,
    type: 'signup',
  })

  assert(!confirmError, 'Email confirmation succeeded without error')
  assert(confirmData?.session !== null, 'Active authenticated session established upon confirmation')
  assert(confirmData?.user?.email === testEmail, 'Confirmed user email matches target')

  // TEST 5: Login After Successful Confirmation
  console.log('\n5. Testing Login Attempt After Email Confirmation...')
  const { data: verifiedLoginData, error: verifiedLoginError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  })

  assert(!verifiedLoginError, 'Login succeeds after email confirmation')
  assert(verifiedLoginData?.user?.email === testEmail, 'Authenticated user session created')

  console.log(`\n========================================`)
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`)
  console.log(`========================================\n`)

  if (failed > 0) {
    process.exit(1)
  }
}

runEmailVerificationTests().catch((err) => {
  console.error('Test suite error:', err)
  process.exit(1)
})
