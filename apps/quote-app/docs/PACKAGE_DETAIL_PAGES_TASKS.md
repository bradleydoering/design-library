# Customer Package Detail Pages - Task List

## Overview
Implementation tasks for creating customer package detail pages in the quote-app.

**Goal:** Replace external "See Details" links with internal package detail pages that show images, products, and quote-specific pricing.

---

## Phase 1: API & Data Layer

### Task 1: Create Package Details API Endpoint
**File:** `/src/app/api/packages/[id]/route.ts`

**Requirements:**
- [x] Accept package ID as route parameter
- [ ] Fetch package metadata from `packages` table
- [ ] Fetch all products via `package_products` junction table
- [ ] Include product details (SKU, name, price, category)
- [ ] Fetch package images (IMAGE_MAIN, IMAGE_01, IMAGE_02, IMAGE_03)
- [ ] Return complete package configuration
- [ ] Add error handling for missing packages
- [ ] Force dynamic rendering (`export const dynamic = 'force-dynamic'`)

**Dependencies:**
- Reuse `fetchPackageConfiguration()` from `package-fetcher.ts`
- Use `createClient()` from Supabase

**Acceptance Criteria:**
- API returns complete package data with all products
- Missing packages return 404 with error message
- Response matches `PackageConfiguration` interface

---

## Phase 2: Reusable Components

### Task 2: Build CustomerImageGallery Component
**File:** `/src/components/customer/CustomerImageGallery.tsx`

**Requirements:**
- [ ] Accept `images: string[]` and `packageName: string` props
- [ ] Main image display (500px height, responsive)
- [ ] Image carousel with prev/next navigation
- [ ] Thumbnail grid below main image (4 columns)
- [ ] Highlight active thumbnail
- [ ] Handle image loading errors gracefully
- [ ] Keyboard navigation support (arrow keys)
- [ ] Mobile-friendly touch/swipe support

**Design Reference:**
- Match design-library `ImageCarousel` component
- Maintain visual consistency with design-library

**Acceptance Criteria:**
- All package images display correctly
- Carousel navigation works smoothly
- Active thumbnail is clearly highlighted
- Failed images show placeholder
- Works on mobile and desktop

---

### Task 3: Build CustomerProductList Component
**File:** `/src/components/customer/CustomerProductList.tsx`

**Requirements:**
- [ ] Accept props: `products`, `quoteData`, `bathroomType`, `universalConfig`
- [ ] Group products by category (Tiles, Fixtures, Accessories)
- [ ] Display each product with:
  - [ ] Product image (thumbnail)
  - [ ] Product name
  - [ ] Brand name
  - [ ] SKU number
  - [ ] Pricing (unit price or price per sqft)
- [ ] For tiles, show calculated square footage from quote
- [ ] Apply bathroom-type conditional logic (reuse `shouldIncludeItem()`)
- [ ] Gray out excluded items with explanation text
- [ ] Show "Not included for [bathroom type]" for excluded items
- [ ] Read-only display (no swap/customize buttons)

**Conditional Display Logic:**
```typescript
const shouldIncludeItem = (itemType: string): boolean => {
  // Reuse logic from /api/packages/pricing/route.ts
  // Use universalConfig.bathroomTypes to determine inclusion
}

const getTileSquareFootage = (itemType: string): number => {
  // Map to quote data: floor_sqft, wet_wall_sqft, etc.
}
```

**Design Reference:**
- Match design-library `SimpleProductList` component
- Use same product card layout

**Acceptance Criteria:**
- Products grouped correctly by category
- Excluded items clearly marked and grayed out
- Tile square footage displays correctly
- Fixture unit prices display correctly
- Works for all bathroom types

---

### Task 4: Build CustomerQuoteSidebar Component
**File:** `/src/components/customer/CustomerQuoteSidebar.tsx`

**Requirements:**
- [ ] Accept props: `quoteData`, `pricing`, `packageName`, `isEstimate`, `onSelect`, `isSelecting`
- [ ] Fixed positioning (380px width, right side on desktop)
- [ ] Quote Details Section:
  - [ ] Bathroom type (formatted display name)
  - [ ] Floor area (sqft)
  - [ ] Wall area (sqft)
  - [ ] Shower floor area (sqft, if > 0)
  - [ ] Ceiling height (ft)
  - [ ] Read-only (no controls)
- [ ] Pricing Breakdown Section:
  - [ ] Labor subtotal
  - [ ] Materials subtotal
  - [ ] Total project cost (large, prominent)
  - [ ] "Estimate" badge if `isEstimate === true`
- [ ] Action Section:
  - [ ] "Select This Package" button (large, coral)
  - [ ] Loading state during selection
  - [ ] Disabled state if already selecting
- [ ] Mobile responsive (moves below content on small screens)

**Design Reference:**
- Match design-library `PackageConfiguration` sidebar layout
- Use same styling and spacing

**Acceptance Criteria:**
- All quote details display correctly
- Pricing breakdown is accurate
- Select button works and shows loading state
- Sidebar is fixed on desktop, flows on mobile
- Visual consistency with design-library

---

## Phase 3: Page Integration

### Task 5: Create Package Detail Page Route
**File:** `/src/app/customer/quote/[token]/packages/[packageId]/page.tsx`

**Requirements:**
- [ ] Extract `token` and `packageId` from URL params
- [ ] Fetch quote data from `/api/customer/quote/[token]`
- [ ] Fetch package data from `/api/packages/[packageId]`
- [ ] Fetch pricing data from `/api/packages/pricing` (POST)
- [ ] Fetch universal bathroom config for conditional logic
- [ ] Render page layout with all components
- [ ] Handle loading states (full-screen spinner on initial load)
- [ ] Handle error states (invalid token, package not found, etc.)
- [ ] Implement `handleSelectPackage()` function
- [ ] Navigate to confirmation page on successful selection

**Page Structure:**
```tsx
<div className="min-h-screen bg-offwhite">
  <header>{/* Sticky header with title and back button */}</header>

  <main className="container mx-auto pt-36 px-4 max-w-7xl">
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 relative lg:mr-[420px]">

      {/* Left Content */}
      <div className="space-y-8">
        <h3 className="text-3xl">{packageName} Package</h3>
        <CustomerImageGallery images={images} packageName={name} />
        <p className="text-gray-600">{description}</p>
        <CustomerProductList products={products} quoteData={quoteData} />
      </div>

      {/* Fixed Right Sidebar */}
      <div className="lg:fixed lg:top-32 lg:right-8 lg:w-[380px]">
        <CustomerQuoteSidebar {...props} />
      </div>
    </div>
  </main>
</div>
```

**Acceptance Criteria:**
- Page loads without errors
- All data fetches complete successfully
- Components render correctly
- Layout matches design-library
- Works on mobile and desktop

---

### Task 6: Implement Bathroom Type Filtering
**Location:** `CustomerProductList` component

**Requirements:**
- [ ] Fetch `universal_bath_config` from database
- [ ] Map bathroom types: `walk_in` → "Walk-in Shower", etc.
- [ ] Implement `shouldIncludeItem()` helper function
- [ ] Apply to each product type (tiles and fixtures)
- [ ] Show included items normally
- [ ] Gray out excluded items (opacity-50)
- [ ] Display exclusion reason: "Not included for [bathroom type]"

**Reference:**
- Reuse logic from `/api/packages/pricing/route.ts` (lines 160-227)

**Acceptance Criteria:**
- Walk-in showers exclude tub and tubFiller
- Bathtubs exclude glazing and showerFloorTile
- Powder rooms exclude shower-related items
- Tub & Shower includes all items
- Exclusion reasons display correctly

---

### Task 7: Add Tile Square Footage Calculations
**Location:** `CustomerProductList` component

**Requirements:**
- [ ] Create `getTileSquareFootage()` helper function
- [ ] Map tile types to quote data fields:
  - [ ] `floorTile` → `quote.floor_sqft`
  - [ ] `wallTile` → `quote.wet_wall_sqft + quote.dry_wall_sqft`
  - [ ] `showerFloorTile` → `quote.shower_floor_sqft`
  - [ ] `accentTile` → `quote.accent_tile_sqft`
- [ ] Display square footage in product cards
- [ ] Format: "120 sq ft × $12.50/sqft = $1,500.00"
- [ ] Handle zero square footage (show "Not applicable")

**Acceptance Criteria:**
- Correct square footage displays for each tile type
- Calculation is accurate (sqft × price_per_sqft)
- Zero square footage handled gracefully
- Formatting is consistent and readable

---

### Task 8: Update Package Grid "See Details" Button
**File:** `/src/app/customer/quote/[token]/packages/page.tsx`

**Requirements:**
- [ ] Change from external link to internal routing
- [ ] Remove `window.open()` call
- [ ] Use Next.js `router.push()`
- [ ] Navigate to `/customer/quote/${token}/packages/${pkg.id}`
- [ ] Keep button styling consistent

**Before:**
```typescript
onClick={() => {
  window.open(`https://cloudrenovation.ca/packages/${createSlug(pkg.name)}`, '_blank')
}}
```

**After:**
```typescript
onClick={() => {
  router.push(`/customer/quote/${params.token}/packages/${pkg.id}`)
}}
```

**Acceptance Criteria:**
- Button navigates to internal detail page
- Navigation happens in same tab/window
- URL includes correct token and package ID
- Button styling unchanged

---

### Task 9: Implement Select Button Handler
**Location:** Package detail page

**Requirements:**
- [ ] Create `handleSelectPackage()` async function
- [ ] Call `/api/customer/select-package` with:
  - [ ] `token`
  - [ ] `package_id`
  - [ ] `package_name`
  - [ ] `pricing_snapshot` (complete pricing breakdown)
  - [ ] `customer_notes: null`
- [ ] Set loading state during submission
- [ ] Handle success: Navigate to `/customer/quote/${token}/complete`
- [ ] Handle errors: Display error message in sidebar
- [ ] Prevent double-submission (disable button while loading)

**Error Handling:**
- Network errors
- Invalid token
- Database errors
- Display user-friendly error messages

**Acceptance Criteria:**
- Selection saves to database successfully
- Navigation to confirmation page works
- Loading state prevents double-clicks
- Errors display clearly to user
- Can retry after error

---

## Phase 4: Polish & Testing

### Task 10: Add Error Handling and Loading States
**Location:** Package detail page

**Requirements:**
- [ ] **Loading States:**
  - [ ] Full-screen spinner on initial page load
  - [ ] Skeleton loaders for pricing sidebar
  - [ ] Image blur-up placeholders
  - [ ] Button loading spinner during selection
- [ ] **Error States:**
  - [ ] Invalid token → Redirect to expired page
  - [ ] Package not found → Error message + back button
  - [ ] Pricing calculation failed → Warning message
  - [ ] Image loading failed → Show placeholder
  - [ ] Selection failed → Error message in sidebar
- [ ] Use `LoadingSpinner` component
- [ ] Use Next.js error boundaries where appropriate

**Acceptance Criteria:**
- All loading states work correctly
- All error states handled gracefully
- User never sees blank screen or crash
- Error messages are helpful and actionable

---

### Task 11: Test Package Detail Pages
**Manual Testing Checklist:**

**Data Testing:**
- [ ] Test with all bathroom types:
  - [ ] Walk-in Shower
  - [ ] Tub & Shower
  - [ ] Bathtub only
  - [ ] Sink & Toilet (Powder)
- [ ] Test with all packages (including custom design packages)
- [ ] Verify pricing matches `/api/packages/pricing` exactly
- [ ] Verify excluded items match universal config

**Navigation Testing:**
- [ ] Package grid → Package detail works
- [ ] Package detail → Confirmation works
- [ ] Back button returns to package grid
- [ ] Invalid token redirects to expired page
- [ ] Invalid package ID shows error

**Component Testing:**
- [ ] Image carousel navigation works
- [ ] Thumbnails highlight correctly
- [ ] Product list displays all items
- [ ] Excluded items grayed out correctly
- [ ] Sidebar shows correct pricing
- [ ] Select button saves and navigates

**Responsive Testing:**
- [ ] Desktop (> 1024px): Sidebar fixed on right
- [ ] Tablet (768px - 1024px): Sidebar on right, narrower
- [ ] Mobile (< 768px): Sidebar below content

**Performance Testing:**
- [ ] Page loads in < 2 seconds on 3G
- [ ] Images lazy load correctly
- [ ] No console errors
- [ ] No memory leaks

**Acceptance Criteria:**
- All tests pass
- No bugs found
- Performance meets standards
- User experience is smooth

---

## Completion Checklist

### API & Data
- [ ] Task 1: Package details API endpoint created and tested

### Components
- [ ] Task 2: CustomerImageGallery component built and tested
- [ ] Task 3: CustomerProductList component built and tested
- [ ] Task 4: CustomerQuoteSidebar component built and tested

### Page Integration
- [ ] Task 5: Package detail page route created
- [ ] Task 6: Bathroom type filtering implemented
- [ ] Task 7: Tile square footage calculations added
- [ ] Task 8: "See Details" button updated to internal routing
- [ ] Task 9: Select button handler implemented

### Polish & Testing
- [ ] Task 10: Error handling and loading states added
- [ ] Task 11: Complete testing across all scenarios

### Documentation
- [x] Implementation plan created (PACKAGE_DETAIL_PAGES_PLAN.md)
- [x] Task list created (this file)
- [ ] Update CLAUDE.md with new routes and components

---

## Notes

**Estimated Time:** 8-12 hours total

**Priority:** High (critical for customer experience)

**Dependencies:**
- Existing pricing calculation logic (complete)
- Universal bathroom config (complete)
- Customer quote token system (complete)

**Blocked By:** None

**Blocks:** None (standalone feature)

---

**Document Version:** 1.0
**Last Updated:** 2025-10-03
**Created By:** Brad Doering
