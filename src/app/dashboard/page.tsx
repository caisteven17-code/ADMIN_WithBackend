"use client";

import { useState } from "react";
import { Users, CheckCircle, DollarSign, Target } from "lucide-react";
import { dashboardStats, recentActivities } from "@/lib/mockData";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import styles from "./page.module.css";

// Helper function to render the correct icon
const renderIcon = (iconName: string) => {
  switch (iconName) {
    case "Users": return <Users size={24} />;
    case "CheckCircle": return <CheckCircle size={24} />;
    case "DollarSign": return <DollarSign size={24} />;
    case "Target": return <Target size={24} />;
    default: return <Users size={24} />;
  }
};

export default function Dashboard() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Approvals", "Rejections", "Donations Sent"];

  // Simple visual filter logic
  const filteredActivities = recentActivities.filter((activity) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Approvals" && activity.type === "approval") return true;
    if (activeFilter === "Rejections" && activity.type === "rejection") return true;
    if (activeFilter === "Donations Sent" && activity.type === "donation") return true;
    return false;
  });

  return (
    <ProtectedRoute>
      <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard Overview</h1>
        <p className={styles.subtitle}>Monitor your platform activity and key metrics</p>
      </header>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {dashboardStats.map((stat) => (
          <div key={stat.id} className={styles.statCard}>
            <div className={styles.iconWrapper}>
              {renderIcon(stat.icon)}
            </div>
            <h2 className={styles.statValue}>{stat.value}</h2>
            <p className={styles.statLabel}>{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <section className={styles.activitySection}>
        <div className={styles.activityHeader}>
          <h3>Recent Activity</h3>
          <div className={styles.filters}>
            {filters.map((filter) => (
              <button
                key={filter}
                className={`${styles.filterBtn} ${activeFilter === filter ? styles.active : ""}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.activityList}>
          {filteredActivities.map((activity, index) => (
            <div key={activity.id} className={styles.activityItem}>
              {/* The visual timeline dot */}
              <div className={`${styles.timelineDot} ${styles[activity.type]}`}></div>
              
              <div className={`${styles.activityContent} ${index !== filteredActivities.length - 1 ? styles.hasBorder : ""}`}>
                <span className={styles.time}>{activity.time}</span>
                <p className={styles.actionText}>
                  {activity.action} <strong>{activity.subject}</strong>
                </p>
                <span className={`${styles.badge} ${styles[`badge-${activity.type}`]}`}>
                  • {activity.status}
                </span>
              </div>
            </div>
          ))}
          {filteredActivities.length === 0 && (
            <p className={styles.noData}>No recent activity found for this filter.</p>
          )}
        </div>
      </section>
    </div>
    </ProtectedRoute>
  );
}
