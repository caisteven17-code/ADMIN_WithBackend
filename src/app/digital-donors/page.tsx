"use client";

import { useState } from "react"; // Added useState
import { CheckCircle2, XCircle } from "lucide-react";
import ReviewDonorModal from "@/components/layout/modals/DigitalDonors/ReviewDonorModal";
import styles from "../tableStyles.module.css";

const donors = [
  { 
    id: 1, 
    name: "Maria Santos", 
    email: "maria@email.com", 
    date: "2026-03-28", 
    idVerified: true, 
    bankVerified: true, 
    status: "Pending",
    // Added extra data for the modal to display
    age: 28,
    gender: "Female",
    occupation: "Software Engineer",
    phone: "+63 912 345 6789",
    address: "123 Hope St, Manila, Philippines",
    image: "/HopeCard%20Logo.png" // Using your logo as a placeholder
  },
  { id: 2, name: "Juan dela Cruz", email: "juan@email.com", date: "2026-03-27", idVerified: true, bankVerified: false, status: "Pending", age: 35, gender: "Male", occupation: "Teacher", phone: "+63 987 654 3210", address: "456 Charity Ln, Quezon City" },
  { id: 3, name: "Ana Reyes", email: "ana@email.com", date: "2026-03-26", idVerified: false, bankVerified: true, status: "Pending", age: 24, gender: "Female", occupation: "Graphic Designer", phone: "+63 911 222 3333", address: "789 Kindness Blvd, Cebu City" },
  { id: 4, name: "Pedro Garcia", email: "pedro@email.com", date: "2026-03-25", idVerified: true, bankVerified: true, status: "Approved" },
  { id: 5, name: "Sofia Martinez", email: "sofia@email.com", date: "2026-03-24", idVerified: false, bankVerified: false, status: "Rejected" },
];

export default function DigitalDonors() {
  // 1. Setup the state
  const [selectedDonor, setSelectedDonor] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. Function to open the modal
  const handleReview = (donor: any) => {
    setSelectedDonor(donor);
    setIsModalOpen(true);
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>Digital Donors</h1>
        <p>Review and approve digital donor registrations</p>
      </header>
      
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Date Submitted</th>
              <th>Identity Verified</th>
              <th>Bank Statement</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {donors.map((donor) => (
              <tr key={donor.id}>
                <td className={styles.textDark}>{donor.name}</td>
                <td className={styles.textRed}>{donor.email}</td>
                <td>{donor.date}</td>
                <td>{donor.idVerified ? <CheckCircle2 color="#22c55e" size={20} /> : <XCircle color="#ef4444" size={20} />}</td>
                <td>{donor.bankVerified ? <CheckCircle2 color="#22c55e" size={20} /> : <XCircle color="#ef4444" size={20} />}</td>
                <td><span className={`${styles.badge} ${styles[`badge${donor.status}`]}`}>{donor.status}</span></td>
                <td>
                  {donor.status === "Pending" && (
                    <button 
                      className={styles.actionBtn}
                      onClick={() => handleReview(donor)} // Trigger opening
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

      {/* 3. The Modal Component */}
      <ReviewDonorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        donorData={selectedDonor} 
      />
    </div>
  );
}