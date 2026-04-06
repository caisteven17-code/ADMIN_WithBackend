"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import styles from "./verify.module.css";

export default function Verify() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const email = searchParams.get("email") || "";

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^[0-9]*$/.test(value)) return;

    const newOtp = [...otp];
    // Take only the last character if they paste or type quickly
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus the next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to the previous input if Backspace is pressed on an empty box
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to verify OTP");
        setLoading(false);
        return;
      }

      // Store token and admin info in localStorage
      if (data.token) {
        localStorage.setItem('admin_token', data.token);
      }

      // Store admin info for display in header
      if (data.admin) {
        localStorage.setItem('admin_info', JSON.stringify({
          id: data.admin.id,
          email: data.admin.email,
          name: data.admin.name,
        }));
      }

      // Verification successful, redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError("An error occurred during verification");
      console.error(err);
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Email not found. Please go back to login.");
      return;
    }

    setResendLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to resend OTP");
        setResendLoading(false);
        return;
      }

      // Reset OTP inputs and start timer
      setOtp(["", "", "", "", "", ""]);
      setResendCount(60);
    } catch (err) {
      setError("Failed to resend OTP");
      console.error(err);
      setResendLoading(false);
    }
  };

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCount > 0) {
      const timer = setTimeout(() => {
        setResendCount(resendCount - 1);
        setResendLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCount]);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.loginContainer}>

        <div className={styles.logoSection}>
          <div className={styles.logoMark}>
            <Image
              src="/HopeCard%20Logo.png"
              alt="HopeCard Logo"
              width={60}
              height={60}
              priority
              style={{ objectFit: "contain" }}
            />
          </div>
          <h1 className={styles.logoText}>HopeCard</h1>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Verification Code</h2>
            <p>We've sent a 6-digit code to <strong>{email}</strong></p>
          </div>

          {error && (
            <div style={{
              backgroundColor: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: "8px",
              padding: "0.75rem 1rem",
              color: "#9b2c2c",
              fontSize: "0.9rem",
              marginBottom: "1rem"
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleVerify} className={styles.form}>
            <div className={styles.otpContainer}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  className={styles.otpInput}
                  disabled={loading}
                />
              ))}
            </div>

            <button
              type="submit"
              className={styles.verifyBtn}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>

          <div className={styles.resendText}>
            Didn't receive the code?
            <button
              className={styles.resendLink}
              onClick={handleResend}
              disabled={resendCount > 0 || resendLoading}
              type="button"
            >
              {resendCount > 0
                ? `Resend (0:${resendCount.toString().padStart(2, '0')})`
                : "Resend"}
            </button>
          </div>

          <Link href="/login" className={styles.backLink}>
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
