# CloudReno Quote App - Development Guide

## Project Purpose

The **CloudReno Quote App** is a **contractor-facing tool** designed for on-site bathroom renovation quoting. Contractors visit customer homes, take measurements, and use this iPad-optimized app to generate instant, accurate labor pricing quotes. The app then integrates with the design-library to allow customers to select design packages that combine with the calculated labor costs for complete project quotes.

### Key Users
- **Primary**: Contractors (on-site, iPad usage)
- **Secondary**: Office staff (quote management, rate card updates)
- **End Goal**: Customer sees combined labor + materials quote for complete renovation

### Core Workflow
1. **Contractor visits customer home** and takes measurements
2. **Fills out minimal quote form** (6 key questions) on iPad
3. **Gets instant labor pricing** based on rate cards
4. **Works with customer to select design package** from design-library
5. **Combined quote** (labor + materials) presented to customer

## Architecture Overview

### Monorepo Structure
```
design-library/                    # Root monorepo
├── apps/
│   ├── design-library/            # Existing design & materials app
│   └── quote-app/                 # NEW: Contractor quoting tool
├── packages/
│   └── design-pricing-sdk/        # Shared pricing calculations
└── rate_cards/                    # Labor pricing specifications
    ├── CloudReno_Bathroom_Pricing_V1.md
    └── seeds/pricing/              # CSV rate data
```

### Technology Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth (contractor-only access)
- **Pricing**: Custom labor calculation engine + design-pricing-sdk
- **Deployment**: Independent from design-library
- **Device Target**: iPad (768px-1024px viewport)

## Core Requirements

### Quote Form (Minimal Input)
Based on the screenshots provided, the form collects:

1. **Bathroom Type**: Walk-in Shower | Bathtub | Tub & Shower | Sink & Toilet (Powder)
2. **Building Type**: House | Condo 
3. **Year Built**: Before 1980 (asbestos warning) | 1980+ | Not Sure
4. **Floor Area**: Square feet to be tiled
5. **Wall Area**: Wet wall square feet + optional dry wall tiling
6. **Ceiling Height**: 7' | 8' | 9' | Custom input
7. **Vanity Width**: Inches (determines if vanity installation needed)
8. **Electrical Work**: Count of items (lights, outlets, switches, fans)

### Pricing Calculation Engine

#### Labor Calculation (V1 - Installed Rates)
The app uses a sophisticated rate card system:

**Rate Lines** (from `Simplified_Rate_Card__Installed_.csv`):
- **DEM**: Demolition (base $1,107)
- **PLM**: Plumbing points (3 for shower/tub + 1 per fixture + relocations)
- **ELE**: Electrical items ($184.50 each)
- **TILE-FLR**: Floor tiling (base $123 + $12.30/sqft)
- **TILE-WET**: Wet wall tiling (base $369 + $12.30/sqft)
- **SUB-GRB**: Backerboard wet areas (base $184.50 + $3.69/sqft)
- **WPF-KER**: Waterproofing Kerdi (base $246 + $4.92/sqft)
- **VAN**: Vanity install ($264.45)
- **RECESS**: Subfloor recess for walk-in ($492)

**Project Multipliers** (from `Project-Level_Multipliers.csv`):
- **CONTINGENCY**: 2% of labor subtotal
- **CONDO-FCTR**: Condo logistics factor (if building_type = condo)
- **OLDHOME-ASB**: Pre-1980 asbestos factor (if year_built = pre_1980)
- **PM-FEE**: Project management fee (editable)

#### Calculation Formula
```
labor_subtotal = Σ(base_price + price_per_unit × quantity)
contingency = labor_subtotal × CONTINGENCY%
condo_uplift = labor_subtotal × CONDO-FCTR% (if condo)
oldhome_uplift = labor_subtotal × OLDHOME-ASB% (if pre-1980)
pm_fee = (labor_subtotal + contingency) × PM-FEE%
grand_total = labor_subtotal + contingency + condo_uplift + oldhome_uplift + pm_fee
```

### Fail Loud Philosophy
**CRITICAL**: No silent fallbacks. All failures must fail loudly with visible errors.

- **Missing rate codes**: Block calculation with error message
- **Database failures**: Show blocking error screen
- **Pricing API failures**: Display failure banner, prevent quote generation
- **Authentication failures**: Immediate redirect to login
- **Invalid form data**: Prevent submission with validation errors

## Database Schema

### Core Tables
```sql
-- Rate management
rate_lines(line_code, line_name, unit, base_price, price_per_unit, notes, active)
project_multipliers(code, name, basis, default_percent)
rate_surcharges(code, name, unit, adder_amount) -- V2 only

-- Quote data
quotes(id, bathroom_type, building_type, year_built, floor_sqft, wet_wall_sqft, ...)
quote_line_items(quote_id, line_code, quantity, unit_price, extended)
quote_totals(quote_id, labour_subtotal, contingency, pm_fee, grand_total)

-- Audit & security
audit_events(quote_id, actor_user_id, event_type, meta, created_at)
```

### Row Level Security (RLS)
- **Contractors only**: All rate and quote data behind authentication
- **Org isolation**: Users can only see their organization's data
- **Audit trail**: All changes logged with user ID and timestamp

## Development Best Practices

### Code Organization
- **Small, focused components**: Max 200 lines per component
- **Feature-based organization**: Group related components together
- **DRY principle**: Share common logic, avoid duplication
- **Type safety**: Comprehensive TypeScript coverage

### Error Handling
```typescript
// GOOD: Fail loud with specific error
if (!rateCard.DEM) {
  throw new Error(`Missing required rate code: DEM. Cannot calculate quote.`);
}

// BAD: Silent fallback
const demRate = rateCard.DEM || 1000; // NO!
```

### iPad Optimization
- **Touch targets**: Minimum 44px (48px preferred)
- **Form controls**: Large, easy-to-tap inputs
- **Typography**: Readable at arm's length
- **Spacing**: Generous padding for finger navigation
- **Orientation**: Support both portrait and landscape

### Component Patterns
```typescript
// Consistent prop interface
interface ComponentProps {
  data: FormData;
  onUpdate: (data: Partial<FormData>) => void;
  onNext: () => void;
  onBack?: () => void;
  disabled?: boolean;
}

// Error boundaries for fail-loud behavior
<ErrorBoundary fallback={<CalculationError />}>
  <PricingCalculator />
</ErrorBoundary>
```

## Key Features to Implement

### Phase 1: Core Quoting
1. **Contractor authentication** (Supabase Auth)
2. **Quote form** (6-step iPad-optimized flow)
3. **Labor pricing engine** (rate card calculations)
4. **Quote management** (save, edit, view quotes)
5. **Rate card management** (contractor can edit rates)

### Phase 2: Integration
1. **Design package selection** (design-library integration)
2. **Combined quotes** (labor + materials)
3. **Customer portal** (view and accept quotes)
4. **PDF generation** (watermarked quotes)

### Phase 3: Advanced
1. **Audit logging** (detailed change tracking)
2. **Notifications** (quote viewed alerts)
3. **Advanced pricing** (material-based surcharges)

## Security Considerations

### Authentication
- **Contractor-only access**: No public routes
- **Session management**: Secure token handling
- **Device binding**: Track contractor devices

### Data Protection
- **RLS enforcement**: Database-level security
- **Audit logging**: All pricing changes tracked
- **No PII exposure**: Secure customer data handling

### Anti-Tampering
- **Rate card versioning**: Track pricing changes
- **Quote snapshots**: Immutable pricing records
- **Signature validation**: Ensure pricing integrity

## Testing Strategy

### Unit Tests
- **Pricing calculations**: Verify math accuracy
- **Form validation**: Input sanitization
- **Rate card logic**: Rule application

### Integration Tests
- **Database operations**: CRUD with RLS
- **Authentication flows**: Login/logout
- **Quote generation**: End-to-end pricing

### iPad Testing
- **Touch interactions**: Tap, swipe, scroll
- **Form usability**: Real-world contractor testing
- **Performance**: Fast loading on device

## Development Commands

```bash
# Development
npm run dev:quote          # Start quote-app (port 3333)
npm run dev                # Start design-library (port 3001)

# Testing
npm run test              # Run test suite
npm run typecheck         # TypeScript validation
npm run lint              # Code quality checks

# Database
npx supabase db reset     # Reset with fresh schema
npx supabase gen types    # Generate TypeScript types
```

## Current Status

### ✅ Completed
- Next.js 14 project structure
- iPad-optimized UI framework (unified design spec)
- Form components with accessibility
- Basic routing and navigation

### 🚧 In Progress
- Contractor quote form (simplified from customer intake)
- Rate card data structure
- Pricing calculation engine

### 📋 Next Steps
1. **Rebuild quote form** to match screenshot flow (6 questions only)
2. **Implement rate card database** with Supabase schema
3. **Build pricing calculation engine** with fail-loud validation
4. **Create contractor dashboard** for quote management
5. **Integrate with design-library** for package selection

## Deployment Notes

- **Independent deployment** from design-library
- **Separate database** (no shared tables with design-library)
- **Version pinning** for design-pricing-sdk dependency
- **Environment isolation** (staging/production)

---

**Last Updated**: September 2024  
**Contact**: Brad Doering (brad@cloudrenovation.ca)  
**Repository**: https://github.com/cloudreno/design-library (monorepo)