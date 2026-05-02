"use client";

import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import styles from "./AlertModal.module.css";

type AlertVariant = "warning" | "success" | "error";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant: AlertVariant;
  title: string;
  message: string;
}

const variantConfig = {
  warning: {
    icon: AlertTriangle,
    iconClass: styles.iconCircleWarning,
    btnClass: styles.alertBtnWarning,
    barClass: styles.accentBarWarning,
    btnLabel: "Understood",
  },
  success: {
    icon: CheckCircle2,
    iconClass: styles.iconCircleSuccess,
    btnClass: styles.alertBtnSuccess,
    barClass: styles.accentBarSuccess,
    btnLabel: "Done",
  },
  error: {
    icon: XCircle,
    iconClass: styles.iconCircleError,
    btnClass: styles.alertBtnError,
    barClass: styles.accentBarError,
    btnLabel: "OK",
  },
};

export default function AlertModal({ isOpen, onClose, variant, title, message }: AlertModalProps) {
  if (!isOpen) return null;

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div className={styles.alertOverlay} onClick={onClose}>
      <div className={styles.alertModal} onClick={(e) => e.stopPropagation()}>
        {/* Accent bar */}
        <div className={`${styles.accentBar} ${config.barClass}`} />

        {/* Icon */}
        <div className={styles.iconBanner}>
          <div className={`${styles.iconCircle} ${config.iconClass}`}>
            <Icon size={30} />
          </div>
        </div>

        {/* Body */}
        <div className={styles.alertBody}>
          <h3 className={styles.alertTitle}>{title}</h3>
          <p className={styles.alertMessage}>{message}</p>
        </div>

        {/* Button */}
        <div className={styles.alertFooter}>
          <button
            className={`${styles.alertBtn} ${config.btnClass}`}
            onClick={onClose}
          >
            {config.btnLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
