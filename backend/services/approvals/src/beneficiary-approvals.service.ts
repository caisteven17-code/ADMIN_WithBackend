import { Injectable } from '@nestjs/common';
import { supabase } from '@shared/supabaseClient';
import { ActivityLogger } from '@shared/activity-logger';

export interface BeneficiaryApproval {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  created_at: string;
  [key: string]: any;
}

@Injectable()
export class BeneficiaryApprovalsService {
  constructor(private readonly activityService: ActivityLogger) {}

  /**
   * Get all pending beneficiary approvals from beneficiary_profiles table
   */
  async getPendingApprovals(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: BeneficiaryApproval[]; total: number; page: number; limit: number }> {
    try {
      const offset = (page - 1) * limit;

      // Get total count of pending
      const { count } = await supabase
        .from('beneficiary_profiles')
        .select('*', { count: 'exact' })
        .eq('status', 'pending');

      // Get paginated pending beneficiaries
      const { data, error } = await supabase
        .from('beneficiary_profiles')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Supabase error fetching pending approvals:', error);
        return { data: [], total: 0, page, limit };
      }

      console.log('✅ Pending beneficiary approvals:', count);
      
      // Fetch user emails from auth.users for beneficiaries that don't have email
      const beneficiariesWithEmail = await Promise.all(
        (data || []).map(async (beneficiary) => {
          if (beneficiary.email) {
            return beneficiary;
          }
          
          if (beneficiary.auth_user_id) {
            const { data: authUser } = await supabase
              .from('auth.users')
              .select('email')
              .eq('id', beneficiary.auth_user_id)
              .single();
            
            if (authUser?.email) {
              return { ...beneficiary, email: authUser.email };
            }
          }
          return beneficiary;
        })
      );
      
      return { data: beneficiariesWithEmail || [], total: count || 0, page, limit };
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      return { data: [], total: 0, page, limit };
    }
  }

  /**
   * Approve a beneficiary application from beneficiary_profiles table
   */
  async approveBeneficiary(
    beneficiaryId: string,
    adminId: string,
    adminEmail?: string,
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // Get beneficiary name for activity log
      const { data: beneficiaryData } = await supabase
        .from('beneficiary_profiles')
        .select('first_name, last_name')
        .eq('id', beneficiaryId)
        .single();

      const { data, error } = await supabase
        .from('beneficiary_profiles')
        .update({
          status: 'approved',
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
   * Reject a beneficiary application from beneficiary_profiles table
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
        .from('beneficiary_profiles')
        .select('first_name, last_name')
        .eq('id', beneficiaryId)
        .single();

      const { data, error } = await supabase
        .from('beneficiary_profiles')
        .update({
          status: 'rejected',
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
   * Get approval history for a beneficiary from beneficiary_profiles table
   */
  async getApprovalHistory(beneficiaryId: string): Promise<{ status: string; verified_by?: string; verified_at?: string; rejection_reason?: string }> {
    try {
      const { data, error } = await supabase
        .from('beneficiary_profiles')
        .select('status')
        .eq('id', beneficiaryId)
        .single();

      if (error) {
        console.error('Error fetching approval history:', error);
        return { status: 'unknown' };
      }

      return {
        status: data?.status || 'unknown',
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
        .from('beneficiary_profiles')
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
