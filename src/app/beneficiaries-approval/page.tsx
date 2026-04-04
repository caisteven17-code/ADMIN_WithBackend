"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
// Import the renamed modal
import ReviewBeneficiaryApprovalModal from "@/components/layout/modals/BeneficiaryApproval/ReviewBeneficiaryApprovalModal";
import styles from "../tableStyles.module.css";

const approvals = [
  { id: 1, name: "Ana Reyes", campaign: "Medical Assistance", email: "ana@email.com", date: "2026-03-30", docs: true, bank: true, status: "Pending" },
  { id: 2, name: "Carlos Santos", campaign: "Education Fund", email: "carlos@email.com", date: "2026-03-29", docs: true, bank: false, status: "Pending" },
  { id: 3, name: "Elena Cruz", campaign: "Disaster Relief", email: "elena@email.com", date: "2026-03-28", docs: false, bank: true, status: "Pending" },
  { id: 4, name: "Miguel Torres", campaign: "Food Security", email: "miguel@email.com", date: "2026-03-27", docs: true, bank: true, status: "Approved" },
];

export default function BeneficiariesApproval() {
  // 1. State for modal visibility and tracking which item is clicked
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. Helper to open modal with the correct data
  const handleReview = (item: any) => {
    setSelectedBeneficiary(item);
    setIsModalOpen(true);
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>Beneficiaries Approval</h1>
        <p>Review and approve beneficiary applications</p>
      </header>
      
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Campaign</th>
              <th>Email</th>
              <th>Date Submitted</th>
              <th>Documents</th>
              <th>Bank Details</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {approvals.map((item) => (
              <tr key={item.id}>
                <td className={styles.textDark}>{item.name}</td>
                <td className={styles.textRed}>{item.campaign}</td>
                <td className={styles.textRed}>{item.email}</td>
                <td>{item.date}</td>
                <td>{item.docs ? <CheckCircle2 color="#22c55e" size={20} /> : <XCircle color="#ef4444" size={20} />}</td>
                <td>{item.bank ? <CheckCircle2 color="#22c55e" size={20} /> : <XCircle color="#ef4444" size={20} />}</td>
                <td><span className={`${styles.badge} ${styles[`badge${item.status}`]}`}>{item.status}</span></td>
                <td>
                  {item.status === "Pending" && (
                    <button 
                      className={styles.actionBtn}
                      onClick={() => handleReview(item)}
                    >
                      Review
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. Render the renamed Modal */}
      <ReviewBeneficiaryApprovalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        beneficiaryData={selectedBeneficiary}
      />
    </div>
  );
}