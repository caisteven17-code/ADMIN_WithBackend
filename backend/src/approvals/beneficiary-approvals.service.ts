import { Injectable } from '@nestjs/common';
import { supabase } from '../lib/supabaseClient';
import { ActivityService } from '../activity/activity.service';

export interface BeneficiaryApproval {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  verification_status: string;
  created_at: string;
  [key: string]: any;
}

@Injectable()
export class BeneficiaryApprovalsService {
  constructor(private readonly activityService: ActivityService) {}

  /**
   * Get all pending beneficiary approvals from user_profiles table
   */
  async getPendingApprovals(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: BeneficiaryApproval[]; total: number; page: number; limit: number }> {
    try {
      const offset = (page - 1) * limit;

      // Get total count of pending
      const { count } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact' })
        .eq('role', 'beneficiary')
        .eq('verification_status', 'pending');

      // Get paginated pending beneficiaries
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'beneficiary')
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Supabase error fetching pending approvals:', error);
        return { data: [], total: 0, page, limit };
      }

      console.log('✅ Pending beneficiary approvals:', count);
      return { data: data || [], total: count || 0, page, limit };
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      return { data: [], total: 0, page, limit };
    }
  }

  /**
   * Approve a beneficiary application from user_profiles table
   */
  async approveBeneficiary(
    beneficiaryId: string,
    adminId: string,
    adminEmail?: string,
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // Get beneficiary name for activity log
      const { data: beneficiaryData } = await supabase
        .from('user_profiles')
        .select('first_name, last_name')
        .eq('id', beneficiaryId)
        .single();

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          verification_status: 'verified',
          verified_by: adminId,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', beneficiaryId)
        .select();

      if (error) {
        console.error('Supabase error approving beneficiary:', error);
        return { success: false, message: 'Failed to approve beneficiary' };
      }

      // Log activity
      try {
        await this.activityService.logActivity({
          admin_id: adminId,
          admin_email: adminEmail || 'admin@hopecard.com',
          action: 'APPROVED',
          description: `Approved beneficiary application: ${beneficiaryData?.first_name} ${beneficiaryData?.last_name}`,
          resource_type: 'beneficiary',
          resource_id: beneficiaryId,
        });
      } catch (activityError) {
        console.warn('Failed to log activity, but approval succeeded:', activityError);
      }

      console.log('✅ Beneficiary approved:', beneficiaryId);
      return {
        success: true,
        message: 'Beneficiary approved successfully',
        data: data?.[0],
      };
    } catch (error) {
      console.error('Error approving beneficiary:', error);
      return { success: false, message: 'Error approving beneficiary' };
    }
  }

  /**
   * Reject a beneficiary application from user_profiles table
   */
  async rejectBeneficiary(
    beneficiaryId: string,
    adminId: string,
    reason?: string,
    adminEmail?: string,
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // Get beneficiary name for activity log
      const { data: beneficiaryData } = await supabase
        .from('user_profiles')
        .select('first_name, last_name')
        .eq('id', beneficiaryId)
        .single();

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          verification_status: 'rejected',
          verified_by: adminId,
          verified_at: new Date().toISOString(),
          rejection_reason: reason || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', beneficiaryId)
        .select();

      if (error) {
        console.error('Supabase error rejecting beneficiary:', error);
        return { success: false, message: 'Failed to reject beneficiary' };
      }

      // Log activity
      try {
        await this.activityService.logActivity({
          admin_id: adminId,
          admin_email: adminEmail || 'admin@hopecard.com',
          action: 'REJECTED',
          description: `Rejected beneficiary application: ${beneficiaryData?.first_name} ${beneficiaryData?.last_name}${reason ? ` - Reason: ${reason}` : ''}`,
          resource_type: 'beneficiary',
          resource_id: beneficiaryId,
        });
      } catch (activityError) {
        console.warn('Failed to log activity, but rejection succeeded:', activityError);
      }

      console.log('✅ Beneficiary rejected:', beneficiaryId);
      return {
        success: true,
        message: 'Beneficiary rejected successfully',
        data: data?.[0],
      };
    } catch (error) {
      console.error('Error rejecting beneficiary:', error);
      return { success: false, message: 'Error rejecting beneficiary' };
    }
  }

  /**
   * Get approval history for a beneficiary from user_profiles table
   */
  async getApprovalHistory(beneficiaryId: string): Promise<{ status: string; verified_by?: string; verified_at?: string; rejection_reason?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('verification_status, verified_by, verified_at, rejection_reason')
        .eq('id', beneficiaryId)
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

  /**
   * Send/process a donation to a beneficiary
   */
  async sendDonation(
    beneficiaryId: string,
    adminId: string,
    donationData: {
      amount: number;
      campaign?: string;
      notes?: string;
    },
    adminEmail?: string,
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // Get beneficiary details for logging
      const { data: beneficiaryData } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, email, allocated_amount')
        .eq('id', beneficiaryId)
        .single();

      if (!beneficiaryData) {
        return { success: false, message: 'Beneficiary not found' };
      }

      // Insert donation record into hopecard_purchases table
      const { data, error } = await supabase
        .from('hopecard_purchases')
        .insert([
          {
            beneficiary_id: beneficiaryId,
            amount_paid: donationData.amount,
            campaign: donationData.campaign || 'General Aid',
            notes: donationData.notes || '',
            processed_by: adminId,
            processed_at: new Date().toISOString(),
            status: 'completed',
          },
        ])
        .select();

      if (error) {
        console.error('Supabase error creating donation record:', error);
        return { success: false, message: 'Failed to record donation' };
      }

      // Log activity
      try {
        await this.activityService.logActivity({
          admin_id: adminId,
          admin_email: adminEmail || 'admin@hopecard.com',
          action: 'DONATION_SENT',
          description: `Sent donation of ₱${donationData.amount} to ${beneficiaryData.first_name} ${beneficiaryData.last_name}`,
          resource_type: 'donation',
          resource_id: beneficiaryId,
        });
      } catch (activityError) {
        console.warn('Failed to log activity, but donation was recorded:', activityError);
      }

      console.log('✅ Donation recorded for beneficiary:', beneficiaryId);
      return {
        success: true,
        message: 'Donation sent successfully',
        data: data?.[0],
      };
    } catch (error) {
      console.error('Error sending donation:', error);
      return { success: false, message: 'Error processing donation' };
    }
  }
}
