# Customer Package Detail Pages - Implementation Plan

## Overview
Create dedicated package detail pages in the quote-app that replicate the design-library's package pages, showing images, product lists, and a read-only sidebar with quote specifics instead of the interactive configuration sidebar.

## Current State

**Design-Library Structure:**
- Main layout: Grid with content area and fixed sidebar (380px wide)
- **Left side**: Image carousel, thumbnails, description, and product list
- **Right sidebar**: Interactive configuration (size, type, tile coverage) + pricing + download button
- Uses `ImageCarousel`, `SimpleProductList`, and `PackageConfiguration` components

**Quote-App Current State:**
- Packages grid page shows all packages with pricing
- "See Details" button opens external link to design-library (cloudrenovation.ca)
- Need to replace with internal detail pages

## Goals

1. **Replicate design-library package pages** inside quote-app
2. **Show quote-specific information** in sidebar (read-only)
3. **Display accurate pricing** based on customer's actual quote dimensions
4. **Enable one-click package selection** directly from detail page
5. **Maintain visual consistency** with design-library for customer familiarity

## Architecture

### 1. Data Layer

**API Endpoint: `/api/packages/[id]`**
- Fetch package metadata (name, description, category)
- Fetch all associated products via `package_products` junction table
- Fetch package images (main + additional images)
- Return complete package configuration

**Reuse Existing:**
- `fetchPackageConfiguration()` from `package-fetcher.ts`
- `/api/packages/pricing` for price calculations
- Universal bathroom config for conditional item display

### 2. Routing Structure

**New Route:**
```
/customer/quote/[token]/packages/[packageId]/page.tsx
```

**Navigation Flow:**
1. Customer views package grid: `/customer/quote/[token]/packages`
2. Clicks "See Details" → Navigate to `/customer/quote/[token]/packages/[packageId]`
3. Reviews package details, products, and pricing
4. Clicks "Select This Package" → Navigate to `/customer/quote/[token]/complete`

### 3. Component Architecture

#### Main Page Component
**Location:** `/customer/quote/[token]/packages/[packageId]/page.tsx`

**Responsibilities:**
- Fetch quote data from token (via `/api/customer/quote/[token]`)
- Fetch package details from packageId (via `/api/packages/[id]`)
- Calculate pricing using quote dimensions (via `/api/packages/pricing`)
- Render layout with image gallery, product list, and sidebar
- Handle package selection and navigation

**State:**
```typescript
interface PackageDetailPageState {
  quoteData: QuoteData | null;
  packageData: PackageConfiguration | null;
  pricingData: PackagePricing | null;
  loading: boolean;
  error: string | null;
  isSelecting: boolean;
}
```

#### Component Breakdown

**1. CustomerImageGallery Component**
- **Location:** `/components/customer/CustomerImageGallery.tsx`
- **Props:**
  ```typescript
  interface CustomerImageGalleryProps {
    images: string[];
    packageName: string;
  }
  ```
- **Features:**
  - Main image carousel (500px height)
  - Thumbnail grid below (4 columns)
  - Active thumbnail highlighting
  - Keyboard navigation support
  - Image loading error handling
- **Styling:** Match design-library ImageCarousel component

**2. CustomerProductList Component**
- **Location:** `/components/customer/CustomerProductList.tsx`
- **Props:**
  ```typescript
  interface CustomerProductListProps {
    products: PackageConfiguration['products'];
    quoteData: QuoteData;
    bathroomType: string;
    universalConfig: any;
  }
  ```
- **Features:**
  - Group products by category (Tiles, Fixtures, etc.)
  - Display product images, names, brands, SKUs
  - Show calculated square footage for tiles
  - Apply bathroom-type conditional logic
  - Gray out excluded items with explanation
  - Show pricing per item
- **Styling:** Match design-library SimpleProductList component

**3. CustomerQuoteSidebar Component**
- **Location:** `/components/customer/CustomerQuoteSidebar.tsx`
- **Props:**
  ```typescript
  interface CustomerQuoteSidebarProps {
    quoteData: QuoteData;
    pricing: PackagePricing;
    packageName: string;
    isEstimate?: boolean;
    onSelect: () => void;
    isSelecting: boolean;
  }
  ```
- **Sections:**
  1. **Quote Details** (read-only)
     - Bathroom type
     - Floor area (sqft)
     - Wall area (sqft)
     - Shower floor (sqft, if applicable)
     - Ceiling height

  2. **Pricing Breakdown**
     - Labor subtotal
     - Materials subtotal
     - Total project cost (prominent)
     - Estimate badge if applicable

  3. **Action Button**
     - "Select This Package" button
     - Loading state during submission
     - Disabled state handling

- **Styling:** Match design-library PackageConfiguration sidebar (380px fixed width)

### 4. Page Layout

**Structure:**
```tsx
<div className="min-h-screen bg-offwhite">
  {/* Header */}
  <header className="sticky top-0 z-30 bg-white border-b">
    <h1>Package Name</h1>
    <BackButton />
  </header>

  {/* Main Content */}
  <div className="container mx-auto pt-36 px-4 max-w-7xl">
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 relative lg:mr-[420px]">

      {/* Left Content Area */}
      <div className="space-y-8">
        <CustomerImageGallery images={packageImages} packageName={pkg.name} />

        <div className="mt-6">
          <p className="text-gray-600 text-lg">{pkg.description}</p>
        </div>

        <CustomerProductList
          products={packageProducts}
          quoteData={quoteData}
          bathroomType={quoteData.bathroom_type}
          universalConfig={universalConfig}
        />
      </div>

      {/* Fixed Right Sidebar */}
      <div className="lg:fixed lg:top-32 lg:right-8 lg:w-[380px] lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto">
        <CustomerQuoteSidebar
          quoteData={quoteData}
          pricing={pricingData}
          packageName={pkg.name}
          isEstimate={pricingData.isEstimate}
          onSelect={handleSelectPackage}
          isSelecting={isSelecting}
        />
      </div>
    </div>
  </div>
</div>
```

### 5. Product Display Logic

**Bathroom Type Conditional Display:**

```typescript
// Reuse shouldIncludeItem() from pricing route
const shouldIncludeItem = (itemType: string): boolean => {
  if (universalConfig && universalConfig.bathroomTypes) {
    const typeMap: Record<string, string> = {
      'walk_in': 'Walk-in Shower',
      'tub_shower': 'Tub & Shower',
      'tub_only': 'Bathtub',
      'powder': 'Sink & Toilet'
    }

    const configName = typeMap[bathroomType] || bathroomType
    const bathroomTypeConfig = universalConfig.bathroomTypes.find(
      (bt: any) => bt.name === configName || bt.id === bathroomType
    )

    if (bathroomTypeConfig && bathroomTypeConfig.includedItems) {
      return bathroomTypeConfig.includedItems[itemType] === true
    }
  }

  return true // Conservative fallback
}
```

**Tile Square Footage Display:**
```typescript
const getTileSquareFootage = (itemType: string): number => {
  switch (itemType) {
    case 'floorTile':
      return quoteData.floor_sqft
    case 'wallTile':
      return (quoteData.wet_wall_sqft || 0) + (quoteData.dry_wall_sqft || 0)
    case 'showerFloorTile':
      return quoteData.shower_floor_sqft || 0
    case 'accentTile':
      return quoteData.accent_tile_sqft || 0
    default:
      return 0
  }
}
```

**Product Card Display States:**
1. **Included & Has Square Footage** (tiles):
   - Show normally with pricing
   - Display: "120 sq ft × $12.50/sqft = $1,500"

2. **Included** (fixtures):
   - Show normally with unit price
   - Display: "$350"

3. **Excluded by Bathroom Type**:
   - Gray out (opacity-50)
   - Display: "Not included for Walk-in Shower"
   - Show product details but no pricing

4. **No Square Footage** (tiles only):
   - Gray out if sqft = 0
   - Display: "Not applicable for this bathroom"

### 6. Pricing Integration

**Fetch Pricing:**
```typescript
const fetchPricing = async () => {
  const response = await fetch('/api/packages/pricing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      packageId: packageId,
      floorSqft: quoteData.floor_sqft,
      wetWallSqft: quoteData.wet_wall_sqft,
      dryWallSqft: quoteData.dry_wall_sqft || 0,
      showerFloorSqft: quoteData.shower_floor_sqft || 0,
      accentTileSqft: quoteData.accent_tile_sqft || 0,
      bathroomType: quoteData.bathroom_type,
      ceilingHeight: quoteData.ceiling_height,
      vanityWidth: quoteData.vanity_width
    })
  })

  return await response.json()
}
```

**Display Pricing Breakdown:**
```typescript
interface PricingBreakdown {
  tiles: {
    floorTile?: { sqft: number; pricePerSqft: number; total: number }
    wallTile?: { sqft: number; pricePerSqft: number; total: number }
    showerFloorTile?: { sqft: number; pricePerSqft: number; total: number }
    accentTile?: { sqft: number; pricePerSqft: number; total: number }
  }
  fixtures: {
    [key: string]: { sku: string; price: number }
  }
  labor: number
  materialsSubtotal: number
  grandTotal: number
}
```

### 7. Selection Handler

```typescript
const handleSelectPackage = async () => {
  try {
    setIsSelecting(true)
    setError(null)

    const response = await fetch('/api/customer/select-package', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: params.token,
        package_id: packageData.id,
        package_name: packageData.name,
        pricing_snapshot: {
          package_id: packageData.id,
          package_name: packageData.name,
          materials_subtotal: pricingData.materialsTotal,
          materials_total: pricingData.materialsTotal,
          labor_total: pricingData.laborTotal,
          grand_total: pricingData.grandTotal,
        },
        customer_notes: null
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to save selection')
    }

    // Navigate to confirmation page
    router.push(`/customer/quote/${params.token}/complete`)

  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to save selection')
  } finally {
    setIsSelecting(false)
  }
}
```

### 8. Error Handling

**Error States:**
1. **Invalid Token**
   - Redirect to `/customer/quote/${token}` (expired page)

2. **Package Not Found**
   - Show error message: "Package not found"
   - Display "Back to Packages" button

3. **Pricing Calculation Failed**
   - Show warning: "Unable to calculate accurate pricing"
   - Display estimate or fallback pricing

4. **Image Loading Failed**
   - Show placeholder image
   - Continue displaying other content

5. **Selection Failed**
   - Show error message in sidebar
   - Keep user on page to retry

**Loading States:**
- Initial page load: Full-screen spinner
- Pricing calculation: Skeleton loaders in sidebar
- Image loading: Blur-up placeholders
- Selection in progress: Button loading state

### 9. Mobile Responsiveness

**Breakpoints:**
- **Mobile (< 768px):**
  - Sidebar moves below content
  - Single column layout
  - Sticky "Select" button at bottom

- **Tablet (768px - 1024px):**
  - Sidebar remains on right
  - Reduce sidebar width to 320px

- **Desktop (> 1024px):**
  - Full layout with 380px fixed sidebar
  - Right margin on content area

**Touch Interactions:**
- Larger touch targets for carousel navigation
- Swipe support for image carousel
- Tap thumbnails to change main image

### 10. Performance Optimizations

**Data Fetching:**
- Parallel fetch quote data and package data
- Cache package data client-side (SWR or React Query)
- Server-side render where possible

**Images:**
- Use Next.js Image component with optimization
- Lazy load images below fold
- Responsive srcsets for different screen sizes
- Blur placeholder while loading

**Code Splitting:**
- Lazy load CustomerImageGallery component
- Lazy load ProductDetailModal if needed
- Dynamic imports for heavy dependencies

## Implementation Steps

### Phase 1: API & Data Layer
1. Create `/api/packages/[id]/route.ts` endpoint
2. Test package data fetching
3. Verify pricing calculation integration

### Phase 2: Components
4. Build `CustomerImageGallery` component
5. Build `CustomerProductList` component
6. Build `CustomerQuoteSidebar` component
7. Test components in isolation

### Phase 3: Page Integration
8. Create package detail page route
9. Integrate all components
10. Add error handling and loading states
11. Implement selection handler

### Phase 4: Polish & Testing
12. Update "See Details" button in package grid
13. Test across all bathroom types
14. Test all packages (including custom design)
15. Mobile responsiveness testing
16. Performance optimization

## Success Criteria

- [ ] Customer can view complete package details without leaving quote-app
- [ ] All package images display correctly with carousel navigation
- [ ] Product list shows all included items with accurate square footage
- [ ] Excluded items clearly marked based on bathroom type
- [ ] Pricing matches exactly what's calculated in `/api/packages/pricing`
- [ ] "Select This Package" button works and navigates to confirmation
- [ ] Layout matches design-library visual style
- [ ] Mobile responsive and touch-friendly
- [ ] Fast page loads (< 2 seconds on 3G)
- [ ] No errors in console
- [ ] Works for all bathroom types and all packages

## Future Enhancements

1. **Product Comparison:** Compare multiple packages side-by-side
2. **Favorites:** Save favorite packages for later review
3. **Share:** Email package details to partner/family
4. **Print:** Print-friendly package detail view
5. **Virtual Room:** Show package in virtual bathroom rendering
6. **Material Swaps:** Allow limited customization (premium feature)

---

**Document Version:** 1.0
**Last Updated:** 2025-10-03
**Author:** Brad Doering
