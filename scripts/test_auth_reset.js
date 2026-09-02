/**
 * Automated Test Suite for Forgot Password Flow via Supabase Client
 */

import {
  requestPasswordReset,
  verifyResetPin,
  resetPasswordWithToken,
} from '../src/lib/authResetService.js'

async function runTests() {
  console.log('🧪 Starting Forgot Password Client Service Suite...\n')

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

  // TEST 1: Request Password Reset with invalid email
  console.log('1. Testing Validation with Invalid Email...')
  const reqInvalid = await requestPasswordReset('not-an-email')
  assert(reqInvalid.success === false, 'Rejects invalid email format')

  // TEST 2: Verify PIN with empty inputs
  console.log('\n2. Testing PIN Verification with empty inputs...')
  const emptyPinResult = await verifyResetPin('ramesh.worker@sahakar.in', '')
  assert(emptyPinResult.success === false, 'Rejects empty PIN code')

  // TEST 3: Password Reset Validation (Short password)
  console.log('\n3. Testing Password Reset Validation (min 8 chars)...')
  const shortPassResult = await resetPasswordWithToken('dummy-token', 'short', 'short', 'ramesh.worker@sahakar.in')
  assert(shortPassResult.success === false, 'Rejects passwords shorter than 8 characters')

  // TEST 4: Password Reset Validation (Mismatched password)
  console.log('\n4. Testing Password Reset Validation (Password mismatch)...')
  const mismatchPassResult = await resetPasswordWithToken('dummy-token', 'newPassword123!', 'mismatchedPass123!', 'ramesh.worker@sahakar.in')
  assert(mismatchPassResult.success === false, 'Rejects mismatched confirm password')

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
