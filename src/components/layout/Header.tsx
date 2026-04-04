"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, User, ChevronDown, Settings, LogOut } from "lucide-react";
// Import both modals
import SettingsMenuModal from "./modals/SettingsMenuModal";
import ChangePasswordModal from "./modals/ChangePasswordModal";
import styles from "./Header.module.css";

export default function Header() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // State for the two-step flow
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    router.push("/login");
  };

  // Step 1: Open the Settings Menu
  const handleOpenSettings = () => {
    setIsMenuOpen(true);
    setIsDropdownOpen(false);
  };

  // Step 2: Transition from Menu to Password Form
  const handleOpenChangePassword = () => {
    setIsMenuOpen(false);         // Close the list menu
    setIsPasswordModalOpen(true); // Open the actual password inputs
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.pageTitle}>
          <h2>Admin Portal</h2>
          <p>Welcome back, Administrator</p>
        </div>

        <div className={styles.userSection}>
          <button className={styles.notificationBtn}>
            <Bell size={20} />
            <span className={styles.notificationDot}></span>
          </button>

          <div className={styles.divider}></div>

          <div className={styles.profileContainer} ref={dropdownRef}>
            <div 
              className={`${styles.profile} ${isDropdownOpen ? styles.profileActive : ""}`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className={styles.profileInfo}>
                <span className={styles.profileName}>Admin User</span>
                <span className={styles.profileRole}>Administrator</span>
              </div>
              <div className={styles.avatar}>
                <User size={18} color="white" />
              </div>
              <ChevronDown size={16} className={styles.chevron} />
            </div>

            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <button className={styles.dropdownItem} onClick={handleOpenSettings}>
                  <Settings size={16} className={styles.dropdownIcon} />
                  <span>Settings</span>
                </button>
                
                <button className={styles.dropdownItem} onClick={handleLogout}>
                  <LogOut size={16} className={styles.dropdownIcon} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MODAL 1: The Settings List Menu */}
      <SettingsMenuModal 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onChangePasswordClick={handleOpenChangePassword} 
      />

      {/* MODAL 2: The actual Change Password Inputs */}
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </>
  );
}