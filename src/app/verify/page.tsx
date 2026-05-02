"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "./verify.module.css";

type ResendNotice = {
  variant: "warning" | "success";
  message: string;
};

export default function Verify() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState(59);
  const [resendNotice, setResendNotice] = useState<ResendNotice | null>(null);

  const canResend = countdown === 0;

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  useEffect(() => {
    if (!resendNotice) {
      return;
    }

    const timeout = setTimeout(() => {
      setResendNotice(null);
    }, 2800);

    return () => clearTimeout(timeout);
  }, [resendNotice]);

  const showResendNotice = useCallback((variant: "warning" | "success", message: string) => {
    setResendNotice({ variant, message });
  }, []);

  const handleResend = useCallback(() => {
    if (!canResend) {
      showResendNotice("warning", `Wait 0:${countdown.toString().padStart(2, "0")} before resending.`);
      return;
    }

    setCountdown(59);
    showResendNotice("success", "A new verification code has been sent.");
  }, [canResend, countdown, showResendNotice]);

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

  const handleVerify = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Pure frontend routing - goes to dashboard after verification
    router.push("/dashboard");
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.loginContainer}>
        
        <div className={styles.logoSection}>
          <div className={styles.logoMark}>H</div>
          <h1 className={styles.logoText}>HopeCard</h1>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Verification Code</h2>
            <p>We've sent a 6-digit code to <strong>admin@hopecard.com</strong></p>
          </div>

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
                  required
                />
              ))}
            </div>

            <button type="submit" className={styles.verifyBtn}>
              Verify
            </button>
          </form>

          <div className={styles.resendSection}>
            <div className={styles.resendText}>
              Didn't receive the code?{" "}
              <button
                type="button"
                className={styles.resendLink}
                onClick={handleResend}
              >
                {canResend ? "Resend Code" : `Resend (0:${countdown.toString().padStart(2, "0")})`}
              </button>
            </div>

            <div className={styles.resendFeedbackSlot} aria-live="polite" aria-atomic="true">
              {resendNotice && (
                <p
                  className={`${styles.resendFeedback} ${
                    resendNotice.variant === "success" ? styles.resendFeedbackSuccess : styles.resendFeedbackWarning
                  }`}
                  role="status"
                >
                  {resendNotice.message}
                </p>
              )}
            </div>
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
