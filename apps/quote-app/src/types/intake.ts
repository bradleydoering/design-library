export interface PropertyDetails {
  address: string;
  buildingType: 'house' | 'condo' | 'townhouse';
  yearBuilt?: number;
  propertySize?: number;
}

export interface BathroomDetails {
  bathroomType: 'master' | 'guest' | 'powder' | 'ensuite';
  currentLayout: 'functional' | 'needs-improvement' | 'complete-remodel';
  squareFootage: number;
  ceilingHeight: number;
  hasWindows: boolean;
  hasVentilation: boolean;
}

export interface RenovationScope {
  renovationType: 'full-renovation' | 'partial-update' | 'fixtures-only';
  includeFlooring: boolean;
  includePlumbing: boolean;
  includeElectrical: boolean;
  includeTiling: boolean;
  includePainting: boolean;
  accessibilityFeatures: string[];
}

export interface DesignPreferences {
  stylePreference: 'modern' | 'traditional' | 'transitional' | 'contemporary';
  colorScheme: 'light' | 'dark' | 'neutral' | 'bold';
  budgetRange: 'budget' | 'mid' | 'high' | 'luxury';
  timeframe: 'asap' | '1-3-months' | '3-6-months' | 'flexible';
}

export interface ContactInformation {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredContactMethod: 'email' | 'phone' | 'text';
  bestTimeToContact: 'morning' | 'afternoon' | 'evening' | 'anytime';
}

export interface IntakeFormData {
  property: PropertyDetails;
  bathroom: BathroomDetails;
  scope: RenovationScope;
  preferences: DesignPreferences;
  contact: ContactInformation;
  additionalNotes?: string;
}

export interface FormStepProps {
  data: Partial<IntakeFormData>;
  onUpdate: (data: Partial<IntakeFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}