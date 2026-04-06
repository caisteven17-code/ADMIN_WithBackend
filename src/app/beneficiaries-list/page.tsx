"use client";

import { useState } from "react";
// Import both modals
import ConfirmDonationModal from "@/components/layout/modals/BeneficiaryList/ConfirmDonationModal";
import DonationSuccessModal from "@/components/layout/modals/BeneficiaryList/DonationSuccessModal";
import styles from "../tableStyles.module.css";

const list = [
  // ... existing list data ...
  { id: 1, name: "Maria Santos", campaign: "Medical Assistance", amount: "₱50,000", status: "Approved", readiness: "Ready" },
  { id: 2, name: "Juan dela Cruz", campaign: "Education Fund", amount: "₱25,000", status: "Approved", readiness: "Ready" },
  { id: 3, name: "Pedro Garcia", campaign: "Disaster Relief", amount: "₱75,000", status: "Approved", readiness: "Pending" },
  { id: 4, name: "Sofia Martinez", campaign: "Food Security", amount: "₱30,000", status: "Sent", readiness: "Ready" },
  { id: 5, name: "Ana Reyes", campaign: "Housing Support", amount: "₱100,000", status: "Approved", readiness: "Ready" },
];

export default function BeneficiariesList() {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Separate states for visibility
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const handleOpenModal = (item: any) => {
    setSelectedItem(item);
    setIsConfirmOpen(true);
  };

  // Logic to handle when the user clicks 'Confirm' in the first modal
  const handleDonationSuccess = () => {
    setIsConfirmOpen(false); // Close the confirm modal
    // In a real app, you would execute an API call here.
    setIsSuccessOpen(true);  // Immediately open the success modal
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>Beneficiaries List</h1>
        <p>Manage approved beneficiaries and send donations</p>
      </header>
      
      <div className={styles.tableContainer}>
        {/* ... existing table code, just ensure handleOpenModal(item) is attached ... */}
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Campaign</th>
              <th>Amount Allocated</th>
              <th>Status</th>
              <th>Readiness</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <tr key={item.id}>
                {/* ... existing table cells ... */}
                <td className={styles.textDark}>{item.name}</td>
                <td className={styles.textRed}>{item.campaign}</td>
                <td className={styles.textDark}>{item.amount}</td>
                <td><span className={`${styles.badge} ${styles[`badge${item.status}`]}`}>{item.status}</span></td>
                <td><span className={`${styles.badge} ${styles[`badge${item.readiness}`]}`}>{item.readiness}</span></td>
                <td>
                  {item.status === "Sent" ? (
                    <span className={styles.actionTextCompleted}>Completed</span>
                  ) : item.readiness === "Pending" ? (
                    <span className={styles.actionTextDisabled}>Not Ready</span>
                  ) : (
                    <button 
                      className={styles.actionBtn}
                      onClick={() => handleOpenModal(item)}
                    >
                      Send Donation
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: Custom Confirmation Modal */}
      <ConfirmDonationModal 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={handleDonationSuccess} // Pass the success handler
        data={selectedItem}
      />

      {/* MODAL 2: New Success Modal */}
      <DonationSuccessModal 
        isOpen={isSuccessOpen} 
        onClose={() => setIsSuccessOpen(false)} 
        data={selectedItem}
      />
    </div>
  );
}