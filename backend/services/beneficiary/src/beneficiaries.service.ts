import { Injectable } from '@nestjs/common';
import { supabase } from '@shared/supabaseClient';
import { ActivityLogger } from '@shared/activity-logger';

export interface Beneficiary {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  updated_at?: string;
  [key: string]: any;
}

@Injectable()
export class BeneficiariesService {
  constructor(private readonly activityService: ActivityLogger) {}
  async getAllBeneficiaries(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Beneficiary[]; total: number; page: number; limit: number }> {
    try {
      const offset = (page - 1) * limit;

      // Get total count from hc_campaigns table
      const { count } = await supabase
        .from('hc_campaigns')
        .select('*', { count: 'exact', head: true });

      // Get paginated data from hc_campaigns
      const { data, error } = await supabase
        .from('hc_campaigns')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('❌ Error fetching campaigns for beneficiaries list:', error);
        throw new Error(`Failed to fetch campaigns: ${error.message}`);
      }

      // Fetch manager names
      const managerIds = [...new Set(data?.map(c => c.created_by).filter(id => id))];
      let managersMap: Record<string, string> = {};
      
      if (managerIds.length > 0) {
        const { data: managers } = await supabase
          .from('campaign_manager_profiles')
          .select('id, first_name, last_name, full_name, organization_name')
          .in('id', managerIds);
          
        if (managers) {
          managersMap = managers.reduce((acc, m) => {
            const name = (m.first_name ? `${m.first_name} ${m.last_name || ''}`.trim() : m.full_name);
            acc[m.id] = name || m.organization_name || 'Unknown Manager';
            return acc;
          }, {} as Record<string, string>);
        }
      }

      const formattedData = (data || []).map(campaign => ({
        id: campaign.id,
        first_name: campaign.title, // Maps to 'Beneficiary' column on frontend
        last_name: '',              // Combined with first_name
        campaign: campaign.title,   // Maps to 'Campaign Name' column
        campaign_manager_name: campaign.created_by ? managersMap[campaign.created_by] || 'Unknown Manager' : 'Unknown Manager',
        allocated_amount: campaign.collected_amount, // Maps to 'Amount Allocated'
        status: campaign.status,
        verification_status: campaign.status, // Fallback for frontend
        created_at: campaign.created_at,
      }));

      console.log(`✅ Retrieved ${data?.length || 0} campaigns masquerading as beneficiaries from ${count || 0} total`);
      return {
        data: formattedData as unknown as Beneficiary[],
        total: count || 0,
        page,
        limit,
      };
    } catch (error) {
      console.error('❌ Exception in getAllBeneficiaries:', error);
      throw error;
    }
  }

  async getBeneficiaryById(id: string): Promise<Beneficiary> {
    try {
      const { data, error } = await supabase
        .from('beneficiary_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Error fetching beneficiary:', error);
        throw new Error(`Failed to fetch beneficiary: ${error.message}`);
      }

      if (!data) {
        console.warn(`⚠️ Beneficiary not found: ${id}`);
        throw new Error('Beneficiary not found');
      }

      console.log(`✅ Retrieved beneficiary: ${data.first_name} ${data.last_name}`);
      return data;
    } catch (error) {
      console.error('❌ Exception in getBeneficiaryById:', error);
      throw error;
    }
  }

  async getBeneficiariesByStatus(
    status: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Beneficiary[]; total: number; page: number; limit: number }> {
    try {
      const offset = (page - 1) * limit;

      // Get total count for this status from beneficiary_profiles
      const { count } = await supabase
        .from('beneficiary_profiles')
        .select('*', { count: 'exact' })
        .eq('status', status);

      // Get paginated data
      const { data, error } = await supabase
        .from('beneficiary_profiles')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('❌ Error fetching beneficiaries by status:', error);
        throw new Error(`Failed to fetch beneficiaries: ${error.message}`);
      }

      console.log(`✅ Retrieved ${data?.length || 0} beneficiaries with status '${status}'`);
      return {
        data: data || [],
        total: count || 0,
        page,
        limit,
      };
    } catch (error) {
      console.error('❌ Exception in getBeneficiariesByStatus:', error);
      throw error;
    }
  }

  async searchBeneficiaries(
    query: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Beneficiary[]; total: number; page: number; limit: number }> {
    try {
      const offset = (page - 1) * limit;
      const searchQuery = `%${query}%`;

      // Count total matching records from beneficiary_profiles
      const { count } = await supabase
        .from('beneficiary_profiles')
        .select('*', { count: 'exact' })
        .or(`first_name.ilike.${searchQuery},last_name.ilike.${searchQuery},email.ilike.${searchQuery}`);

      // Get paginated data
      const { data, error } = await supabase
        .from('beneficiary_profiles')
        .select('*')
        .or(`first_name.ilike.${searchQuery},last_name.ilike.${searchQuery},email.ilike.${searchQuery}`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('❌ Error searching beneficiaries:', error);
        throw new Error(`Failed to search beneficiaries: ${error.message}`);
      }

      console.log(`✅ Found ${data?.length || 0} beneficiaries matching '${query}'`);
      return {
        data: data || [],
        total: count || 0,
        page,
        limit,
      };
    } catch (error) {
      console.error('❌ Exception in searchBeneficiaries:', error);
      throw error;
    }
  }

  async createBeneficiary(beneficiaryData: Partial<Beneficiary>): Promise<Beneficiary> {
    try {
      const { data, error } = await supabase
        .from('beneficiary_profiles')
        .insert([beneficiaryData])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating beneficiary:', error);
        throw new Error(`Failed to create beneficiary: ${error.message}`);
      }

      console.log(`✅ Created beneficiary: ${data.first_name} ${data.last_name}`);

      // Log activity when beneficiary applies (status is pending)
      if (data.verification_status === 'pending' || data.status === 'pending') {
        try {
          await this.activityService.logActivity({
            admin_id: 'system',
            admin_email: data.email,
            action: 'APPLIED',
            description: `New beneficiary application from ${data.first_name} ${data.last_name}`,
            resource_type: 'beneficiary',
            resource_id: data.id,
          });
        } catch (activityError) {
          console.warn('Failed to log activity for new beneficiary application:', activityError);
        }
      }

      return data;
    } catch (error) {
      console.error('❌ Exception in createBeneficiary:', error);
      throw error;
    }
  }

  async updateBeneficiary(
    id: string,
    updates: Partial<Beneficiary>,
  ): Promise<Beneficiary> {
    try {
      const { data, error } = await supabase
        .from('beneficiary_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating beneficiary:', error);
        throw new Error(`Failed to update beneficiary: ${error.message}`);
      }

      if (!data) {
        throw new Error('Beneficiary not found');
      }

      console.log(`✅ Updated beneficiary: ${data.first_name} ${data.last_name}`);
      return data;
    } catch (error) {
      console.error('❌ Exception in updateBeneficiary:', error);
      throw error;
    }
  }

  async deleteBeneficiary(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('beneficiary_profiles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting beneficiary:', error);
        throw new Error(`Failed to delete beneficiary: ${error.message}`);
      }

      console.log(`✅ Deleted beneficiary: ${id}`);
      return { success: true, message: 'Beneficiary deleted successfully' };
    } catch (error) {
      console.error('❌ Exception in deleteBeneficiary:', error);
      throw error;
    }
  }
}
