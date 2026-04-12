import { Injectable } from '@nestjs/common';
import { supabase } from '../lib/supabaseClient';

export interface CampaignManagerApproval {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  verification_status: string;
  created_at: string;
  [key: string]: any;
}

@Injectable()
export class CampaignManagerApprovalsService {
  /**
   * Get all pending campaign manager approvals from user_profiles table
   */
  async getPendingApprovals(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: CampaignManagerApproval[]; total: number; page: number; limit: number }> {
    try {
      const offset = (page - 1) * limit;

      // Get total count of pending
      const { count } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact' })
        .eq('role', 'campaign_manager')
        .eq('verification_status', 'pending');

      // Get paginated pending campaign managers
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'campaign_manager')
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Supabase error fetching pending approvals:', error);
        return { data: [], total: 0, page, limit };
      }

      console.log('✅ Pending campaign manager approvals:', count);
      return { data: data || [], total: count || 0, page, limit };
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      return { data: [], total: 0, page, limit };
    }
  }

  /**
   * Approve a campaign manager application from user_profiles table
   */
  async approveCampaignManager(
    campaignManagerId: string,
    adminId: string,
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          verification_status: 'verified',
          verified_by: adminId,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', campaignManagerId)
        .select();

      if (error) {
        console.error('Supabase error approving campaign manager:', error);
        return { success: false, message: 'Failed to approve campaign manager' };
      }

      console.log('✅ Campaign manager approved:', campaignManagerId);
      return {
        success: true,
        message: 'Campaign manager approved successfully',
        data: data?.[0],
      };
    } catch (error) {
      console.error('Error approving campaign manager:', error);
      return { success: false, message: 'Error approving campaign manager' };
    }
  }

  /**
   * Reject a campaign manager application from user_profiles table
   */
  async rejectCampaignManager(
    campaignManagerId: string,
    adminId: string,
    reason?: string,
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          verification_status: 'rejected',
          verified_by: adminId,
          verified_at: new Date().toISOString(),
          rejection_reason: reason || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', campaignManagerId)
        .select();

      if (error) {
        console.error('Supabase error rejecting campaign manager:', error);
        return { success: false, message: 'Failed to reject campaign manager' };
      }

      console.log('✅ Campaign manager rejected:', campaignManagerId);
      return {
        success: true,
        message: 'Campaign manager rejected successfully',
        data: data?.[0],
      };
    } catch (error) {
      console.error('Error rejecting campaign manager:', error);
      return { success: false, message: 'Error rejecting campaign manager' };
    }
  }

  /**
   * Get approval history for a campaign manager from user_profiles table
   */
  async getApprovalHistory(campaignManagerId: string): Promise<{ status: string; verified_by?: string; verified_at?: string; rejection_reason?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('verification_status, verified_by, verified_at, rejection_reason')
        .eq('id', campaignManagerId)
        .single();

      if (error) {
        console.error('Error fetching approval history:', error);
        return { status: 'unknown' };
      }

      return {
        status: data?.verification_status || 'unknown',
        verified_by: data?.verified_by,
        verified_at: data?.verified_at,
        rejection_reason: data?.rejection_reason,
      };
    } catch (error) {
      console.error('Error fetching approval history:', error);
      return { status: 'unknown' };
    }
  }
}
