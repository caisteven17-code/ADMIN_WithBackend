"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Image, Building2, CreditCard } from "lucide-react";
import BaseModal from "../shared/BaseModal";
import AlertModal from "../shared/AlertModal";
import styles from "./ReviewBeneficiaryApprovalModal.module.css";

interface ReviewBeneficiaryApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiaryData: any;
  onUpdate?: (beneficiary: any) => void;
}

export default function ReviewBeneficiaryApprovalModal({ 
  isOpen, 
  onClose, 
  beneficiaryData,
  onUpdate
}: ReviewBeneficiaryApprovalModalProps) {
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

  if (!beneficiaryData) return null;

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
      showAlert("warning", "Verification Required", "Please verify both Identity Document and Bank Account Details before approving.");
      return;
    }
    const updatedBeneficiary = { ...beneficiaryData, docs: idVerified, bank: bankVerified, status: "Approved" };
    if (onUpdate) onUpdate(updatedBeneficiary);
    showAlert("success", "Beneficiary Approved", `${beneficiaryData.name} has been successfully approved.`, () => onClose());
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      showAlert("warning", "Reason Required", "Please provide a rejection reason before proceeding.");
      return;
    }
    const updatedBeneficiary = { ...beneficiaryData, docs: idVerified, bank: bankVerified, status: "Rejected" };
    if (onUpdate) onUpdate(updatedBeneficiary);
    showAlert("error", "Beneficiary Rejected", `${beneficiaryData.name} has been rejected.\nReason: ${rejectionReason}`, () => onClose());
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Review Beneficiary Application"
    >
      <div className={styles.container}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Application Information</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Campaign</span>
              <span className={styles.infoValue}>{beneficiaryData.campaign}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>{beneficiaryData.email}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Submitted</span>
              <span className={styles.infoValue}>{beneficiaryData.date}</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Identity Verification</h3>
          
          <div className={styles.field}>
            <label className={styles.label}>Government-issued ID</label>
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
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Bank Account Details</h3>
          
          <div className={styles.bankDetails}>
            <div className={styles.bankField}>
              <label className={styles.label}>Account Name</label>
              <div className={styles.bankValue}>{beneficiaryData.name}</div>
            </div>
            <div className={styles.bankField}>
              <label className={styles.label}>Bank</label>
              <div className={styles.bankValue}>BDO Unibank</div>
            </div>
            <div className={styles.bankField}>
              <label className={styles.label}>Account Number</label>
              <div className={styles.bankValue}>1234567890</div>
            </div>
          </div>

<label className={styles.checkbox}>
              <input 
                type="checkbox" 
                checked={bankVerified}
                onChange={(e) => setBankVerified(e.target.checked)}
              />
              <span>I have verified this bank account details are valid</span>
              <div className={styles.statusIcon}>
                {bankVerified ? <CheckCircle2 size={18} color="#22c55e" /> : <XCircle size={18} color="#ef4444" />}
              </div>
            </label>
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