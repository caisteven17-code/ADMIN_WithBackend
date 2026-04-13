"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Lock } from "lucide-react";
import { useState } from "react";
import styles from "./login.module.css";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      console.log("🔍 Login response status:", response.status);
      console.log("🔍 Login response ok:", response.ok);
      console.log("🔍 Login response data:", data);

      // IMPORTANT: Check status code first
      if (response.status !== 200) {
        const errorMessage = data.error || data.message || `Login failed (${response.status})`;
        console.log("❌ Login error (non-200):", errorMessage);
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Then check success flag
      if (!data.success) {
        const errorMessage = data.error || data.message || "Login failed";
        console.log("❌ Login error (success=false):", errorMessage);
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // OTP ENABLED: Store email and redirect to OTP verification page
      console.log("✅ Login successful, redirecting to OTP");
      localStorage.setItem("pending_email", email);
      
      // Redirect to OTP verification page
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError("An error occurred during login");
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
            <h2>Welcome Back</h2>
            <p>Sign in to access the admin portal</p>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  required
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Password</label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.inputIcon} />
                <input
                  type="password"
                  placeholder="Enter your password"
                  required
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              className={styles.loginBtn}
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
