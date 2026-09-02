/**
 * SahakarConnect Email Service via Resend (https://resend.com)
 * Reusable utility for sending transactional verification emails, PINs, and security notices.
 */

import { Resend } from 'resend'

// Retrieve API Key from environment (supports Vite import.meta.env and Node process.env)
const getResendApiKey = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RESEND_API_KEY) {
    return import.meta.env.VITE_RESEND_API_KEY
  }
  if (typeof process !== 'undefined' && process.env?.RESEND_API_KEY) {
    return process.env.RESEND_API_KEY
  }
  return null
}

const getFromEmail = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RESEND_FROM_EMAIL) {
    return import.meta.env.VITE_RESEND_FROM_EMAIL
  }
  if (typeof process !== 'undefined' && process.env?.RESEND_FROM_EMAIL) {
    return process.env.RESEND_FROM_EMAIL
  }
  return 'SahakarConnect Security <onboarding@resend.dev>'
}

/**
 * Generates responsive, luxury dark-themed HTML email template for 4-digit PIN verification
 */
export const generatePasswordResetEmailHtml = ({ pinCode, expiryMinutes = 10, email }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your SahakarConnect Password Reset PIN</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0b0d11;
      color: #f1f5f9;
    }
    .email-container {
      max-width: 560px;
      margin: 40px auto;
      background: #12151b;
      border: 1px solid rgba(255, 107, 0, 0.3);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.8), 0 0 30px rgba(255, 107, 0, 0.15);
    }
    .header {
      background: linear-gradient(135deg, #181c24 0%, #0f1217 100%);
      padding: 32px 36px 24px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .brand-pill {
      display: inline-block;
      padding: 4px 14px;
      background: rgba(255, 107, 0, 0.12);
      border: 1px solid rgba(255, 107, 0, 0.4);
      color: #ff8c1a;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .brand-title {
      color: #ffffff;
      font-size: 24px;
      font-weight: 800;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 36px 36px 32px;
      text-align: center;
    }
    .intro-title {
      font-size: 20px;
      font-weight: 700;
      color: #f8fafc;
      margin-top: 0;
      margin-bottom: 8px;
    }
    .intro-text {
      color: #94a3b8;
      font-size: 14px;
      line-height: 1.6;
      margin: 0 0 28px;
    }
    .pin-box {
      background: linear-gradient(135deg, #1c202a 0%, #151820 100%);
      border: 2px solid #ff7a00;
      border-radius: 16px;
      padding: 24px;
      margin: 0 auto 28px;
      display: inline-block;
      min-width: 220px;
      box-shadow: 0 0 25px rgba(255, 107, 0, 0.35), inset 0 0 15px rgba(255, 107, 0, 0.1);
    }
    .pin-number {
      font-family: 'Courier New', Courier, monospace;
      font-size: 40px;
      font-weight: 900;
      letter-spacing: 14px;
      color: #ffffff;
      margin-right: -14px;
      text-shadow: 0 0 10px rgba(255, 140, 26, 0.8);
    }
    .expiry-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #f59e0b;
      font-size: 13px;
      font-weight: 600;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      padding: 6px 14px;
      border-radius: 8px;
      margin-bottom: 24px;
    }
    .security-notice {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 16px;
      text-align: left;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.5;
    }
    .footer {
      padding: 20px 36px;
      background: #0d0f14;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 11px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="brand-pill">⚡ SahakarConnect Security</div>
      <h1 class="brand-title">सहकार कनेक्ट • Password Reset</h1>
    </div>
    <div class="content">
      <h2 class="intro-title">Your 4-Digit Verification Code</h2>
      <p class="intro-text">
        We received a request to reset the password for your account (<strong>${email}</strong>). Use the 4-digit PIN below to complete the verification step:
      </p>

      <div class="pin-box">
        <div class="pin-number">${pinCode}</div>
      </div>

      <div class="expiry-badge">
        ⏱️ Valid for <strong>${expiryMinutes} minutes</strong> only
      </div>

      <div class="security-notice">
        <strong>🔒 Security Notice:</strong>
        Never share this code with anyone. SahakarConnect staff and cooperative admins will never ask for your PIN. If you did not request this password reset, your account is still secure and you can safely ignore this email.
      </div>
    </div>
    <div class="footer">
      © 2026 SahakarConnect • SIH26089 Cooperative Digital Service Marketplace<br>
      Automated Security Notification • Please do not reply directly to this email
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Core reusable email-sending utility function
 * Sends transactional email via Resend SDK with automatic fallback simulation
 */
export async function sendPasswordResetPinEmail({ to, pinCode, expiryMinutes = 10 }) {
  const apiKey = getResendApiKey()
  const from = getFromEmail()
  const html = generatePasswordResetEmailHtml({ pinCode, expiryMinutes, email: to })

  // Check if a real Resend API key is provided
  const isRealApiKey =
    apiKey &&
    apiKey.startsWith('re_') &&
    apiKey !== 're_your_resend_api_key_here' &&
    apiKey.length > 10

  if (isRealApiKey) {
    try {
      const resend = new Resend(apiKey)
      const data = await resend.emails.send({
        from: from || 'SahakarConnect Security <onboarding@resend.dev>',
        to: [to],
        subject: `[${pinCode}] Your SahakarConnect Password Reset Code`,
        html,
      })

      return {
        success: true,
        data,
        simulated: false,
        message: 'Email delivered successfully via Resend',
      }
    } catch (err) {
      console.error('[Resend Email Error]', err)
      return {
        success: false,
        error: err.message || 'Failed to dispatch email via Resend',
        simulated: false,
      }
    }
  }

  // Development / Demo Simulation Fallback
  // (Displays exact code & template in console when live Resend API key is pending)
  console.log('\n================== ✉️ RESEND EMAIL DISPATCH (SIMULATION) ==================')
  console.log(`To: ${to}`)
  console.log(`From: ${from}`)
  console.log(`Subject: [${pinCode}] Your SahakarConnect Password Reset Code`)
  console.log(`4-Digit PIN Code: >>> ${pinCode} <<<`)
  console.log(`Expires In: ${expiryMinutes} minutes`)
  console.log('To send real emails to your inbox, set RESEND_API_KEY in .env.local')
  console.log('===========================================================================\n')

  return {
    success: true,
    simulated: true,
    data: { id: 'sim_' + Math.random().toString(36).substring(2, 10) },
    message: 'Simulated email logged to console (Configure RESEND_API_KEY in .env.local for live delivery)',
  }
}
