// import { calculatePrice, getDefault, DesignConfig, PricingResult } from '../../../packages/design-pricing-sdk/src';
import { QuoteFormData } from '@/types/quote';
import { supabase } from './supabase';

// Temporary type definitions (will be replaced with proper imports)
type DesignConfig = {
  bathroomType: string;
  wallTileCoverage: string;
  size?: string;
  bathroomSize?: string;
  items?: any;
  includedItems?: any;
};

type PricingResult = {
  subtotal: number;
  subtotalCents: number;
  catalogVersion?: string;
  items: Array<{ name: string; price: number; quantity: number }>;
};

// Temporary stub functions (will be replaced with proper imports)
const calculatePrice = async (config: DesignConfig, materials: any, universalConfig?: any): Promise<PricingResult> => {
  // Placeholder pricing - will be replaced with real pricing engine
  return {
    subtotal: 5000,
    subtotalCents: 500000,
    catalogVersion: '1.0.0',
    items: [
      { name: 'Floor Tile', price: 1500, quantity: 50 },
      { name: 'Wall Tile', price: 2000, quantity: 100 },
      { name: 'Vanity', price: 1500, quantity: 1 }
    ]
  };
};

const getDefault = (level: 'budget' | 'mid' | 'high') => {
  return {
    config: {
      items: {
        floorTile: 'default-floor-tile',
        wallTile: 'default-wall-tile',
        vanity: 'default-vanity'
      },
      includedItems: {
        floorTile: true,
        wallTile: true,
        vanity: true
      }
    }
  };
};

// Extended quote interface to include materials
export interface CombinedQuote {
  labour_total: number;
  materials_total: number;
  grand_total: number;
  materials_breakdown: PricingResult;
  design_config: DesignConfig;
  package_level: 'budget' | 'mid' | 'high';
}

export interface PackageOption {
  level: 'budget' | 'mid' | 'high';
  name: string;
  description: string;
  config: DesignConfig;
  estimated_total: number;
}

export class MaterialsPricingAPI {
  
  // Get materials database from Supabase
  static async getMaterialsDatabase() {
    try {
      // Get products grouped by category
      const { data: products, error } = await supabase
        .from('products')
        .select('*');
        
      if (error) throw new Error(`Failed to fetch products: ${error.message}`);
      
      // Group products by category for the SDK
      const materialsDB = {
        tiles: products?.filter(p => p.category === 'tiles') || [],
        vanities: products?.filter(p => p.category === 'vanities') || [],
        tubs: products?.filter(p => p.category === 'tubs') || [],
        tub_fillers: products?.filter(p => p.category === 'tub_fillers') || [],
        toilets: products?.filter(p => p.category === 'toilets') || [],
        showers: products?.filter(p => p.category === 'showers') || [],
        faucets: products?.filter(p => p.category === 'faucets') || [],
        shower_glazing: products?.filter(p => p.category === 'glazing') || [],
        mirrors: products?.filter(p => p.category === 'mirrors') || [],
        towel_bars: products?.filter(p => p.category === 'bath accessories' && p.name.toLowerCase().includes('towel')) || [],
        toilet_paper_holders: products?.filter(p => p.category === 'bath accessories' && p.name.toLowerCase().includes('toilet paper')) || [],
        hooks: products?.filter(p => p.category === 'bath accessories' && p.name.toLowerCase().includes('hook')) || [],
        lighting: products?.filter(p => p.category === 'lighting') || [],
      };
      
      return materialsDB;
      
    } catch (error) {
      console.error('Get materials database error:', error);
      throw error;
    }
  }
  
  // Get universal configuration for bathroom types and square footage
  static async getUniversalConfig() {
    try {
      const { data: config, error } = await supabase
        .from('universal_bath_config')
        .select('config')
        .eq('id', 1)
        .single();
        
      if (error) throw new Error(`Failed to fetch universal config: ${error.message}`);
      
      return config?.config;
      
    } catch (error) {
      console.error('Get universal config error:', error);
      throw error;
    }
  }
  
  // Convert quote form data to design config format
  static convertQuoteToDesignConfig(formData: QuoteFormData, packageLevel: 'budget' | 'mid' | 'high' = 'mid'): DesignConfig {
    // Get the default design for the package level
    const defaultDesign = getDefault(packageLevel);
    
    // Map bathroom types from quote form to design config format
    const bathroomTypeMap: Record<string, DesignConfig['bathroomType']> = {
      'walk_in': 'Walk-in Shower',
      'tub_shower': 'Tub & Shower', 
      'tub_only': 'Bathtub',
      'powder': 'Sink & Toilet',
    };
    
    // Determine bathroom size based on floor square footage
    let bathroomSize: 'small' | 'normal' | 'large' = 'normal';
    if (formData.floor_sqft <= 35) {
      bathroomSize = 'small';
    } else if (formData.floor_sqft >= 65) {
      bathroomSize = 'large';
    }
    
    // Determine wall tile coverage based on wet wall sqft
    let wallTileCoverage: DesignConfig['wallTileCoverage'] = 'Half way up';
    if (formData.wet_wall_sqft === 0) {
      wallTileCoverage = 'None';
    } else if ((formData.wet_wall_sqft || 0) >= 80) {
      wallTileCoverage = 'Floor to ceiling';
    }
    
    const designConfig: DesignConfig = {
      bathroomType: bathroomTypeMap[formData.bathroom_type] || 'Tub & Shower',
      wallTileCoverage,
      bathroomSize,
      items: defaultDesign.config.items, // Use default items for the package level
      includedItems: defaultDesign.config.includedItems,
    };
    
    return designConfig;
  }
  
  // Get package options for a given quote
  static async getPackageOptions(formData: QuoteFormData): Promise<PackageOption[]> {
    try {
      const materialsDB = await this.getMaterialsDatabase();
      const universalConfig = await this.getUniversalConfig();
      
      const options: PackageOption[] = [];
      
      for (const level of ['budget', 'mid', 'high'] as const) {
        const designConfig = this.convertQuoteToDesignConfig(formData, level);
        
        // Calculate materials pricing for this package level
        const pricingResult = await calculatePrice(designConfig, materialsDB, universalConfig);
        
        options.push({
          level,
          name: this.getPackageName(level),
          description: this.getPackageDescription(level),
          config: designConfig,
          estimated_total: pricingResult.subtotalCents / 100,
        });
      }
      
      return options.sort((a, b) => a.estimated_total - b.estimated_total);
      
    } catch (error) {
      console.error('Get package options error:', error);
      throw error;
    }
  }
  
  // Calculate combined quote (labor + materials)
  static async calculateCombinedQuote(
    formData: QuoteFormData, 
    labourTotal: number,
    packageLevel: 'budget' | 'mid' | 'high' = 'mid'
  ): Promise<CombinedQuote> {
    try {
      const materialsDB = await this.getMaterialsDatabase();
      const universalConfig = await this.getUniversalConfig();
      const designConfig = this.convertQuoteToDesignConfig(formData, packageLevel);
      
      // Calculate materials pricing
      const materialsResult = await calculatePrice(designConfig, materialsDB, universalConfig);
      const materialsTotal = materialsResult.subtotalCents / 100;
      
      return {
        labour_total: labourTotal,
        materials_total: materialsTotal,
        grand_total: labourTotal + materialsTotal,
        materials_breakdown: materialsResult,
        design_config: designConfig,
        package_level: packageLevel,
      };
      
    } catch (error) {
      console.error('Calculate combined quote error:', error);
      throw error;
    }
  }
  
  // Update quote with materials data
  static async updateQuoteWithMaterials(quoteId: string, combinedQuote: CombinedQuote): Promise<void> {
    try {
      // Update the quote with materials subtotal
      const { error: quoteError } = await supabase
        .from('quotes')
        .update({
          materials_subtotal_cents: Math.round(combinedQuote.materials_total * 100),
          grand_total_cents: Math.round(combinedQuote.grand_total * 100),
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId);
        
      if (quoteError) throw new Error(`Failed to update quote: ${quoteError.message}`);
      
      // Store materials configuration
      const { error: configError } = await supabase
        .from('materials_config')
        .upsert({
          quote_id: quoteId,
          config: {
            design_config: combinedQuote.design_config,
            package_level: combinedQuote.package_level
          },
          updated_at: new Date().toISOString()
        });
        
      if (configError) throw new Error(`Failed to store materials config: ${configError.message}`);
      
      // Store materials snapshot for pricing history
      const { error: snapshotError } = await supabase
        .from('materials_snapshot')
        .upsert({
          quote_id: quoteId,
          sdk_version: '1.0.0',
          priced_at: new Date().toISOString(),
          totals: combinedQuote.materials_breakdown,
          source_hash: this.generateSourceHash(combinedQuote.materials_breakdown),
        });
        
      if (snapshotError) throw new Error(`Failed to store materials snapshot: ${snapshotError.message}`);
      
    } catch (error) {
      console.error('Update quote with materials error:', error);
      throw error;
    }
  }
  
  // Helper methods
  private static getPackageName(level: 'budget' | 'mid' | 'high'): string {
    switch (level) {
      case 'budget': return 'Essential Package';
      case 'mid': return 'Signature Package';
      case 'high': return 'Premium Package';
    }
  }
  
  private static getPackageDescription(level: 'budget' | 'mid' | 'high'): string {
    switch (level) {
      case 'budget': return 'Quality materials with great value. Perfect for budget-conscious renovations.';
      case 'mid': return 'Our most popular package with excellent quality and style balance.';
      case 'high': return 'Luxury materials and finishes for a premium bathroom experience.';
    }
  }
  
  private static generateSourceHash(breakdown: PricingResult): string {
    // Create a hash of the pricing breakdown for change detection
    return btoa(JSON.stringify({
      subtotal: breakdown.subtotalCents,
      catalogVersion: breakdown.catalogVersion,
      itemCount: breakdown.items.length,
    }));
  }
}