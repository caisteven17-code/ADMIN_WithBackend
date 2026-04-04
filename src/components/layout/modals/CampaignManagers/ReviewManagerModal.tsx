"use client";

import BaseModal from "../shared/BaseModal";
import styles from "./ReviewManagerModal.module.css";

interface ReviewManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  managerData: any;
}

export default function ReviewManagerModal({ isOpen, onClose, managerData }: ReviewManagerModalProps) {
  if (!managerData) return null;

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Review Campaign Manager"
    >
      <div className={styles.container}>
        <div className={styles.placeholder}>
          <p>Manager Review Content for <strong>{managerData.name}</strong></p>
          <span>(Blank setup ready for logic)</span>
        </div>
      </div>
    </BaseModal>
  );
}