import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8"
import { corsHeaders } from "../_shared/cors.ts"

const GENERIC_RESPONSE = {
  message: "If this email is registered, a code has been sent.",
}

serve(async (req: Request) => {
  // Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Only allow POST
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const { email } = await req.json()
    const sanitizedEmail = (email || "").trim().toLowerCase()

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!sanitizedEmail || !emailRegex.test(sanitizedEmail)) {
      return new Response(
        JSON.stringify({ error: "Please provide a valid email address." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Initialize Supabase Admin Client with Service Role Key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Check if user exists in Supabase Auth
    const { data: userData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    if (listError) {
      console.error("[forgot-password] Error querying users:", listError)
    }

    const userExists = userData?.users?.some(
      (u) => u.email?.toLowerCase() === sanitizedEmail
    )

    // 2. Check Rate Limiting (Max 3 PIN requests per email per 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()
    const { data: recentCodes, error: countError } = await supabaseAdmin
      .from("password_reset_codes")
      .select("id")
      .eq("email", sanitizedEmail)
      .gte("created_at", fifteenMinutesAgo)

    if (countError) {
      console.error("[forgot-password] Rate limit check error:", countError)
    }

    const isRateLimited = (recentCodes?.length || 0) >= 3

    if (isRateLimited) {
      console.warn(`[forgot-password] Rate limit exceeded for email: ${sanitizedEmail}`)
      // Return generic response without revealing rate limit status
      return new Response(JSON.stringify(GENERIC_RESPONSE), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // 3. If user exists and is not rate-limited, generate PIN & send email
    if (userExists) {
      // Generate 4-digit PIN (1000 - 9999)
      const pinCode = Math.floor(1000 + Math.random() * 9000).toString()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes

      // Insert row into password_reset_codes
      const { error: insertError } = await supabaseAdmin
        .from("password_reset_codes")
        .insert({
          email: sanitizedEmail,
          pin_code: pinCode,
          expires_at: expiresAt,
          used: false,
          token_used: false,
        })

      if (insertError) {
        console.error("[forgot-password] Database insert error:", insertError)
        return new Response(JSON.stringify(GENERIC_RESPONSE), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      // 4. Dispatch Email via Resend
      const resendApiKey = Deno.env.get("RESEND_API_KEY")
      if (resendApiKey) {
        try {
          const resendResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "SahakarConnect Security <onboarding@resend.dev>",
              to: [sanitizedEmail],
              subject: `[${pinCode}] Your SahakarConnect Password Reset Code`,
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <style>
                    body { background-color: #0b0d11; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; }
                    .card { max-width: 500px; margin: 20px auto; background: #12151b; border: 1px solid rgba(255, 107, 0, 0.3); border-radius: 20px; padding: 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.8); text-align: center; }
                    .badge { display: inline-block; padding: 4px 14px; background: rgba(255, 107, 0, 0.15); border: 1px solid rgba(255, 107, 0, 0.4); color: #ff8c1a; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; }
                    .pin-box { margin: 24px auto; padding: 18px 24px; background: rgba(255, 107, 0, 0.08); border: 2px dashed rgba(255, 107, 0, 0.5); border-radius: 14px; display: inline-block; }
                    .pin-code { font-family: 'Courier New', monospace; font-size: 36px; font-weight: 900; letter-spacing: 12px; color: #ff8c1a; }
                    .footer { font-size: 11px; color: #64748b; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="badge">⚡ SahakarConnect Security</div>
                    <h2 style="color:#ffffff; margin: 0 0 8px;">Password Reset Request</h2>
                    <p style="color:#94a3b8; font-size: 13px; line-height: 1.5; margin: 0;">We received a request to reset the password for your account. Use the 4-digit code below to proceed:</p>
                    
                    <div class="pin-box">
                      <div class="pin-code">${pinCode}</div>
                    </div>

                    <p style="color:#e2e8f0; font-size: 12px; margin: 0;">⏳ This verification code expires in <strong>10 minutes</strong>.</p>
                    
                    <div class="footer">
                      If you did not request a password reset, please ignore this email or contact support.<br>
                      © 2026 SahakarConnect • Ministry of Cooperation & Labour Federations
                    </div>
                  </div>
                </body>
                </html>
              `,
            }),
          })

          if (!resendResponse.ok) {
            const errorText = await resendResponse.text()
            console.error("[forgot-password] Resend API error response:", errorText)
          } else {
            console.log(`[forgot-password] Successfully sent PIN to: ${sanitizedEmail}`)
          }
        } catch (resendErr) {
          console.error("[forgot-password] Resend dispatch error:", resendErr)
        }
      } else {
        console.warn(`[forgot-password] RESEND_API_KEY is not configured in Supabase Secrets. (Generated PIN for ${sanitizedEmail}: ${pinCode})`)
      }
    } else {
      console.log(`[forgot-password] Non-registered email requested reset: ${sanitizedEmail}`)
    }

    // Always return generic response to prevent user enumeration
    return new Response(JSON.stringify(GENERIC_RESPONSE), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (err: any) {
    console.error("[forgot-password] Unexpected server error:", err)
    return new Response(JSON.stringify(GENERIC_RESPONSE), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
