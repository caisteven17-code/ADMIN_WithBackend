"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import ReviewBeneficiaryBankModal from "@/components/layout/modals/BeneficiaryBankApproval/ReviewBeneficiaryBankModal";
import styles from "../tableStyles.module.css";

const initialApprovals = [
  { id: 1, name: "Ana Reyes", email: "ana@email.com", date: "2026-03-30", bank: false, accountName: "Ana Reyes", bankName: "BDO", accountNumber: "1234567890", status: "Pending" },
  { id: 2, name: "Carlos Santos", email: "carlos@email.com", date: "2026-03-29", bank: false, accountName: "Carlos Santos", bankName: "BPI", accountNumber: "0987654321", status: "Pending" },
  { id: 3, name: "Elena Cruz", email: "elena@email.com", date: "2026-03-28", bank: false, accountName: "Elena Cruz", bankName: "Metrobank", accountNumber: "1122334455", status: "Pending" },
  { id: 4, name: "Miguel Torres", email: "miguel@email.com", date: "2026-03-27", bank: true, accountName: "Miguel Torres", bankName: "UnionBank", accountNumber: "5566778899", status: "Approved" },
];

export default function BeneficiaryBankApproval() {
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
        <h1>Beneficiary Bank Approval</h1>
        <p>Review and approve beneficiary bank account details</p>
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
              <th>Email</th>
              <th>Date Submitted</th>
              <th>Bank Details</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApprovals.map((item) => (
              <tr key={item.id}>
                <td className={styles.textDark}>{item.name}</td>
                <td className={styles.textRed}>{item.email}</td>
                <td>{item.date}</td>
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

      <ReviewBeneficiaryBankModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        beneficiaryData={selectedBeneficiary}
        onUpdate={handleUpdateBeneficiary}
      />
    </div>
  );
}
