"use client";

import { X } from "lucide-react";
import styles from "./ConfirmDonationModal.module.css";

interface ConfirmDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void; // Added onConfirm prop
  data: any;
}

export default function ConfirmDonationModal({ isOpen, onClose, onConfirm, data }: ConfirmDonationModalProps) {
  if (!isOpen || !data) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* ... existing header and close button ... */}
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>

        <div className={styles.content}>
          <h2 className={styles.title}>Confirm Donation</h2>
          
          <p className={styles.message}>
            Send <span className={styles.amount}>{data.amount}</span> to <strong>{data.name}</strong>?
          </p>

          <div className={styles.infoBox}>
            <p><strong>Campaign:</strong> {data.campaign}</p>
            <p className={styles.subtext}>
              This action will transfer the allocated funds to the beneficiary's bank account.
            </p>
          </div>

          <div className={styles.actions}>
            <button className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button 
              className={styles.confirmBtn} 
              onClick={onConfirm} // Call the parent function when confirmed
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}