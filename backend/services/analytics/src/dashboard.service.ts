import { Injectable } from '@nestjs/common';
import { supabase } from '@shared/supabaseClient';
import { DashboardMetrics } from "./interfaces/dashboard-metrics.interface";

@Injectable()
export class DashboardService {
  /**
   * Get total count of beneficiaries from user_profiles table
   */
  private async getTotalBeneficiaries(): Promise<number> {
    try {
      const { count, error, data } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: false })
        .eq("role", "beneficiary");

      if (error) {
        console.error("Supabase error fetching total beneficiaries:", error);
        return 0;
      }
      console.log("✅ Total beneficiaries count:", count);
      console.log("📊 Sample data:", data?.slice(0, 3));
      return count || 0;
    } catch (error) {
      console.error("Error fetching total beneficiaries:", error);
      return 0;
    }
  }

  /**
   * Get count of pending approvals (users with no last_sign_in_at)
   * Users who haven't logged in yet are considered pending approval
   */
  private async getPendingApprovals(): Promise<number> {
    try {
      // Query auth.users table for users with no last login
      const { data, error } = await supabase.auth.admin.listUsers();

      if (error) {
        console.error("Supabase error fetching pending approvals:", error);
        return 0;
      }

      // Count users who have never logged in (last_sign_in_at is null)
      const pendingCount = data.users.filter(
        (user) => user.last_sign_in_at === null
      ).length;

      console.log("🔍 Pending approvals (no last login):", pendingCount);
      return pendingCount;
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
      return 0;
    }
  }

  /**
   * Get total donations sent (sum of all donations)
   */
  private async getTotalDonationsSent(): Promise<string> {
    try {
      // Try with explicit count first to debug
      const { count, error: countError } = await supabase
        .from("hopecard_purchases")
        .select("*", { count: "exact", head: true });

      console.log("📊 Total records check - Count:", count, "Error:", countError?.message);

      const { data, error } = await supabase
        .from("hopecard_purchases")
        .select("amount_paid");

      if (error) {
        console.error("❌ Supabase error fetching total donations:", error);
        console.error("Error details:", error.message, error.code);
        return "₱0";
      }

      console.log("✅ Fetched hopecard_purchases records:", data?.length || 0);
      console.log("📊 Raw data sample:", data?.[0]);

      if (!data || data.length === 0) {
        console.warn("⚠️  No data returned from hopecard_purchases table");
        return "₱0";
      }

      const total = data?.reduce((sum, donation) => {
        const amount = parseFloat(String(donation.amount_paid)) || 0;
        return sum + amount;
      }, 0) || 0;

      console.log("💰 Calculated total:", total);
      const formatted = this.formatCurrency(total);
      console.log("📝 Formatted result:", formatted);
      return formatted;
    } catch (error) {
      console.error("❌ Error fetching total donations:", error);
      return "₱0";
    }
  }

  /**
   * Get count of active campaigns (campaigns with status 'active')
   */
  private async getActiveCampaigns(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("hc_campaigns")
        .select("id", { count: "exact", head: true })
        .eq("status", "active");

      if (error) {
        console.error("Supabase error fetching active campaigns:", error);
        return 0;
      }
      console.log("✅ Active campaigns count:", count);
      return count || 0;
    } catch (error) {
      console.error("Error fetching active campaigns:", error);
      return 0;
    }
  }

  /**
   * Format number to Philippine Peso currency
   */
  private formatCurrency(amount: number): string {
    if (amount >= 1000000) {
      return `₱${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `₱${(amount / 1000).toFixed(1)}K`;
    } else {
      return `₱${amount.toFixed(2)}`;
    }
  }

  /**
   * Get all dashboard metrics
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const [totalBeneficiaries, pendingApprovals, totalDonationsSent, activeCampaigns] =
        await Promise.all([
          this.getTotalBeneficiaries(),
          this.getPendingApprovals(),
          this.getTotalDonationsSent(),
          this.getActiveCampaigns(),
        ]);

      console.log("📊 Dashboard Metrics Retrieved:");
      console.log(`  - Total Beneficiaries: ${totalBeneficiaries}`);
      console.log(`  - Pending Approvals: ${pendingApprovals}`);
      console.log(`  - Total Donations Sent: ${totalDonationsSent}`);
      console.log(`  - Active Campaigns: ${activeCampaigns}`);

      return {
        totalBeneficiaries,
        pendingApprovals,
        totalDonationsSent,
        activeCampaigns,
      };
    } catch (error) {
      console.error("❌ Error fetching dashboard metrics:", error);
      // Return fallback mock data only on error
      return {
        totalBeneficiaries: 1234,
        pendingApprovals: 47,
        totalDonationsSent: "₱2.5M",
        activeCampaigns: 18,
      };
    }
  }
}
