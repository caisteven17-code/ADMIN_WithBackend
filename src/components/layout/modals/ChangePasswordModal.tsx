"use client";

import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import AlertModal from "./shared/AlertModal";
import styles from "./ChangePasswordModal.module.css";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertVariant, setAlertVariant] = useState<"warning" | "success">("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setAlertVariant("warning");
      setAlertTitle("Passwords Don't Match");
      setAlertMessage("New password and confirm password must match. Please try again.");
      setAlertOpen(true);
      return;
    }
    setAlertVariant("success");
    setAlertTitle("Password Updated");
    setAlertMessage("Your password has been updated successfully.");
    setAlertOpen(true);
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
    if (alertVariant === "success") {
      onClose();
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <h2>Change Password</h2>
            <p>Update your account password</p>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Current Password</label>
            <div className={styles.inputWrapper}>
              <input
                type={showCurrent ? "text" : "password"}
                placeholder="Enter current password"
                required
                className={styles.input}
              />
              <button 
                type="button" 
                className={styles.eyeBtn} 
                onClick={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>New Password</label>
            <div className={styles.inputWrapper}>
              <input
                type={showNew ? "text" : "password"}
                placeholder="Enter new password"
                required
                className={styles.input}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button 
                type="button" 
                className={styles.eyeBtn} 
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Confirm New Password</label>
            <div className={styles.inputWrapper}>
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                required
                className={styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button 
                type="button" 
                className={styles.eyeBtn} 
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn}>
              Update Password
            </button>
          </div>
        </form>
      </div>

      <AlertModal
        isOpen={alertOpen}
        onClose={handleAlertClose}
        variant={alertVariant}
        title={alertTitle}
        message={alertMessage}
      />
    </div>
  );
}