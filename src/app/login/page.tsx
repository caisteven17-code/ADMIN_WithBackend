"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // 1. Import Image
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import styles from "./login.module.css";

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push("/verify"); 
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.loginContainer}>
        
        {/* UPDATED LOGO SECTION */}
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
          {/* ... existing card code ... */}
          <div className={styles.cardHeader}>
            <h2>Welcome Back</h2>
            <p>Sign in to access the admin portal</p>
          </div>

          <form onSubmit={handleLogin} className={styles.form}>
            {/* ... existing form groups ... */}
            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.inputIcon} />
                <input 
                  type="text" 
                  placeholder="admin@hopecard.com" 
                  required 
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Password</label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.inputIcon} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  required 
                  className={styles.input}
                />
                <button 
                  type="button" 
                  className={styles.eyeBtn} 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.loginBtn}>
              Log In
            </button>
          </form>

          <div className={styles.forgotPassword}>
            <button type="button">Forgot Password?</button>
          </div>
        </div>
      </div>
    </div>
  );
}