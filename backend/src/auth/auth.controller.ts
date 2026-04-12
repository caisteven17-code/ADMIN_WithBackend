import { Controller, Post, Body, Get, Request } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Protected } from "./protected.decorator";
import { supabase } from "../lib/supabaseClient";

@Controller("api/auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  async login(@Body() body: { email: string; password: string }) {
    // OTP ENABLED - Require OTP verification
    const result = await this.authService.login(body.email, body.password);
    return result;
  }

  @Post("verify-otp")
  async verifyOTP(@Body() body: { email: string; otp: string }) {
    // OTP ENABLED - Verify the OTP and return JWT token
    const result = await this.authService.verifyOTP(body.email, body.otp);
    return result;
  }

  @Post("change-password")
  async changePassword(
    @Request() req: any,
    @Body()
    body: {
      email: string;
      currentPassword: string;
      newPassword: string;
    }
  ) {
    const userEmail = req.user?.email || body.email;
    console.log(`🔐 Change password requested for ${userEmail} (from JWT: ${req.user?.email})`);
    
    const result = await this.authService.changePassword(
      userEmail,
      body.currentPassword,
      body.newPassword
    );
    return result;
  }

  @Post("send-otp")
  async sendOTP(@Body() body: { email: string }) {
    console.log(`\n[SEND-OTP] Resend OTP request for: ${body.email}`);
    
    // OTP ENABLED - Send OTP to email for resend functionality
    // Verify the email exists in Supabase auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.log(`[SEND-OTP] ❌ Error checking auth users: ${authError.message}`);
      return {
        success: false,
        error: "Failed to verify user",
      };
    }

    const user = authUsers.users.find(u => u.email === body.email);

    if (!user) {
      console.log(`[SEND-OTP] ❌ User not found in auth for ${body.email}`);
      return {
        success: false,
        error: "User not found",
      };
    }

    console.log(`[SEND-OTP] ✅ User found: ${user.email}`);

    // Generate OTP
    const otp = this.authService.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log(`[SEND-OTP] Generated OTP: ${otp}`);

    // Delete any previous unused OTPs for this email first (prevents conflicts)
    console.log(`[SEND-OTP] Cleaning up old OTP attempts...`);
    await supabase
      .from("otp_sessions")
      .delete()
      .eq("email", body.email)
      .eq("used", false);

    // Store OTP in database with expires_at_ms column
    let otpError: any = null;
    
    const expiresAtMs = expiresAt.getTime(); // Convert to milliseconds

    const { error: error1 } = await supabase
      .from("otp_sessions")
      .insert({
        email: body.email,
        otp,
        expires_at_ms: expiresAtMs,
        used: false,
        created_at_ms: Date.now(),
      });

    if (error1) {
      console.log(`[SEND-OTP] ⚠️ Insert with all columns failed`);
      // Try alternative column structure if needed
      const { error: error2 } = await supabase
        .from("otp_sessions")
        .insert({
          email: body.email,
          otp,
          expires_at_ms: expiresAtMs,
          used: false,
          created_at_ms: Date.now(),
        });
      otpError = error2 || error1;
    }

    if (otpError) {
      console.error(`[SEND-OTP] ❌ OTP storage error:`, otpError);
      return {
        success: false,
        error: "Failed to generate OTP",
      };
    }

    console.log(`[SEND-OTP] ✅ OTP stored in database`);

    // Send OTP via email
    console.log(`[SEND-OTP] 📧 Sending OTP email...`);
    const { sendOTPEmail } = await import("../lib/email");
    const emailSent = await sendOTPEmail(body.email, otp);

    if (!emailSent) {
      console.error(`[SEND-OTP] ❌ Failed to send OTP email`);
      return {
        success: false,
        error: "Failed to send OTP email",
      };
    }

    console.log(`[SEND-OTP] ✅✅ OTP sent successfully`);

    return {
      success: true,
      message: "OTP sent to email. Please check your inbox.",
    };
  }

  /**
   * Verify JWT session and get authenticated user info
   * Requires valid JWT token in Authorization header or cookies
   */
  @Get("verify-session")
  @Protected()
  async verifySession(@Request() req: any) {
    const user = req.user;
    return {
      success: true,
      authenticated: true,
      user: {
        id: user.sub,
        email: user.email,
      },
    };
  }

  /**
   * Logout endpoint - invalidates session on backend
   * Frontend should also clear localStorage token
   * Requires valid JWT token
   */
  @Post("logout")
  @Protected()
  async logout(@Request() req: any) {
    try {
      const user = req.user;
      console.log(`🚪 User ${user.email} logged out`);
      
      return {
        success: true,
        message: "Logged out successfully",
      };
    } catch (error) {
      console.error("Logout error:", error);
      return {
        success: false,
        error: "Logout failed",
      };
    }
  }
}
