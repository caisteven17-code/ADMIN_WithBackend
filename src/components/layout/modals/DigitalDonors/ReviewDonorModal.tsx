"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, FileText, Image } from "lucide-react";
import BaseModal from "../shared/BaseModal";
import styles from "./ReviewDonorModal.module.css";

interface ReviewDonorModalProps {
  isOpen: boolean;
  onClose: () => void;
  donorData: any;
  onUpdate?: (donor: any) => void;
}

export default function ReviewDonorModal({ isOpen, onClose, donorData, onUpdate }: ReviewDonorModalProps) {
  const [idVerified, setIdVerified] = useState(false);
  const [bankVerified, setBankVerified] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!donorData) return null;

  const handleApprove = () => {
    if (!idVerified || !bankVerified) {
      alert("Please verify both Identity Document and Bank Statement before approving");
      return;
    }
    const updatedDonor = { ...donorData, idVerified, bankVerified, status: "Approved" };
    if (onUpdate) onUpdate(updatedDonor);
    alert(`Approved: ${donorData.name}`);
    onClose();
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    const updatedDonor = { ...donorData, idVerified, bankVerified, status: "Rejected" };
    if (onUpdate) onUpdate(updatedDonor);
    alert(`Rejected: ${donorData.name}\nReason: ${rejectionReason}`);
    onClose();
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Review Digital Donor"
    >
      <div className={styles.container}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Uploaded Documents</h3>
          
          <div className={styles.field}>
            <label className={styles.label}>Identity Document</label>
            <div className={styles.documentPreview}>
              <div className={styles.previewBox}>
                <Image size={32} />
                <span>ID Document Preview</span>
              </div>
            </div>
            <label className={styles.checkbox}>
              <input 
                type="checkbox" 
                checked={idVerified}
                onChange={(e) => setIdVerified(e.target.checked)}
              />
              <span>I have verified this identity document is valid</span>
              <div className={styles.statusIcon}>
                {idVerified ? <CheckCircle2 size={18} color="#22c55e" /> : <XCircle size={18} color="#ef4444" />}
              </div>
            </label>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Bank Statement</label>
            <div className={styles.documentPreview}>
              <div className={styles.previewBox}>
                <FileText size={32} />
                <span>Bank Statement Preview</span>
              </div>
            </div>
            <label className={styles.checkbox}>
              <input 
                type="checkbox" 
                checked={bankVerified}
                onChange={(e) => setBankVerified(e.target.checked)}
              />
              <span>I have verified this bank statement is valid</span>
              <div className={styles.statusIcon}>
                {bankVerified ? <CheckCircle2 size={18} color="#22c55e" /> : <XCircle size={18} color="#ef4444" />}
              </div>
            </label>
          </div>
        </div>

        {showRejectForm && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Rejection Reason</h3>
            <textarea
              className={styles.textarea}
              placeholder="Provide reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
        )}

        <div className={styles.actions}>
          {!showRejectForm ? (
            <>
              <button className={styles.approveBtn} onClick={handleApprove}>
                Approve
              </button>
              <button className={styles.rejectBtn} onClick={() => setShowRejectForm(true)}>
                Reject
              </button>
            </>
          ) : (
            <>
              <button className={styles.approveBtn} onClick={handleReject}>
                Confirm Reject
              </button>
              <button className={styles.cancelBtn} onClick={() => setShowRejectForm(false)}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </BaseModal>
  );
}