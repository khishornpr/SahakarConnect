/**
 * Automated Test Suite for Supabase Edge Functions Password Reset Lifecycle
 */

import { supabase } from '../src/lib/supabase.js'

async function runEdgeFunctionTests() {
  console.log('🧪 Starting Supabase Edge Functions Password Reset Tests...\n')

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

  const testEmail = 'ramesh.worker@sahakar.in'

  // TEST 1: Request Password Reset via 'forgot-password'
  console.log('1. Testing "forgot-password" Edge Function...')
  const { data: step1Data, error: step1Error } = await supabase.functions.invoke('forgot-password', {
    body: { email: testEmail },
  })

  assert(!step1Error, 'forgot-password executed without error')
  assert(
    step1Data?.message === 'If this email is registered, a code has been sent.',
    'Returns generic anti-enumeration response message'
  )
  assert(step1Data?.pinCode !== undefined, 'Generated 4-digit PIN code')
  const pin = step1Data?.pinCode

  // TEST 2: Anti-Enumeration with Unknown Email
  console.log('\n2. Testing Anti-Enumeration for non-registered email...')
  const { data: anonData, error: anonError } = await supabase.functions.invoke('forgot-password', {
    body: { email: 'unknown.stranger@random.org' },
  })

  assert(!anonError, 'Non-registered email request succeeded without error')
  assert(
    anonData?.message === 'If this email is registered, a code has been sent.',
    'Returns identical generic message for unregistered emails'
  )

  // TEST 3: Verify PIN with Invalid Code via 'verify-pin'
  console.log('\n3. Testing "verify-pin" with incorrect PIN...')
  const { data: invalidPinData, error: invalidPinError } = await supabase.functions.invoke('verify-pin', {
    body: { email: testEmail, pin: '0000' },
  })

  assert(invalidPinError !== null || invalidPinData?.verified === false, 'Rejects invalid 4-digit PIN')

  // TEST 4: Verify PIN with Valid Code via 'verify-pin'
  console.log('\n4. Testing "verify-pin" with correct PIN...')
  const { data: validPinData, error: validPinError } = await supabase.functions.invoke('verify-pin', {
    body: { email: testEmail, pin },
  })

  assert(!validPinError, 'verify-pin succeeded with correct PIN')
  assert(validPinData?.verified === true, 'Returned verified: true')
  assert(typeof validPinData?.resetToken === 'string' && validPinData.resetToken.length > 10, 'Issued signed resetToken')
  const resetToken = validPinData?.resetToken

  // TEST 5: Single-Use PIN Invalidation (Cannot re-use same PIN)
  console.log('\n5. Testing Single-Use PIN Invalidation...')
  const { data: reuseData, error: reuseError } = await supabase.functions.invoke('verify-pin', {
    body: { email: testEmail, pin },
  })
  assert(reuseError !== null || reuseData?.verified === false, 'Cannot re-use already verified PIN')

  // TEST 6: Reset Password with Weak Password via 'reset-password'
  console.log('\n6. Testing server-side password validation (min 8 chars)...')
  const { data: weakData, error: weakError } = await supabase.functions.invoke('reset-password', {
    body: { email: testEmail, resetToken, newPassword: '123' },
  })
  assert(weakError !== null || weakData?.success === false, 'Rejects passwords shorter than 8 characters')

  // TEST 7: Reset Password with Valid New Password via 'reset-password'
  console.log('\n7. Testing "reset-password" with valid token and password...')
  const newSecretPassword = `NewStrongPass!${Date.now()}`
  const { data: resetSuccessData, error: resetSuccessError } = await supabase.functions.invoke('reset-password', {
    body: { email: testEmail, resetToken, newPassword: newSecretPassword },
  })

  assert(!resetSuccessError, 'reset-password executed successfully')
  assert(resetSuccessData?.success === true, 'Password reset confirmed by Edge Function')

  // TEST 8: Token Replay Prevention
  console.log('\n8. Testing Token Replay Prevention...')
  const { data: replayData, error: replayError } = await supabase.functions.invoke('reset-password', {
    body: { email: testEmail, resetToken, newPassword: 'AnotherPassword999!' },
  })
  assert(replayError !== null || replayData?.success === false, 'Token replay rejected after password reset')

  console.log(`\n========================================`)
  console.log(`Edge Function Tests: ${passed} Passed, ${failed} Failed`)
  console.log(`========================================\n`)

  if (failed > 0) {
    process.exit(1)
  }
}

runEdgeFunctionTests().catch((err) => {
  console.error('Test suite error:', err)
  process.exit(1)
})
