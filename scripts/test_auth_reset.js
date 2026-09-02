/**
 * Automated Test Suite for Forgot Password Flow & Resend Integration
 */

import {
  requestPasswordReset,
  verifyResetPin,
  createVerificationToken,
  verifyVerificationToken,
  resetPasswordWithToken,
} from '../src/lib/authResetService.js'

async function runTests() {
  console.log('🧪 Starting Forgot Password & Security Verification Suite...\n')

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

  // TEST 1: Request Password Reset PIN
  console.log('1. Testing Password Reset Request (Step 1)...')
  const req1 = await requestPasswordReset('ramesh.worker@sahakar.in')
  assert(req1.success === true, 'Successfully requested PIN for valid email')
  assert(typeof req1.demoPin === 'string' && req1.demoPin.length === 4, 'Generated a 4-digit PIN code')
  const pin1 = req1.demoPin

  // TEST 2: Anti-Enumeration for non-registered email
  console.log('\n2. Testing User Enumeration Prevention...')
  const reqUnknown = await requestPasswordReset('unknown.user999@random.com')
  assert(reqUnknown.success === true, 'Returns generic success for non-registered email to prevent enumeration')
  assert(reqUnknown.message.includes('If this email is registered'), 'Generic response message returned')

  // TEST 3: Rate Limiting Enforcement
  console.log('\n3. Testing Rate Limiting (Max 3 PINs / 15 min)...')
  const req2 = await requestPasswordReset('ramesh.worker@sahakar.in')
  const req3 = await requestPasswordReset('ramesh.worker@sahakar.in')
  const req4 = await requestPasswordReset('ramesh.worker@sahakar.in') // 4th request should trigger rate limit
  assert(req4.success === false && req4.rateLimited === true, 'Rate limiter blocks 4th request within 15 minutes')
  console.log(`  ℹ️ Rate limit message: "${req4.error}"`)

  // TEST 4: Invalid PIN Code Verification
  console.log('\n4. Testing PIN Verification with Invalid PIN (Step 2)...')
  const invalidPinResult = await verifyResetPin('ramesh.worker@sahakar.in', '0000')
  assert(invalidPinResult.success === false, 'Rejects incorrect PIN code')

  // TEST 5: Valid PIN Code Verification & Signed Token Generation
  console.log('\n5. Testing Valid PIN Verification & Cryptographic Token...')
  const validPinResult = await verifyResetPin('ramesh.worker@sahakar.in', req3.demoPin || pin1)
  assert(validPinResult.success === true, 'Accepts valid 4-digit PIN code')
  assert(typeof validPinResult.verificationToken === 'string' && validPinResult.verificationToken.includes('.'), 'Issues signed cryptographic token')
  const token = validPinResult.verificationToken

  // TEST 6: Single-Use PIN Code Enforcement
  console.log('\n6. Testing Single-Use PIN Invalidation...')
  const reusePinResult = await verifyResetPin('ramesh.worker@sahakar.in', req3.demoPin || pin1)
  assert(reusePinResult.success === false, 'Prevents re-use of already consumed PIN code')

  // TEST 7: Cryptographic Token Verification
  console.log('\n7. Testing Token Verification...')
  const tokenCheck = await verifyVerificationToken(token)
  assert(tokenCheck.valid === true, 'Cryptographic token signature verified')
  assert(tokenCheck.email === 'ramesh.worker@sahakar.in', 'Extracted verified email matches target user')

  // TEST 8: Password Reset Validation & Update (Step 3)
  console.log('\n8. Testing Password Reset Update (Step 3)...')
  const shortPassResult = await resetPasswordWithToken(token, 'short', 'short')
  assert(shortPassResult.success === false, 'Rejects passwords shorter than 8 characters')

  const mismatchPassResult = await resetPasswordWithToken(token, 'newPassword123!', 'mismatchedPass123!')
  assert(mismatchPassResult.success === false, 'Rejects mismatched confirm password')

  const successResetResult = await resetPasswordWithToken(token, 'newPassword123!', 'newPassword123!')
  assert(successResetResult.success === true, 'Successfully updates password via Supabase Auth')

  // TEST 9: Token Replay Prevention
  console.log('\n9. Testing Token Replay Prevention...')
  const replayResetResult = await resetPasswordWithToken(token, 'anotherPass123!', 'anotherPass123!')
  assert(replayResetResult.success === false, 'Prevents token replay after password reset')

  console.log(`\n========================================`)
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`)
  console.log(`========================================\n`)

  if (failed > 0) {
    process.exit(1)
  }
}

runTests().catch((err) => {
  console.error('Test suite crashed:', err)
  process.exit(1)
})
