"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, FileText, Image, Building2 } from "lucide-react";
import BaseModal from "../shared/BaseModal";
import styles from "./ReviewManagerModal.module.css";

interface ReviewManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  managerData: any;
  onUpdate?: (manager: any) => void;
}

export default function ReviewManagerModal({ isOpen, onClose, managerData, onUpdate }: ReviewManagerModalProps) {
  const [secVerified, setSecVerified] = useState(false);
  const [certVerified, setCertVerified] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!managerData) return null;

  const handleApprove = () => {
    if (!secVerified || !certVerified) {
      alert("Please verify both SEC Registration and Organizational Certificate before approving");
      return;
    }
    const updatedManager = { ...managerData, docsVerified: true, status: "Approved" };
    if (onUpdate) onUpdate(updatedManager);
    alert(`Approved: ${managerData.name}`);
    onClose();
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    const updatedManager = { ...managerData, docsVerified: false, status: "Rejected" };
    if (onUpdate) onUpdate(updatedManager);
    alert(`Rejected: ${managerData.name}\nReason: ${rejectionReason}`);
    onClose();
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Review Campaign Manager"
    >
      <div className={styles.container}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Organization Information</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Organization</span>
              <span className={styles.infoValue}>{managerData.org}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Contact Email</span>
              <span className={styles.infoValue}>{managerData.email}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Submitted</span>
              <span className={styles.infoValue}>{managerData.date}</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Legal Documents</h3>
          
          <div className={styles.field}>
            <label className={styles.label}>SEC Registration</label>
            <div className={styles.documentPreview}>
              <div className={styles.previewBox}>
                <FileText size={32} />
                <span>SEC Document Preview</span>
              </div>
            </div>
            <label className={styles.checkbox}>
              <input 
                type="checkbox" 
                checked={secVerified}
                onChange={(e) => setSecVerified(e.target.checked)}
              />
              <span>I have verified this SEC registration is valid</span>
              <div className={styles.statusIcon}>
                {secVerified ? <CheckCircle2 size={18} color="#22c55e" /> : <XCircle size={18} color="#ef4444" />}
              </div>
            </label>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Organizational Certificate</label>
            <div className={styles.documentPreview}>
              <div className={styles.previewBox}>
                <Building2 size={32} />
                <span>Certificate Preview</span>
              </div>
            </div>
            <label className={styles.checkbox}>
              <input 
                type="checkbox" 
                checked={certVerified}
                onChange={(e) => setCertVerified(e.target.checked)}
              />
              <span>I have verified this organizational certificate is valid</span>
              <div className={styles.statusIcon}>
                {certVerified ? <CheckCircle2 size={18} color="#22c55e" /> : <XCircle size={18} color="#ef4444" />}
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
              <button className={styles.rejectBtn} onClick={handleReject}>
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