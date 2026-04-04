"use client";

import BaseModal from "../shared/BaseModal";
import styles from "./ReviewBeneficiaryApprovalModal.module.css";

interface ReviewBeneficiaryApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiaryData: any;
}

export default function ReviewBeneficiaryApprovalModal({ 
  isOpen, 
  onClose, 
  beneficiaryData 
}: ReviewBeneficiaryApprovalModalProps) {
  
  if (!beneficiaryData) return null;

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Review Beneficiary Application"
    >
      <div className={styles.container}>
        <div className={styles.placeholder}>
          <p>Beneficiary details for <strong>{beneficiaryData.name}</strong></p>
          <span>Campaign: {beneficiaryData.campaign}</span>
          <p className={styles.statusNote}>(Blank Setup Ready)</p>
        </div>
      </div>
    </BaseModal>
  );
}