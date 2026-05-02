"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, FileText, Image } from "lucide-react";
import BaseModal from "../shared/BaseModal";
import AlertModal from "../shared/AlertModal";
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

  // Alert modal state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertVariant, setAlertVariant] = useState<"warning" | "success" | "error">("warning");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertCallback, setAlertCallback] = useState<(() => void) | null>(null);

  if (!donorData) return null;

  const showAlert = (variant: "warning" | "success" | "error", title: string, message: string, callback?: () => void) => {
    setAlertVariant(variant);
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertCallback(() => callback || null);
    setAlertOpen(true);
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
    if (alertCallback) alertCallback();
  };

  const handleApprove = () => {
    if (!idVerified || !bankVerified) {
      showAlert("warning", "Verification Required", "Please verify both Identity Document and Bank Statement before approving.");
      return;
    }
    const updatedDonor = { ...donorData, idVerified, bankVerified, status: "Approved" };
    if (onUpdate) onUpdate(updatedDonor);
    showAlert("success", "Donor Approved", `${donorData.name} has been successfully approved.`, () => onClose());
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      showAlert("warning", "Reason Required", "Please provide a rejection reason before proceeding.");
      return;
    }
    const updatedDonor = { ...donorData, idVerified, bankVerified, status: "Rejected" };
    if (onUpdate) onUpdate(updatedDonor);
    showAlert("error", "Donor Rejected", `${donorData.name} has been rejected.\nReason: ${rejectionReason}`, () => onClose());
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

      <AlertModal
        isOpen={alertOpen}
        onClose={handleAlertClose}
        variant={alertVariant}
        title={alertTitle}
        message={alertMessage}
      />
    </BaseModal>
  );
}