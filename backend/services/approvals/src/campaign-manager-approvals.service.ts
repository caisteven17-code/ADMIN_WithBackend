import { Injectable } from '@nestjs/common';
import { supabase } from '@shared/supabaseClient';
import { ActivityLogger } from '@shared/activity-logger';

export interface CampaignManagerApproval {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  status: string;
  created_at: string;
  sec_registration_url?: string;
  organizational_certificate_url?: string;
  [key: string]: any;
}

@Injectable()
export class CampaignManagerApprovalsService {
  constructor(private readonly activityService: ActivityLogger) {}

  /**
   * Get all campaign manager approvals from campaign_manager_profiles table
   */
  async getAllApprovals(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: CampaignManagerApproval[]; total: number; page: number; limit: number }> {
    try {
      const offset = (page - 1) * limit;

      // Get total count
      const { count } = await supabase
        .from('campaign_manager_profiles')
        .select('*', { count: 'exact' });

      // Get paginated campaign managers
      const { data, error } = await supabase
        .from('campaign_manager_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Supabase error fetching pending approvals:', error);
        return { data: [], total: 0, page, limit };
      }

      console.log('✅ Pending campaign manager approvals:', count);
      
      // Fetch user emails from auth.users for managers that don't have email
      const managersWithEmail = await Promise.all(
        (data || []).map(async (manager) => {
          // Construct public URLs for documents
          const getPublicUrl = (path: string) => {
            if (!path) return undefined;
            const { data: { publicUrl } } = supabase.storage
              .from('camp-man-files')
              .getPublicUrl(path);
            return publicUrl;
          };

          const mappedManager = {
            ...manager,
            organization: manager.organization_name,
            verification_status: manager.status,
            documents_verified: !!(manager.sec_registration && manager.organizational_certificate),
            sec_registration_url: getPublicUrl(manager.sec_registration),
            organizational_certificate_url: getPublicUrl(manager.organizational_certificate)
          };

          if (manager.email) {
            return mappedManager;
          }
          
          if (manager.auth_user_id) {
            const { data: authUser } = await supabase
              .from('auth.users')
              .select('email')
              .eq('id', manager.auth_user_id)
              .single();
            
            if (authUser?.email) {
              return {
                ...mappedManager,
                email: authUser.email,
              };
            }
          }
          return mappedManager;
        })
      );
      
      return { data: managersWithEmail || [], total: count || 0, page, limit };
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      return { data: [], total: 0, page, limit };
    }
  }

  /**
   * Approve a campaign manager application from campaign_manager_profiles table
   */
  async approveCampaignManager(
    campaignManagerId: string,
    adminId: string,
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // More permissive UUID regex
      const isUuid = (uuid: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
      const validAdminId = isUuid(adminId) ? adminId : null;
      
      console.log(`[SERVICE] Approving CM ${campaignManagerId} (adminId: ${adminId}, valid: ${validAdminId})`);

      const { data, error } = await supabase
        .from('campaign_manager_profiles')
        .update({
          status: 'approved',
          approved_by: validAdminId,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', campaignManagerId)
        .select();

      if (error) {
        console.error('❌ Supabase error approving campaign manager:', error);
        return { success: false, message: `Database error: ${error.message}` };
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ No rows updated for CM approval:', campaignManagerId);
        return { success: false, message: 'No record found with that ID' };
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
   * Reject a campaign manager application from campaign_manager_profiles table
   */
  async rejectCampaignManager(
    campaignManagerId: string,
    adminId: string,
    reason?: string,
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // More permissive UUID regex
      const isUuid = (uuid: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
      const validAdminId = isUuid(adminId) ? adminId : null;

      console.log(`[SERVICE] Rejecting CM ${campaignManagerId} (adminId: ${adminId}, valid: ${validAdminId})`);

      const { data, error } = await supabase
        .from('campaign_manager_profiles')
        .update({
          status: 'rejected',
          rejection_reason: reason || null,
          approved_by: validAdminId,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', campaignManagerId)
        .select();

      if (error) {
        console.error('❌ Supabase error rejecting campaign manager:', error);
        return { success: false, message: `Database error: ${error.message}` };
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ No rows updated for CM rejection:', campaignManagerId);
        return { success: false, message: 'No record found with that ID' };
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
   * Get approval history for a campaign manager from campaign_manager_profiles table
   */
  async getApprovalHistory(campaignManagerId: string): Promise<{ status: string; verified_by?: string; verified_at?: string; rejection_reason?: string }> {
    try {
      const { data, error } = await supabase
        .from('campaign_manager_profiles')
        .select('status')
        .eq('id', campaignManagerId)
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
