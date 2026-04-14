"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image"; // Import Image component
import { usePathname } from "next/navigation";
import { LayoutGrid, User, Users, UserCheck, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./Sidebar.module.css";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { name: "Digital Donors", href: "/digital-donors", icon: User },
  { name: "Campaign Managers", href: "/campaign-managers", icon: Users },
  { name: "Beneficiaries Approval", href: "/beneficiaries-approval", icon: UserCheck },
  { name: "Campaign List", href: "/beneficiaries-list", icon: Heart },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
      <div className={styles.logoContainer}>
        <div className={styles.logoMark}>
          <Image 
            src="/HopeCard%20Logo.png" 
            alt="HopeCard Logo" 
            width={45}  // Match the CSS width
            height={45} // Match the CSS height
            priority
            style={{ objectFit: "contain" }} // Ensures the logo isn't cropped if it's rectangular
          />
        </div>
        {!isCollapsed && <h1 className={styles.logoText}>HopeCard</h1>}
      </div>

      <nav className={styles.navMenu}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ""} ${isCollapsed ? styles.navItemCollapsed : ""}`}
              title={isCollapsed ? item.name : ""}
            >
              <Icon size={20} className={styles.icon} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={styles.bottomAction}>
        <button 
          className={`${styles.collapseBtn} ${isCollapsed ? styles.collapseBtnCenter : ""}`}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {!isCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}