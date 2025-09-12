import { supabase } from './supabase';
import { QuoteFormData } from '@/types/quote';
import { CalculatedQuote } from './pricing';

// Extended quote interface for database storage
export interface StoredQuote {
  id: string;
  org_id: string;
  project_id: string;
  quote_number: string;
  status: 'draft' | 'customer_viewable' | 'reserved' | 'accepted' | 'expired' | 'cancelled';
  currency: string;
  
  // Totals in cents
  labour_subtotal_cents: number;
  materials_subtotal_cents: number;
  grand_total_cents: number;
  
  deposit_required_pct: number;
  initial_customer_viewed_at?: string;
  expires_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  
  // Related data
  project?: {
    id: string;
    name: string;
    address: any;
    building_type: 'house' | 'condo';
    customer: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
    };
  };
  
  labour_inputs?: {
    data: QuoteFormData;
  };
}

export interface QuoteSummary {
  id: string;
  quote_number: string;
  status: string;
  customer_name: string;
  project_address: string;
  grand_total: number;
  created_at: string;
  bathroom_type: string;
  building_type: string;
}

export class QuotesAPI {
  
  // Get contractor's organization ID
  static async getContractorOrgId(): Promise<string> {
    const { data: profile, error } = await supabase
      .from('contractor_profiles')
      .select('organization_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();
      
    if (error) throw new Error(`Failed to get contractor org: ${error.message}`);
    if (!profile?.organization_id) throw new Error('Contractor not associated with organization');
    
    return profile.organization_id;
  }
  
  // Create a new quote from form data
  static async createQuote(formData: QuoteFormData, calculatedQuote: CalculatedQuote): Promise<string> {
    try {
      const orgId = await this.getContractorOrgId();
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');
      
      // Create customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          org_id: orgId,
          name: formData.customer_name || 'Unknown Customer',
          email: formData.customer_email || null,
          phone: formData.customer_phone || null,
        })
        .select('id')
        .single();
        
      if (customerError) throw new Error(`Failed to create customer: ${customerError.message}`);
      
      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          org_id: orgId,
          customer_id: customer.id,
          name: `${formData.bathroom_type?.replace('_', ' ')} Renovation`,
          address: { full_address: formData.project_address || 'Address not provided' },
          building_type: formData.building_type || 'house',
          notes: `Quote created via contractor app`,
        })
        .select('id')
        .single();
        
      if (projectError) throw new Error(`Failed to create project: ${projectError.message}`);
      
      // Create quote
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          org_id: orgId,
          project_id: project.id,
          status: 'draft',
          currency: 'CAD',
          labour_subtotal_cents: Math.round(calculatedQuote.totals.labour_subtotal * 100),
          materials_subtotal_cents: 0, // Materials added later
          grand_total_cents: Math.round(calculatedQuote.totals.grand_total * 100),
          deposit_required_pct: 25.0,
          created_by: user.id,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        })
        .select('id')
        .single();
        
      if (quoteError) throw new Error(`Failed to create quote: ${quoteError.message}`);
      
      // Store labour inputs
      const { error: labourError } = await supabase
        .from('labour_inputs')
        .insert({
          quote_id: quote.id,
          data: formData,
        });
        
      if (labourError) throw new Error(`Failed to store labour inputs: ${labourError.message}`);
      
      return quote.id;
      
    } catch (error) {
      console.error('Create quote error:', error);
      throw error;
    }
  }
  
  // Get contractor's quotes with pagination
  static async getQuotes(
    page: number = 1, 
    limit: number = 20,
    status?: string
  ): Promise<{ quotes: QuoteSummary[]; total: number; hasMore: boolean }> {
    try {
      const orgId = await this.getContractorOrgId();
      const offset = (page - 1) * limit;
      
      let query = supabase
        .from('quotes')
        .select(`
          id,
          quote_number,
          status,
          labour_subtotal_cents,
          materials_subtotal_cents,
          grand_total_cents,
          created_at,
          project:projects(
            id,
            name,
            address,
            building_type,
            customer:customers(
              id,
              name,
              email,
              phone
            )
          ),
          labour_inputs(
            data
          )
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
        
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }
      
      const { data, error, count } = await query;
      
      if (error) throw new Error(`Failed to fetch quotes: ${error.message}`);
      
      const quotes: QuoteSummary[] = (data || []).map(quote => ({
        id: quote.id,
        quote_number: quote.quote_number,
        status: quote.status,
        customer_name: quote.project?.customer?.name || 'Unknown Customer',
        project_address: typeof quote.project?.address === 'object' 
          ? quote.project.address.full_address || 'Address not provided'
          : quote.project?.address || 'Address not provided',
        grand_total: (quote.labour_subtotal_cents + quote.materials_subtotal_cents) / 100,
        created_at: quote.created_at,
        bathroom_type: quote.labour_inputs?.[0]?.data?.bathroom_type || 'Unknown',
        building_type: quote.project?.building_type || 'house',
      }));
      
      return {
        quotes,
        total: count || 0,
        hasMore: offset + limit < (count || 0)
      };
      
    } catch (error) {
      console.error('Get quotes error:', error);
      throw error;
    }
  }
  
  // Get single quote with full details
  static async getQuote(quoteId: string): Promise<StoredQuote> {
    try {
      const orgId = await this.getContractorOrgId();
      
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          project:projects(
            id,
            name,
            address,
            building_type,
            customer:customers(
              id,
              name,
              email,
              phone
            )
          ),
          labour_inputs(
            data
          )
        `)
        .eq('id', quoteId)
        .eq('org_id', orgId)
        .single();
        
      if (error) throw new Error(`Failed to fetch quote: ${error.message}`);
      if (!data) throw new Error('Quote not found');
      
      return data as StoredQuote;
      
    } catch (error) {
      console.error('Get quote error:', error);
      throw error;
    }
  }
  
  // Update quote status
  static async updateQuoteStatus(quoteId: string, status: string): Promise<void> {
    try {
      const orgId = await this.getContractorOrgId();
      
      const { error } = await supabase
        .from('quotes')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId)
        .eq('org_id', orgId);
        
      if (error) throw new Error(`Failed to update quote status: ${error.message}`);
      
    } catch (error) {
      console.error('Update quote status error:', error);
      throw error;
    }
  }
  
  // Delete quote (soft delete by setting status to cancelled)
  static async deleteQuote(quoteId: string): Promise<void> {
    try {
      const orgId = await this.getContractorOrgId();
      
      const { error } = await supabase
        .from('quotes')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId)
        .eq('org_id', orgId);
        
      if (error) throw new Error(`Failed to delete quote: ${error.message}`);
      
    } catch (error) {
      console.error('Delete quote error:', error);
      throw error;
    }
  }
  
  // Get quote statistics for dashboard
  static async getQuoteStats(): Promise<{
    total: number;
    draft: number;
    sent: number;
    accepted: number;
    totalValue: number;
  }> {
    try {
      const orgId = await this.getContractorOrgId();
      
      const { data, error } = await supabase
        .from('quotes')
        .select('status, labour_subtotal_cents, materials_subtotal_cents')
        .eq('org_id', orgId);
        
      if (error) throw new Error(`Failed to fetch quote stats: ${error.message}`);
      
      const stats = {
        total: data?.length || 0,
        draft: 0,
        sent: 0,
        accepted: 0,
        totalValue: 0,
      };
      
      data?.forEach(quote => {
        switch (quote.status) {
          case 'draft':
            stats.draft++;
            break;
          case 'customer_viewable':
            stats.sent++;
            break;
          case 'accepted':
            stats.accepted++;
            break;
        }
        stats.totalValue += (quote.labour_subtotal_cents + quote.materials_subtotal_cents) / 100;
      });
      
      return stats;
      
    } catch (error) {
      console.error('Get quote stats error:', error);
      throw error;
    }
  }
}