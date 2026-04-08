"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, ArrowLeft } from "lucide-react";
import { useState } from "react";
import styles from "@/app/login/login.module.css";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

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
        setError(data.error || "Failed to send OTP");
        setLoading(false);
        return;
      }

      setSuccess(`OTP sent to ${data.email}`);
      
      // Redirect to verify page after 2 seconds
      setTimeout(() => {
        router.push(`/verify?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err) {
      setError("An error occurred");
      console.error(err);
      setLoading(false);
    }
  };

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
            <h2>Reset Password</h2>
            <p>Enter your email to receive a reset code</p>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              backgroundColor: "#dcfce7",
              border: "1px solid #86efac",
              borderRadius: "8px",
              padding: "0.75rem 1rem",
              color: "#166534",
              fontSize: "0.9rem",
              marginBottom: "1rem"
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSendOTP} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.inputIcon} />
                <input 
                  type="email" 
                  placeholder="admin@hopecard.com" 
                  required 
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className={styles.loginBtn}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>

          <div className={styles.forgotPassword}>
            <button 
              type="button"
              onClick={() => router.push("/login")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem"
              }}
            >
              <ArrowLeft size={18} />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
