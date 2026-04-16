import { Injectable } from '@nestjs/common';
import { supabase } from '@shared/supabaseClient';
import { ActivityLogger } from '@shared/activity-logger';

export interface DigitalDonorApproval {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: string;
  created_at: string;
  [key: string]: any;
}

@Injectable()
export class DigitalDonorApprovalsService {
  constructor(private readonly activityService: ActivityLogger) {}

  /**
   * Get all pending digital donor approvals from digital_donor_profiles table
   */
  async getPendingApprovals(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: DigitalDonorApproval[]; total: number; page: number; limit: number }> {
    try {
      const offset = (page - 1) * limit;

      // Get total count - only check status column
      const { count, error: countError } = await supabase
        .from('digital_donor_profiles')
        .select('*', { count: 'exact' })
        .eq('status', 'pending');

      if (countError) {
        console.error('❌ Supabase error fetching count:', countError);
      }
      console.log('📊 Total pending count:', count);

      // Get paginated pending digital donors
      const { data, error } = await supabase
        .from('digital_donor_profiles')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('❌ Supabase error fetching pending approvals:', error);
        return { data: [], total: 0, page, limit };
      }

      console.log('✅ Fetched pending digital donor approvals:', data?.length || 0);
      console.log('📋 Data sample:', data?.[0]);
      
      // Log all donors to check auth_user_id
      if (data && data.length > 0) {
        data.forEach((donor, idx) => {
          console.log(`[${idx}] Donor: id=${donor.id}, name=${donor.name}, email=${donor.email}, auth_user_id=${donor.auth_user_id}`);
        });
      }
      
      return { data: data || [], total: count || 0, page, limit };
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      return { data: [], total: 0, page, limit };
    }
  }

  /**
   * Approve a digital donor application from digital_donor_profiles table
   */
  async approveDonor(
    donorId: string,
    adminId: string,
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      console.log('🔍 Starting approval - Params:', { donorId, adminId });
      
      // First, verify the donor exists
      const { data: existingDonor, error: fetchError } = await supabase
        .from('digital_donor_profiles')
        .select('*')
        .eq('id', donorId)
        .single();

      if (fetchError) {
        console.error('❌ Error fetching donor:', fetchError);
        return { success: false, message: 'Donor not found' };
      }

      console.log('✅ Found donor:', { id: existingDonor?.id, name: existingDonor?.name, currentStatus: existingDonor?.status });

      // Update status - same logic as reject
      const updatePayload: any = {
        status: 'approved',
        updated_at: new Date().toISOString(),
      };

      console.log('📝 Update payload:', updatePayload);

      const { data, error } = await supabase
        .from('digital_donor_profiles')
        .update(updatePayload)
        .eq('id', donorId)
        .select();

      console.log('📊 Update response - Error:', error, 'Data rows affected:', data?.length);

      if (error) {
        console.error('❌ Supabase error approving digital donor:', error);
        return { success: false, message: `Failed to approve digital donor: ${error.message}` };
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ Update returned no rows - checking final state');
        const { data: finalCheck } = await supabase
          .from('digital_donor_profiles')
          .select('status')
          .eq('id', donorId)
          .single();
        console.log('📋 Final check - Status after update:', finalCheck);
      }

      console.log('✅ Digital donor approved:', donorId, 'New data:', data?.[0]);
      return {
        success: true,
        message: 'Digital donor approved successfully',
        data: data?.[0],
      };
    } catch (error) {
      console.error('❌ Error approving digital donor:', error);
      return { success: false, message: 'Error approving digital donor' };
    }
  }

  /**
   * Reject a digital donor application from digital_donor_profiles table
   */
  async rejectDonor(
    donorId: string,
    adminId: string,
    reason?: string,
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      console.log('🔍 Starting rejection - Params:', { donorId, adminId, reason });
      
      // First, verify the donor exists
      const { data: existingDonor, error: fetchError } = await supabase
        .from('digital_donor_profiles')
        .select('*')
        .eq('id', donorId)
        .single();

      if (fetchError) {
        console.error('❌ Error fetching donor:', fetchError);
        return { success: false, message: 'Donor not found' };
      }

      console.log('✅ Found donor:', { id: existingDonor?.id, name: existingDonor?.name, currentStatus: existingDonor?.status });

      // Update status - same structure as approve
      const updatePayload: any = {
        status: 'rejected',
        rejection_reason: reason || null,
        updated_at: new Date().toISOString(),
      };

      console.log('📝 Update payload:', updatePayload);

      const { data, error } = await supabase
        .from('digital_donor_profiles')
        .update(updatePayload)
        .eq('id', donorId)
        .select();

      console.log('📊 Update response - Error:', error, 'Data rows affected:', data?.length);

      if (error) {
        console.error('❌ Supabase error rejecting digital donor:', error);
        return { success: false, message: `Failed to reject digital donor: ${error.message}` };
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ Update returned no rows - checking final state');
        const { data: finalCheck } = await supabase
          .from('digital_donor_profiles')
          .select('status')
          .eq('id', donorId)
          .single();
        console.log('📋 Final check - Status after update:', finalCheck);
      }

      console.log('✅ Digital donor rejected:', donorId, 'New data:', data?.[0]);
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
   * Get approval history for a digital donor from digital_donor_profiles table
   */
  async getApprovalHistory(donorId: string): Promise<{ status: string; verified_by?: string; verified_at?: string; rejection_reason?: string }> {
    try {
      const { data, error } = await supabase
        .from('digital_donor_profiles')
        .select('status')
        .eq('id', donorId)
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
}
