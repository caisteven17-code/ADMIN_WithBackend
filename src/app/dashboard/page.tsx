"use client";

import { useState, useEffect } from "react";
import { Users, CheckCircle, DollarSign, Target } from "lucide-react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { getBackendUrlCached } from "@/lib/backend-discovery";
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

interface DashboardStats {
  id: number;
  title: string;
  value: string | number;
  icon: string;
}

interface Activity {
  id: string;
  action: string;
  subject: string;
  time: string;
  type: string;
  status: string;
}

export default function Dashboard() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [dashboardStats, setDashboardStats] = useState<DashboardStats[]>([
    { id: 1, title: "Total Beneficiaries", value: "-", icon: "Users" },
    { id: 2, title: "Pending Approvals", value: "-", icon: "CheckCircle" },
    { id: 3, title: "Total Donations Sent", value: "-", icon: "DollarSign" },
    { id: 4, title: "Active Campaigns", value: "-", icon: "Target" },
  ]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      let timeoutId: NodeJS.Timeout | null = null;
      try {
        setLoading(true);
        setError(null);
        
        // Dynamically discover backend URL
        const backendUrl = await getBackendUrlCached();
        
        // Get JWT token from localStorage
        const token = localStorage.getItem('admin_token');
        
        console.log("🔍 Fetching from:", `${backendUrl}/api/dashboard/metrics`);
        console.log("🔐 Using token:", token ? "✓ Present" : "✗ Missing");
        
        // First, check if backend is reachable via health endpoint
        try {
          console.log("🏥 Checking backend health...");
          const healthResponse = await fetch(`${backendUrl}/api/health`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          
          if (!healthResponse.ok) {
            throw new Error(`Health check failed: ${healthResponse.status}`);
          }
          const healthData = await healthResponse.json();
          console.log("✅ Backend is healthy:", healthData);
        } catch (healthErr) {
          const healthErrMsg = healthErr instanceof Error ? healthErr.message : String(healthErr);
          console.warn("⚠️  Backend health check failed:", healthErrMsg);
          throw new Error(`Backend not responding - ${healthErrMsg}`);
        }
        
        const controller = new AbortController();
        // Increase timeout to 30 seconds for first load
        timeoutId = setTimeout(() => {
          console.warn("⏱️  Dashboard request timeout - aborting");
          controller.abort();
        }, 30000);
        
        const response = await fetch(`${backendUrl}/api/dashboard/metrics`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
          signal: controller.signal,
        });
        
        if (timeoutId) clearTimeout(timeoutId);
        console.log("📊 Response status:", response.status, response.statusText);
        
        if (!response.ok) {
          try {
            const errorData = await response.json();
            console.error("📋 Backend error response:", errorData);
            throw new Error(`Backend error (${response.status}): ${errorData.message || response.statusText}`);
          } catch (parseErr) {
            throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
          }
        }
        
        const response_data = await response.json();
        console.log("📊 Response data:", response_data);
        
        const data = response_data.data || response_data;
        setDashboardStats([
          { id: 1, title: "Total Beneficiaries", value: data.totalBeneficiaries, icon: "Users" },
          { id: 2, title: "Pending Approvals", value: data.pendingApprovals, icon: "CheckCircle" },
          { id: 3, title: "Total Donations Sent", value: data.totalDonationsSent, icon: "DollarSign" },
          { id: 4, title: "Active Campaigns", value: data.activeCampaigns, icon: "Target" },
        ]);
      } catch (err) {
        if (timeoutId) clearTimeout(timeoutId);
        
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error("❌ Error fetching dashboard metrics:", errorMsg);
        
        // Use mock data as fallback
        console.log("📋 Using mock data as fallback...");
        setDashboardStats([
          { id: 1, title: "Total Beneficiaries", value: 245, icon: "Users" },
          { id: 2, title: "Pending Approvals", value: 12, icon: "CheckCircle" },
          { id: 3, title: "Total Donations Sent", value: "₱125,450.00", icon: "DollarSign" },
          { id: 4, title: "Active Campaigns", value: 8, icon: "Target" },
        ]);
        
        // Show error in development mode, hide in production
        if (process.env.NODE_ENV === "development") {
          console.log("🔧 Development mode - showing error for debugging");
          setError(`Backend Error: ${errorMsg}`);
        } else {
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchActivities = async () => {
      try {
        // Dynamically discover backend URL
        const backendUrl = await getBackendUrlCached();
        const token = localStorage.getItem('admin_token');
        
        console.log("🔍 Fetching activities from:", `${backendUrl}/api/activity`);
        
        const response = await fetch(`${backendUrl}/api/activity?page=1&limit=50`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch activities: ${response.status}`);
        }
        
        const activityData = await response.json();
        console.log("📊 Activities fetched:", activityData);
        
        // Convert backend activity data to display format
        const formattedActivities: Activity[] = (activityData.data || []).map((activity: any) => {
          const createdAt = new Date(activity.created_at);
          const now = new Date();
          const diff = now.getTime() - createdAt.getTime();
          const minutes = Math.floor(diff / 60000);
          const hours = Math.floor(diff / 3600000);
          const days = Math.floor(diff / 86400000);
          
          let timeStr = "just now";
          if (minutes < 60) {
            timeStr = `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
          } else if (hours < 24) {
            timeStr = `${hours} hour${hours !== 1 ? 's' : ''} ago`;
          } else if (days < 7) {
            timeStr = `${days} day${days !== 1 ? 's' : ''} ago`;
          }
          
          // Determine activity type and format
          let type = "approval";
          let actionText = activity.description;
          let status = activity.action || "Activity";
          
          if (activity.action === "APPROVED") {
            type = "approval";
            status = "Approved";
          } else if (activity.action === "REJECTED") {
            type = "rejection";
            status = "Rejected";
          } else if (activity.action === "APPLIED") {
            type = "approval";
            status = "Applied";
          } else if (activity.action === "SENT") {
            type = "donation";
            status = "Sent";
          }
          
          return {
            id: activity.id || Math.random().toString(),
            action: actionText.split(" ").slice(0, -1).join(" "),
            subject: actionText.split(" ").slice(-1)[0],
            time: timeStr,
            type,
            status,
          };
        });
        
        setActivities(formattedActivities);
      } catch (err) {
        console.error("❌ Error fetching activities:", err);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    fetchActivities();
  }, []);

  const filters = ["All", "Approvals", "Rejections", "Donations Sent"];

  // Filter activities based on active filter
  const filteredActivities = activities.filter((activity) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Approvals" && (activity.type === "approval" || activity.type === "applied")) return true;
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

      {error && (
        <div className={styles.errorContainer} style={{ 
          padding: "20px", 
          backgroundColor: "#fce4ec", 
          borderRadius: "8px", 
          borderLeft: "4px solid #c2185b",
          marginBottom: "20px"
        }}>
          <p style={{ color: "#c2185b", margin: 0 }}>Error: {error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {dashboardStats.map((stat) => (
          <div key={stat.id} className={styles.statCard}>
            <div className={styles.iconWrapper}>
              {loading ? (
                <div className={styles.skeletonIcon}></div>
              ) : (
                renderIcon(stat.icon)
              )}
            </div>
            <h2 className={styles.statValue}>
              {loading ? (
                <span className={styles.skeletonText}></span>
              ) : (
                stat.value
              )}
            </h2>
            <p className={styles.statLabel}>
              {loading ? (
                <span className={styles.skeletonLabel}></span>
              ) : (
                stat.title
              )}
            </p>
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
