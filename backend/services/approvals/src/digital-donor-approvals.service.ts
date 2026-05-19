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
   * Get all digital donor approvals from digital_donor_profiles table
   */
  async getAllApprovals(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: DigitalDonorApproval[]; total: number; page: number; limit: number }> {
    try {
      const offset = (page - 1) * limit;

      // Get total count
      const { count, error: countError } = await supabase
        .from('digital_donor_profiles')
        .select('*', { count: 'exact' });

      if (countError) {
        console.error('❌ Supabase error fetching count:', countError);
      }
      console.log('📊 Total donor count:', count);

      // Get paginated digital donors
      const { data, error } = await supabase
        .from('digital_donor_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('❌ Supabase error fetching approvals:', error);
        return { data: [], total: 0, page, limit };
      }

      console.log('✅ Fetched digital donor approvals:', data?.length || 0);
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
      
      const isUuid = (uuid: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
      const validAdminId = isUuid(adminId) ? adminId : null;

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

      // Update status
      const updatePayload: any = {
        status: 'approved',
        verified_by: validAdminId,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('📝 Update payload:', updatePayload);

      const { data, error } = await supabase
        .from('digital_donor_profiles')
        .update(updatePayload)
        .eq('id', donorId)
        .select();

      if (error) {
        console.error('❌ Supabase error approving digital donor:', error);
        return { success: false, message: `Failed to approve digital donor: ${error.message}` };
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ No rows updated for digital donor approval:', donorId);
        return { success: false, message: 'No record found with that ID' };
      }

      console.log('✅ Digital donor approved:', donorId);
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
      
      const isUuid = (uuid: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
      const validAdminId = isUuid(adminId) ? adminId : null;

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

      // Update status
      const updatePayload: any = {
        status: 'rejected',
        rejection_reason: reason || null,
        verified_by: validAdminId,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('📝 Update payload:', updatePayload);

      const { data, error } = await supabase
        .from('digital_donor_profiles')
        .update(updatePayload)
        .eq('id', donorId)
        .select();

      if (error) {
        console.error('❌ Supabase error rejecting digital donor:', error);
        return { success: false, message: `Failed to reject digital donor: ${error.message}` };
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ No rows updated for digital donor rejection:', donorId);
        return { success: false, message: 'No record found with that ID' };
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
