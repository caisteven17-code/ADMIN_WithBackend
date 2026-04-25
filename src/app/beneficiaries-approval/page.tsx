"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import ReviewBeneficiaryApprovalModal from "@/components/layout/modals/BeneficiaryApproval/ReviewBeneficiaryApprovalModal";
import styles from "../tableStyles.module.css";

const initialApprovals = [
  { id: 1, name: "Ana Reyes", campaign: "Medical Assistance", email: "ana@email.com", date: "2026-03-30", docs: false, bank: false, status: "Pending" },
  { id: 2, name: "Carlos Santos", campaign: "Education Fund", email: "carlos@email.com", date: "2026-03-29", docs: false, bank: false, status: "Pending" },
  { id: 3, name: "Elena Cruz", campaign: "Disaster Relief", email: "elena@email.com", date: "2026-03-28", docs: false, bank: false, status: "Pending" },
  { id: 4, name: "Miguel Torres", campaign: "Food Security", email: "miguel@email.com", date: "2026-03-27", docs: true, bank: true, status: "Approved" },
];

export default function BeneficiariesApproval() {
  const [approvals, setApprovals] = useState(initialApprovals);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("All");

  const filteredApprovals = approvals.filter(a => filter === "All" || a.status === filter);

  const handleReview = (item: any) => {
    setSelectedBeneficiary(item);
    setIsModalOpen(true);
  };

  const handleUpdateBeneficiary = (updatedBeneficiary: any) => {
    setApprovals(approvals.map(a => a.id === updatedBeneficiary.id ? updatedBeneficiary : a));
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>Beneficiaries Approval</h1>
        <p>Review and approve beneficiary applications</p>
      </header>

      <div className={styles.controlsContainer}>
        <div className={styles.tabsContainer}>
          {['All', 'Approved', 'Rejected', 'Pending'].map((status) => (
            <button
              key={status}
              className={`${styles.tab} ${filter === status ? styles.tabActive : ''}`}
              onClick={() => setFilter(status)}
            >
              {status === 'All' ? 'All Registrations' : status}
            </button>
          ))}
        </div>
      </div>
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
            {filteredApprovals.map((item) => (
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
        onUpdate={handleUpdateBeneficiary}
      />
    </div>
  );
}