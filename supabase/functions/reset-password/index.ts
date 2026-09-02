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

    const { email, resetToken, newPassword } = await req.json()
    const sanitizedEmail = (email || "").trim().toLowerCase()
    const sanitizedToken = (resetToken || "").trim()

    // 1. Validate inputs
    if (!sanitizedEmail || !sanitizedToken) {
      return new Response(
        JSON.stringify({ error: "Missing email or reset verification token." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // 2. Enforce server-side password security rules (Min 8 chars)
    if (!newPassword || newPassword.length < 8) {
      return new Response(
        JSON.stringify({
          error: "Password must be at least 8 characters long for security compliance.",
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

    // 3. Server-side token validation: lookup row in password_reset_codes
    const { data: rows, error: queryError } = await supabaseAdmin
      .from("password_reset_codes")
      .select("*")
      .eq("email", sanitizedEmail)
      .eq("reset_token", sanitizedToken)
      .eq("token_used", false)
      .order("created_at", { ascending: false })
      .limit(1)

    if (queryError) {
      console.error("[reset-password] Token verification query error:", queryError)
      return new Response(
        JSON.stringify({ error: "Database error during token validation." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    const tokenRow = rows && rows.length > 0 ? rows[0] : null

    if (!tokenRow) {
      return new Response(
        JSON.stringify({
          error: "Invalid or already used verification token. Please restart password reset.",
          code: "INVALID_TOKEN",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Check token expiration (15 minutes)
    const isTokenExpired =
      !tokenRow.token_expires_at ||
      new Date(tokenRow.token_expires_at).getTime() < Date.now()

    if (isTokenExpired) {
      return new Response(
        JSON.stringify({
          error: "Reset session has expired. Please request a new PIN code.",
          code: "EXPIRED_TOKEN",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // 4. Invalidate the reset token immediately to prevent replay attacks
    await supabaseAdmin
      .from("password_reset_codes")
      .update({ token_used: true })
      .eq("id", tokenRow.id)

    // 5. Lookup user ID in Supabase Auth
    const { data: userData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    if (listError) {
      console.error("[reset-password] Error looking up user in auth:", listError)
      return new Response(
        JSON.stringify({ error: "Authentication service lookup failed." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    const targetUser = userData?.users?.find(
      (u) => u.email?.toLowerCase() === sanitizedEmail
    )

    if (!targetUser) {
      return new Response(
        JSON.stringify({ error: "User account not found." }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // 6. Update user's password via Supabase Auth Admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUser.id,
      { password: newPassword }
    )

    if (updateError) {
      console.error("[reset-password] updateUserById error:", updateError)
      return new Response(
        JSON.stringify({ error: updateError.message || "Failed to update password." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    console.log(`[reset-password] Password successfully reset for: ${sanitizedEmail}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: "Your password has been reset successfully. You can now log in.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  } catch (err: any) {
    console.error("[reset-password] Unexpected error:", err)
    return new Response(
      JSON.stringify({ error: "Internal server error occurred while resetting password." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
