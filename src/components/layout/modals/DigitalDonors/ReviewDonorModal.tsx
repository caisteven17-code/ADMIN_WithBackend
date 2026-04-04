"use client";

import BaseModal from "../shared/BaseModal";
import styles from "./ReviewDonorModal.module.css";

interface ReviewDonorModalProps {
  isOpen: boolean;
  onClose: () => void;
  donorData: any; 
}

export default function ReviewDonorModal({ isOpen, onClose, donorData }: ReviewDonorModalProps) {
  // We keep this check so the modal doesn't crash if no donor is selected, 
  // but the content inside is now empty.
  if (!donorData) return null;

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Review Donor"
    >
      <div className={styles.container}>
        {/* Content is currently blank for structural testing */}
        <div style={{ 
          height: "100%", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          color: "#9ca3af",
          fontStyle: "italic" 
        }}>
          Donor details will be displayed here.
        </div>
      </div>
    </BaseModal>
  );
}