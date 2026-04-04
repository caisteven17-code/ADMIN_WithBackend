"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import ReviewManagerModal from "@/components/layout/modals/CampaignManagers/ReviewManagerModal";
import styles from "../tableStyles.module.css";

const initialManagers = [
  { id: 1, name: "Hope Community Org", org: "Hope Foundation", email: "contact@hope.org", date: "2026-03-29", docsVerified: false, status: "Pending" },
  { id: 2, name: "ABC Foundation", org: "ABC Charity", email: "info@abc.org", date: "2026-03-28", docsVerified: false, status: "Pending" },
  { id: 3, name: "Care Society", org: "Care Org", email: "admin@care.org", date: "2026-03-27", docsVerified: true, status: "Approved" },
  { id: 4, name: "Help Network", org: "Help Inc", email: "contact@help.org", date: "2026-03-26", docsVerified: false, status: "Rejected" },
];

export default function CampaignManagers() {
  const [managers, setManagers] = useState(initialManagers);
  const [selectedManager, setSelectedManager] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReview = (manager: any) => {
    setSelectedManager(manager);
    setIsModalOpen(true);
  };

  const handleUpdateManager = (updatedManager: any) => {
    setManagers(managers.map(m => m.id === updatedManager.id ? updatedManager : m));
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>Campaign Managers</h1>
        <p>Review and approve campaign manager applications</p>
      </header>
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Organization</th>
              <th>Email</th>
              <th>Date Submitted</th>
              <th>Documents</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {managers.map((manager) => (
              <tr key={manager.id}>
                <td className={styles.textDark}>{manager.name}</td>
                <td className={styles.textRed}>{manager.org}</td>
                <td className={styles.textRed}>{manager.email}</td>
                <td>{manager.date}</td>
                <td>{manager.docsVerified ? <CheckCircle2 color="#22c55e" size={20} /> : <XCircle color="#ef4444" size={20} />}</td>
                <td><span className={`${styles.badge} ${styles[`badge${manager.status}`]}`}>{manager.status}</span></td>
                <td>
                  {manager.status === "Pending" && (
                    <button 
                      className={styles.actionBtn}
                      onClick={() => handleReview(manager)}
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

      {/* The Modal */}
      <ReviewManagerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        managerData={selectedManager}
        onUpdate={handleUpdateManager}
      />
    </div>
  );
}