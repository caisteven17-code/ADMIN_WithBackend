import { Injectable } from '@nestjs/common';
import { supabase } from '../lib/supabaseClient';

export interface DigitalDonorApproval {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  verification_status: string;
  created_at: string;
  [key: string]: any;
}

@Injectable()
export class DigitalDonorApprovalsService {
  /**
   * Get all pending digital donor approvals from user_profiles table
   */
  async getPendingApprovals(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: DigitalDonorApproval[]; total: number; page: number; limit: number }> {
    try {
      const offset = (page - 1) * limit;

      // Get total count of pending
      const { count } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact' })
        .eq('role', 'digital_donor')
        .eq('verification_status', 'pending');

      // Get paginated pending digital donors
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'digital_donor')
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Supabase error fetching pending approvals:', error);
        return { data: [], total: 0, page, limit };
      }

      console.log('✅ Pending digital donor approvals:', count);
      return { data: data || [], total: count || 0, page, limit };
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      return { data: [], total: 0, page, limit };
    }
  }

  /**
   * Approve a digital donor application from user_profiles table
   */
  async approveDonor(
    donorId: string,
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
        .eq('id', donorId)
        .select();

      if (error) {
        console.error('Supabase error approving digital donor:', error);
        return { success: false, message: 'Failed to approve digital donor' };
      }

      console.log('✅ Digital donor approved:', donorId);
      return {
        success: true,
        message: 'Digital donor approved successfully',
        data: data?.[0],
      };
    } catch (error) {
      console.error('Error approving digital donor:', error);
      return { success: false, message: 'Error approving digital donor' };
    }
  }

  /**
   * Reject a digital donor application from user_profiles table
   */
  async rejectDonor(
    donorId: string,
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
        .eq('id', donorId)
        .select();

      if (error) {
        console.error('Supabase error rejecting digital donor:', error);
        return { success: false, message: 'Failed to reject digital donor' };
      }

      console.log('✅ Digital donor rejected:', donorId);
      return {
        success: true,
        message: 'Digital donor rejected successfully',
        data: data?.[0],
      };
    } catch (error) {
      console.error('Error rejecting digital donor:', error);
      return { success: false, message: 'Error rejecting digital donor' };
    }
  }

  /**
   * Get approval history for a digital donor from user_profiles table
   */
  async getApprovalHistory(donorId: string): Promise<{ status: string; verified_by?: string; verified_at?: string; rejection_reason?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('verification_status, verified_by, verified_at, rejection_reason')
        .eq('id', donorId)
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
