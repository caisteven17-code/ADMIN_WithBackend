"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "./verify.module.css";

export default function Verify() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

          <div className={styles.resendText}>
            Didn't receive the code? <button className={styles.resendLink}>Resend (0:59)</button>
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