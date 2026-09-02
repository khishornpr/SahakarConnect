import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req: Request) => {
  // Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const { email, pin } = await req.json()
    const sanitizedEmail = (email || "").trim().toLowerCase()
    const sanitizedPin = (pin || "").toString().trim()

    if (!sanitizedEmail || !sanitizedPin) {
      return new Response(
        JSON.stringify({
          error: "Email address and 4-digit PIN are required.",
          canResend: true,
          verified: false,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Initialize Supabase Admin Client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Lookup most recent unused PIN row for this email
    const { data: rows, error: queryError } = await supabaseAdmin
      .from("password_reset_codes")
      .select("*")
      .eq("email", sanitizedEmail)
      .eq("used", false)
      .order("created_at", { ascending: false })
      .limit(1)

    if (queryError) {
      console.error("[verify-pin] Query error:", queryError)
      return new Response(
        JSON.stringify({
          error: "Database error during PIN verification.",
          canResend: true,
          verified: false,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    const resetRow = rows && rows.length > 0 ? rows[0] : null

    // Check row existence
    if (!resetRow) {
      return new Response(
        JSON.stringify({
          error: "No active verification code found for this email. Please request a new code.",
          canResend: true,
          verified: false,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Check expiration
    const isExpired = new Date(resetRow.expires_at).getTime() < Date.now()
    if (isExpired) {
      return new Response(
        JSON.stringify({
          error: "This 4-digit PIN has expired. Please request a new code.",
          canResend: true,
          verified: false,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Check PIN match
    if (resetRow.pin_code !== sanitizedPin) {
      return new Response(
        JSON.stringify({
          error: "Invalid PIN code. Please check your email and try again.",
          canResend: false,
          verified: false,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // PIN is valid! Generate a cryptographically strong UUID verification token (15-minute expiry)
    const resetToken = crypto.randomUUID()
    const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

    // Mark PIN row as used and attach the resetToken
    const { error: updateError } = await supabaseAdmin
      .from("password_reset_codes")
      .update({
        used: true,
        reset_token: resetToken,
        token_expires_at: tokenExpiresAt,
        token_used: false,
      })
      .eq("id", resetRow.id)

    if (updateError) {
      console.error("[verify-pin] Update error:", updateError)
      return new Response(
        JSON.stringify({
          error: "Failed to issue verification token.",
          canResend: true,
          verified: false,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    return new Response(
      JSON.stringify({
        verified: true,
        resetToken,
        email: sanitizedEmail,
        message: "PIN verified successfully.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  } catch (err: any) {
    console.error("[verify-pin] Unexpected error:", err)
    return new Response(
      JSON.stringify({
        error: "Internal server error during verification.",
        canResend: true,
        verified: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
