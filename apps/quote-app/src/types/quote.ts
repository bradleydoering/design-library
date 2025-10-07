export interface QuoteFormData {
  // Step 0: Quote Name
  quote_name: string;

  // Step 1 (moved to end): Customer Information
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  project_address: string;

  // Step 2: Bathroom Type & Building Type & Year Built
  bathroom_type: 'walk_in' | 'tub_shower' | 'tub_only' | 'powder';
  building_type: 'house' | 'condo';
  year_built: 'pre_1980' | 'post_1980' | 'unknown';
  
  // Step 3: Floor Area
  floor_sqft: number;
  shower_floor_sqft?: number; // Only for walk_in and tub_shower types

  // Step 4: Wall Area
  wet_wall_sqft?: number; // Optional for powder rooms
  tile_other_walls: boolean;
  tile_other_walls_sqft?: number;
  add_accent_feature: boolean;
  accent_feature_sqft?: number;

  // Step 5: Vanity Width
  vanity_width_in: number;

  // Step 6: Electrical Work
  electrical_items: number;

  // Step 7: Optional Upgrades
  upgrades: {
    heated_floors: boolean;
    heated_towel_rack: boolean;
    bidet_addon: boolean;
    smart_mirror: boolean;
    premium_exhaust_fan: boolean;
    built_in_niche: boolean;
    shower_bench: boolean;
    safety_grab_bars: boolean;
  };
}

export interface QuoteStepProps {
  data: Partial<QuoteFormData>;
  onUpdate: (data: Partial<QuoteFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export interface CalculatedQuote {
  id: string;
  form_data: QuoteFormData;
  line_items: QuoteLineItem[];
  totals: QuoteTotals;
  created_at: string;
}

export interface QuoteLineItem {
  line_code: string;
  line_name: string;
  quantity: number;
  unit_price: number;
  base_applied: boolean;
  extended: number;
  unit: 'unit' | 'sqft' | 'item' | 'point';
}

export interface QuoteTotals {
  labour_subtotal: number;
  contingency: number;
  pm_fee: number;
  condo_uplift: number;
  oldhome_uplift: number;
  grand_total: number;
}