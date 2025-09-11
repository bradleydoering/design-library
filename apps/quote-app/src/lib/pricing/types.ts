export type UnitKind = 'unit' | 'sqft' | 'item' | 'point';
export type BasisKind = 'percent_of_labour' | 'percent_of_sell';

export interface RateLine {
  line_code: string;
  line_name: string;
  unit: UnitKind;
  base_price: number;
  price_per_unit: number;
  notes?: string;
  active?: boolean;
}

export interface ProjectMultiplier {
  code: string;
  name: string;
  basis: BasisKind;
  default_percent: number;
}

export interface LineItemCalculation {
  line_code: string;
  line_name: string;
  quantity: number;
  unit_price: number;
  base_applied: boolean;
  extended: number;
  unit: UnitKind;
}

export interface QuoteTotals {
  labour_subtotal: number;
  contingency: number;
  pm_fee: number;
  condo_uplift: number;
  oldhome_uplift: number;
  grand_total: number;
}

export interface CalculatedQuote {
  line_items: LineItemCalculation[];
  totals: QuoteTotals;
  raw_form_data: any;
  calculation_meta: {
    calculated_at: string;
    rate_card_version: string;
    plumbing_points: number;
    electrical_items: number;
    total_floor_sqft: number;
  };
}