# CloudReno Quote App - Developer Handoff Document

**Last Updated**: October 2, 2025
**Current Status**: Customer Quote Sharing System Complete ✅
**Production URL**: https://quote-app-cloudreno.vercel.app

---

## 📋 Executive Summary

The CloudReno Quote App is a production-ready iPad-optimized application for bathroom renovation quoting. It combines labor pricing calculations with design package selection, delivering complete renovation quotes to customers via email.

### Core Capabilities
- ✅ **Labor Quote Calculator**: 7-step iPad-optimized form with database-driven pricing
- ✅ **Design Package Integration**: 20+ complete bathroom packages with real-time materials pricing
- ✅ **Customer Quote Sharing**: Secure token-based system for emailing quotes to customers
- ✅ **Customer Package Selection**: Customer-facing portal for browsing and selecting design packages
- ✅ **Authentication System**: Supabase SSR + SendGrid email verification
- ✅ **Rate Card Management**: Admin interface for contractors to update pricing
- ✅ **Production Deployment**: Live on Vercel with CI/CD pipeline

---

## 🎯 Recent Development (October 1-2, 2025)

### **✅ CUSTOMER QUOTE SHARING SYSTEM - COMPLETE**

We've built a comprehensive "Send to Customer" feature that allows contractors to email complete quotes to customers, who can then browse and select design packages from their own devices.

#### What Was Built

**1. Database Infrastructure**
- `customer_quote_tokens` - Secure, time-limited access tokens (30 days)
- `customer_package_selections` - Tracks customer's chosen packages
- `quote_notifications` - Alerts contractors when customers interact
- Extended `quotes` table with customer and project fields

**2. Email System**
- SendGrid integration with branded HTML templates
- Customer quote email with secure access link
- Package selection confirmation emails
- Professional CloudReno branding throughout

**3. API Endpoints**
```typescript
POST /api/quotes/create                    // Save contractor quotes
POST /api/customer/send-quote             // Generate token and email customer
GET  /api/customer/quote/[token]          // Fetch quote with token validation
POST /api/customer/select-package         // Save customer's package choice
GET  /api/customer/selection/[token]      // Fetch customer's selection
```

**4. Customer-Facing Pages**
```
/customer/quote/[token]           // Quote summary with labor costs
/customer/quote/[token]/packages  // Browse and select design packages
/customer/quote/[token]/complete  // Confirmation after selection
```

**5. Contractor Integration**
- Updated `/quote/complete` to save quotes and send to customers
- Customer information modal for capturing details
- Success notifications after sending

#### Complete User Flow

**Contractor Side:**
1. Create labor quote using 7-step calculator
2. Select design package from library
3. Click "Send to Customer" → Enter customer info
4. System saves quote and sends branded email
5. Contractor gets notification when customer views/selects

**Customer Side:**
1. Receives branded email with secure link (30-day expiry)
2. Views personalized quote with labor costs and project details
3. Browses 20+ design packages with total project costs
4. Selects preferred package
5. Receives confirmation email
6. Contractor gets notified of selection

#### Security Features
- 64-character secure tokens (`crypto.randomBytes(32)`)
- 30-day automatic expiration
- Token-based access (no customer login required)
- Row Level Security (RLS) on all tables
- Automatic status tracking (pending → viewed → selected → expired)

---

## 🗂️ Project Structure

```
apps/quote-app/
├── src/
│   ├── app/
│   │   ├── quote/                    # Contractor quote flow
│   │   │   ├── packages/            # Package selection for contractors
│   │   │   └── complete/            # Final quote summary + send to customer
│   │   ├── customer/                # Customer-facing pages (NEW)
│   │   │   └── quote/[token]/
│   │   │       ├── page.tsx         # Quote summary
│   │   │       ├── packages/        # Package selection
│   │   │       └── complete/        # Confirmation
│   │   ├── api/
│   │   │   ├── quotes/create/       # Save quotes (NEW)
│   │   │   ├── customer/            # Customer APIs (NEW)
│   │   │   │   ├── send-quote/     # Generate token & send email
│   │   │   │   ├── quote/[token]/  # Fetch quote by token
│   │   │   │   ├── select-package/ # Save package selection
│   │   │   │   └── selection/[token]/ # Get selection
│   │   │   ├── packages/            # Package listing & pricing
│   │   │   └── auth/                # Authentication
│   │   ├── dashboard/               # Contractor dashboard
│   │   └── login/                   # Authentication pages
│   ├── components/
│   │   ├── QuoteForm/              # 7-step quote form
│   │   └── ui/                      # Shared UI components
│   ├── lib/
│   │   ├── email-service.ts        # SendGrid integration (UPDATED)
│   │   ├── quotes-api.ts           # Quote database operations
│   │   ├── rate-cards-api.ts       # Pricing rate cards
│   │   └── pricing.ts              # Pricing calculation engine
│   └── utils/supabase/             # Supabase SSR clients
├── docs/                            # Documentation (ORGANIZED)
│   ├── CURRENT_STATUS.md
│   ├── AUTHENTICATION_REBUILD_COMPLETE.md
│   ├── EMAIL_CONFIGURATION.md
│   └── ...
├── rate_cards/                      # Pricing specifications
├── Handoff.md                       # THIS FILE
└── CLAUDE.md                        # Development guide
```

---

## 🔧 Technical Implementation Details

### Database Schema Changes

**New Tables Created:**
```sql
-- Customer access tokens for quote sharing
customer_quote_tokens (
  id, quote_id, token, customer_email, customer_name,
  customer_phone, project_address, expires_at,
  created_at, accessed_at, status
)

-- Customer package selections
customer_package_selections (
  id, quote_id, token_id, package_id, package_name,
  selected_at, customer_notes, pricing_snapshot
)

-- Notifications for contractors
quote_notifications (
  id, quote_id, contractor_user_id, notification_type,
  read_at, created_at, metadata
)
```

**Extended Tables:**
```sql
-- Added to quotes table:
quote_name, sent_to_customer_at, bathroom_type,
building_type, year_built, floor_sqft, wet_wall_sqft,
ceiling_height, vanity_width, labour_grand_total
```

### Email Templates

The system includes professional HTML email templates for:
1. **Customer Quote Email** - Sent when contractor shares quote
   - Project summary with labor costs
   - Secure link to view quote and browse packages
   - 30-day expiry notice
   - CloudReno branding

2. **Package Selection Confirmation** - Sent after customer selects package
   - Selected package details
   - Total project cost breakdown
   - Next steps information

Both templates are mobile-responsive and use CloudReno brand colors.

### Security Implementation

**Token Generation:**
```typescript
const token = crypto.randomBytes(32).toString('hex'); // 64 chars
```

**Token Validation:**
- Checks if token exists in database
- Verifies not expired (`expires_at > NOW()`)
- Updates `accessed_at` timestamp on first view
- Creates contractor notification on first view
- Returns 410 Gone if expired

**Row Level Security:**
- Customer tokens: Public read via token, authenticated insert only
- Package selections: Public insert (validated server-side), org-scoped read
- Notifications: Contractor can only see their own

---

## 🚨 Known Issues & Solutions

### Issue #1: "Send to Customer" Button Alert

**Problem**: Button on packages page showed alert even when package was selected
**Location**: `/app/quote/packages/page.tsx` line 203-212
**Previous Behavior**: Always showed alert regardless of selection state
**Fixed Behavior**: Now checks if package is selected and navigates to complete page
**Status**: ✅ RESOLVED - Button now works properly when package is selected

**Solution**: Updated `handleSendToCustomer()` to:
1. Check if package is selected
2. If no selection → Show alert
3. If selected → Navigate to complete page (same as Continue button)
4. User can then click "Send to Customer" on complete page to enter customer info

### Issue #2: Duplicate Function Declaration

**Problem**: `handleSendToCustomer` was declared twice in complete page
**Location**: `/app/quote/complete/page.tsx` line 71 and 163
**Resolution**: ✅ FIXED - Removed duplicate declaration (line 163-166)
**Result**: Both "Send to Customer" and "Save Quote" buttons properly open customer info modal

### Issue #3: Missing customer_email Validation

**Current**: Email is optional in customer info form
**Impact**: Customers can't receive quotes without email
**Recommendation**: Make email required OR add phone/SMS alternative

---

## 📝 Environment Variables Required

### Production Environment

```bash
# Supabase (Database & Auth)
NEXT_PUBLIC_SUPABASE_URL=https://iaenowmeacxkccgnmfzc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key-here]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# SendGrid (Email)
SENDGRID_API_KEY=[sendgrid-api-key]
FROM_EMAIL=noreply@cloudrenovation.ca
SENDGRID_FROM_NAME=CloudReno Quotes

# Application
NEXT_PUBLIC_APP_URL=https://quote-app-cloudreno.vercel.app
```

### SendGrid Setup

1. **Domain Verification**: `cloudrenovation.ca` already verified ✅
2. **Sender Authentication**: `noreply@cloudrenovation.ca` configured ✅
3. **API Key**: Created with "Mail Send" permissions ✅
4. **Templates**: Not using SendGrid templates - HTML in code

---

## 🔄 Data Flow Diagrams

### Quote Sharing Flow

```
Contractor Creates Quote
    ↓
Selects Package (Materials Pricing Calculated)
    ↓
Goes to /quote/complete
    ↓
Clicks "Send to Customer"
    ↓
Fills Customer Info Modal
    ↓
API: POST /api/quotes/create
  → Saves quote to database
  → Returns quote_id
    ↓
API: POST /api/customer/send-quote
  → Generates secure token
  → Creates customer_quote_tokens record
  → Updates quote.status = 'sent_to_customer'
  → Sends email via SendGrid
  → Creates notification
    ↓
Customer Receives Email
    ↓
Clicks Link → /customer/quote/[token]
    ↓
API: GET /api/customer/quote/[token]
  → Validates token not expired
  → Updates accessed_at timestamp
  → Creates "customer_viewed" notification
  → Returns quote data
    ↓
Customer Views Quote Summary
    ↓
Clicks "Browse Design Packages"
    ↓
Views Package Grid with Real-Time Pricing
    ↓
Selects Package → Clicks "Confirm Selection"
    ↓
API: POST /api/customer/select-package
  → Saves to customer_package_selections
  → Updates token.status = 'selected'
  → Updates quote materials pricing
  → Creates "customer_selected" notification
  → Sends confirmation email
    ↓
Customer Sees Confirmation Page
    ↓
Contractor Gets Notification
```

### Package Pricing Calculation

```
Labor Quote Data (from quote form)
  ├── floor_sqft
  ├── wet_wall_sqft
  ├── dry_wall_sqft (optional)
  ├── shower_floor_sqft (optional)
  ├── accent_tile_sqft (optional)
  └── bathroom_type
    ↓
For Each Package:
    ↓
API: POST /api/packages/pricing
  → Fetch package config from Supabase
  → Check if has products (standard) or not (custom)
  → If Standard Package:
      → Calculate tile costs (floor, wall, shower, accent)
      → Add fixture costs (vanity, tub, toilet, etc.)
      → Return total with breakdown
  → If Custom Package:
      → Use flat-rate pricing ($8K mid-range, $12K high-end)
      → Add $2K for tub & shower combo
      → Return estimate with isEstimate flag
    ↓
Display in UI:
  Materials Total + Labor Total = Grand Total
```

---

## 🐛 Issues We Encountered & How We Fixed Them

### 1. Database Schema Mismatch

**Problem**: Initial API code referenced fields that didn't exist in quotes table
**Fields Missing**: `labour_grand_total`, `quote_name`, `sent_to_customer_at`, `bathroom_type`, etc.
**Discovery**: Queried `information_schema.columns` to see actual schema
**Solution**: Created migration `add_quote_customer_sharing_fields` to add all required columns
**Learning**: Always verify database schema before writing API code

### 2. SendGrid Already Installed

**Problem**: Tried to write new email service, but SendGrid was already configured
**Discovery**: Found `@sendgrid/mail` in `package.json` and existing `email-service.ts`
**Solution**: Extended existing email service with new functions instead of replacing
**Learning**: Check existing dependencies before adding new ones

### 3. Custom Package Pricing Logic

**Problem**: Custom design packages have no products, so standard pricing calculation failed
**Discovery**: `fetchPackageConfiguration` returned empty products for "Custom Design" packages
**Solution**: Added detection logic - if no products, use flat-rate estimation instead
**Code**:
```typescript
const hasProducts = Object.values(packageConfig.products).some(p => p !== undefined)
if (!hasProducts) {
  return calculateCustomPackagePricing(packageConfig, dimensions)
}
```

### 4. Package Sorting for Custom Templates

**Problem**: Custom design packages appearing randomly in grid
**Requirement**: Custom packages should always be at bottom
**Solution**: Sort array before setting state
**Code**:
```typescript
const sortedPackages = transformedPackages.sort((a, b) => {
  const aIsCustom = a.name.toLowerCase().includes('custom design');
  const bIsCustom = b.name.toLowerCase().includes('custom design');
  if (aIsCustom && !bIsCustom) return 1;
  if (!aIsCustom && bIsCustom) return -1;
  return 0;
});
```

### 5. Supabase SSR Client Usage

**Problem**: Initial code used legacy `supabaseBrowser` which didn't share auth session
**Symptoms**: "Failed to get contractor org: id=eq.undefined" errors
**Root Cause**: Multiple Supabase client implementations causing auth state mismatch
**Solution**: Standardized on `@/utils/supabase/client` and `@/utils/supabase/server`
**Additional Fix**: Used `.rpc('get_user_org_id')` to bypass RLS circular dependency

### 6. Image Hostname Not Configured

**Problem**: Next.js error "hostname 'images.unsplash.com' is not configured"
**Discovery**: Custom packages use Unsplash images
**Solution**: Added to `next.config.mjs`:
```typescript
remotePatterns: [
  { protocol: 'https', hostname: 'images.unsplash.com' }
]
```

---

## 🚀 How to Continue Development

### Setting Up Development Environment

```bash
# 1. Clone repository
cd /Users/braddoering/design-library/apps/quote-app

# 2. Install dependencies (if needed)
npm install

# 3. Set up environment variables
cp .env.local.template .env.local
# Edit .env.local with your values

# 4. Start development server
npm run dev

# 5. Access app
open http://localhost:3333
```

### Testing the Customer Quote Flow

1. **Create a Quote**:
   - Go to http://localhost:3333/intake
   - Complete the 7-step form
   - View quote calculation

2. **Select a Package**:
   - Browse available packages
   - Select any package (pricing calculated automatically)
   - Click "Continue"

3. **Send to Customer**:
   - On complete page, click "Send to Customer"
   - Enter customer details (use your own email for testing)
   - Click "Save Quote"
   - Check for success message

4. **Customer View**:
   - Check your email for quote link
   - Click link → View quote summary
   - Click "Browse Design Packages"
   - Select a package
   - Confirm selection
   - See confirmation page

5. **Verify in Database**:
```sql
-- Check quote was created
SELECT * FROM quotes ORDER BY created_at DESC LIMIT 1;

-- Check token was generated
SELECT * FROM customer_quote_tokens ORDER BY created_at DESC LIMIT 1;

-- Check if customer selected (after step 4)
SELECT * FROM customer_package_selections ORDER BY selected_at DESC LIMIT 1;

-- Check notifications
SELECT * FROM quote_notifications ORDER BY created_at DESC LIMIT 5;
```

### Common Development Tasks

**Clean Cache and Restart**:
```bash
rm -rf .next node_modules/.cache
npm run dev
```

**Check Database Schema**:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'quotes'
ORDER BY ordinal_position;
```

**Test Email Sending** (requires SendGrid API key):
```bash
curl -X POST http://localhost:3333/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your-email@example.com"}'
```

**View Supabase Logs**:
```bash
# Via Supabase dashboard
https://supabase.com/dashboard/project/iaenowmeacxkccgnmfzc/logs

# Or via CLI
npx supabase logs
```

---

## 📋 Remaining Work (Pending Tasks)

### High Priority

#### 1. Dashboard Status Tracking
**Status**: Not Started
**Description**: Add quote status indicators to contractor dashboard
**Requirements**:
- Show which quotes have been sent to customers
- Display when customers have viewed quotes
- Indicate which packages have been selected
- Real-time notification badges
- Activity timeline for each quote

**Files to Create/Modify**:
- `/app/dashboard/page.tsx` - Add status columns
- `/app/dashboard/quotes/page.tsx` - Detailed quote list view
- `/api/notifications/unread` - Count unread notifications
- `/components/NotificationBadge.tsx` - Visual notification indicator

**Estimated Effort**: 4-6 hours

#### 2. Email Validation & Delivery Tracking
**Current Issue**: Customer email is optional, but required for sending quotes
**Recommendation**:
- Make email field required in customer info form
- Add email format validation
- Track email delivery status (SendGrid webhooks)
- Handle bounce/failure notifications

#### 3. Quote Expiry Automation
**Current**: Tokens expire after 30 days, but no automated cleanup
**Needed**:
- Scheduled job to mark expired tokens
- Email reminder 3 days before expiry
- Contractor notification when quotes expire
- Option to extend expiry date

#### 4. Resend Email Functionality
**Use Case**: Customer didn't receive email or link expired
**Requirements**:
- Button on contractor quote view to resend
- Generates new token (or reuses if not expired)
- Sends new email with updated link
- Logs resend action

### Medium Priority

#### 5. Package Selection History
**Description**: Track when customers change their package selection
**Tables Needed**: `package_selection_history`
**Use Case**: Customer selects multiple packages before finalizing

#### 6. Customer Notes/Questions
**Description**: Allow customers to add notes or questions when selecting
**Current**: `customer_notes` field exists but no UI
**Add**: Textarea in package selection page

#### 7. PDF Quote Generation
**Description**: Generate PDF of final quote for contractor records
**Libraries**: Consider `react-pdf` or `puppeteer`
**Include**: Labor breakdown, package details, total cost, terms

#### 8. Analytics & Reporting
**Metrics to Track**:
- Quote volume over time
- Package selection rates (which packages most popular)
- Conversion rate (quotes sent → packages selected)
- Average time from send to selection
- Revenue by package tier

### Low Priority (Future Enhancements)

#### 9. SMS Notifications
**Alternative**: For customers without email
**Service**: Twilio integration
**Use Cases**: Quote ready, package selected confirmations

#### 10. Customer Login/Account System
**Current**: Token-based (no login required)
**Future**: Optional customer accounts to view quote history

#### 11. Package Comparison Tool
**Description**: Side-by-side comparison of 2-3 packages
**UI**: Comparison matrix showing features and pricing

#### 12. Custom Package Builder
**Description**: Allow customers to customize package selections
**Complexity**: High - requires materials inventory integration

---

## 📞 Support & Handoff Information

### Key Contacts
- **Project Owner**: Brad Doering (brad@cloudrenovation.ca)
- **Repository**: https://github.com/cloudreno/design-library (monorepo)
- **Production App**: https://quote-app-cloudreno.vercel.app

### Important Documentation Files
- `Handoff.md` - THIS FILE (comprehensive handoff)
- `CLAUDE.md` - Development guide and best practices
- `docs/CURRENT_STATUS.md` - Current implementation status
- `docs/AUTHENTICATION_REBUILD_COMPLETE.md` - Auth system details
- `docs/EMAIL_CONFIGURATION.md` - SendGrid setup guide

### Database Access
- **Platform**: Supabase
- **Project ID**: `iaenowmeacxkccgnmfzc`
- **Dashboard**: https://supabase.com/dashboard/project/iaenowmeacxkccgnmfzc
- **Schema**: See migrations in `supabase/migrations/` (if exists) or check dashboard

### Third-Party Services
1. **SendGrid** (Email)
   - Purpose: Customer quote emails
   - Domain: cloudrenovation.ca (verified)
   - Sender: noreply@cloudrenovation.ca

2. **Supabase** (Database + Auth)
   - Purpose: Data storage, authentication
   - Tables: quotes, customer_quote_tokens, customer_package_selections, quote_notifications

3. **Vercel** (Hosting)
   - Purpose: Production deployment
   - URL: quote-app-cloudreno.vercel.app
   - Auto-deploys from main branch

### Key Decisions & Rationale

**Why Token-Based Customer Access?**
- Simpler UX - no customer account creation needed
- Secure - 64-character tokens are cryptographically secure
- Time-limited - automatically expire after 30 days
- One-time use optional - can be configured per use case

**Why SendGrid Instead of Supabase Email?**
- Reliability - SendGrid has 99.99% delivery rate
- Features - Better templates, analytics, deliverability tools
- Cost - Free tier sufficient for current volume
- Already configured - Domain verification complete

**Why Separate Customer Pages?**
- Clean separation contractor vs customer UX
- No authentication required for customers
- Mobile-optimized for customer's phone
- Professional presentation builds trust

**Why Flat-Rate Custom Package Pricing?**
- Flexibility - customers who don't like standard packages
- Simplicity - easy to understand estimate
- Profitability - predictable margins
- Reality - custom packages get refined during design consultation

---

## 🎯 Success Metrics

### Current State (Pre-Customer Sharing)
- Labor quotes generated: Manual tracking
- Package selections: In-person only
- Quote delivery: Manual email/PDF

### Target State (Post-Customer Sharing)
- **Quote Sent Rate**: 80%+ of quotes sent to customers
- **View Rate**: 70%+ of customers view quotes within 48 hours
- **Selection Rate**: 50%+ of customers select packages
- **Time to Selection**: Average 3-5 days from send to selection
- **Contractor Satisfaction**: 4.5/5 stars for ease of use

### How to Measure
```sql
-- Quote metrics
SELECT
  COUNT(*) as total_quotes,
  COUNT(sent_to_customer_at) as quotes_sent,
  COUNT(sent_to_customer_at) * 100.0 / COUNT(*) as send_rate
FROM quotes
WHERE created_at > NOW() - INTERVAL '30 days';

-- Customer engagement
SELECT
  COUNT(*) as tokens_created,
  COUNT(accessed_at) as customers_viewed,
  COUNT(accessed_at) * 100.0 / COUNT(*) as view_rate,
  COUNT(CASE WHEN status = 'selected' THEN 1 END) as selections,
  COUNT(CASE WHEN status = 'selected' THEN 1 END) * 100.0 / COUNT(*) as selection_rate
FROM customer_quote_tokens
WHERE created_at > NOW() - INTERVAL '30 days';

-- Time to selection
SELECT
  AVG(EXTRACT(EPOCH FROM (cps.selected_at - cqt.created_at))/86400) as avg_days_to_select
FROM customer_package_selections cps
JOIN customer_quote_tokens cqt ON cqt.id = cps.token_id
WHERE cps.selected_at > NOW() - INTERVAL '30 days';
```

---

## 🚨 Critical Notes for Next Developer

1. **Don't Delete Old Files**: Many .md files in docs/ contain historical context that may be useful

2. **Two Send Buttons**: There are "Send to Customer" buttons on both `/quote/packages` and `/quote/complete`. Only the one on complete page works (by design).

3. **Customer Email Required**: Despite being "optional" in the form, email is required for the feature to work. Consider making it required.

4. **Token Security**: Tokens are single-use by design - once customer selects, they can't change selection without contractor involvement.

5. **Package Pricing**: Custom packages use flat rates, standard packages use actual product costs * sqft.

6. **SendGrid API Key**: Must be in environment variables for emails to send. Test with `/api/test-email` endpoint.

7. **Supabase RLS**: Row Level Security is active. Use `.rpc('get_user_org_id')` to get org_id safely.

8. **Migration Pattern**: New database changes should use `mcp__supabase__apply_migration` tool with snake_case naming.

9. **Development Branch**: All commits should go to `development` branch, not `main` (per CLAUDE.md).

10. **Image Hosting**: Package images load from multiple domains - ensure all are in `next.config.mjs` `remotePatterns`.

---

## 🎓 Learning Resources

### Understanding the Codebase
1. Start with `CLAUDE.md` - explains project architecture
2. Read `docs/CURRENT_STATUS.md` - current implementation state
3. Review `/src/app/quote/packages/page.tsx` - main contractor flow
4. Study `/src/app/customer/quote/[token]/page.tsx` - customer flow
5. Examine `/src/lib/email-service.ts` - email templates

### Key Technologies
- **Next.js 14**: App Router with Server Actions
- **Supabase**: PostgreSQL with Row Level Security
- **TypeScript**: Full type coverage
- **Tailwind CSS**: Utility-first styling
- **SendGrid**: Transactional emails

### Testing Checklist
Before deploying changes:
- [ ] Test full contractor quote flow
- [ ] Test customer email delivery
- [ ] Test customer package selection
- [ ] Test token expiry handling
- [ ] Test custom package pricing
- [ ] Test standard package pricing
- [ ] Check mobile responsiveness
- [ ] Verify email HTML renders correctly
- [ ] Test with real Supabase data
- [ ] Check console for errors

---

**End of Handoff Document**

For questions or clarifications, contact Brad Doering or refer to inline code comments and documentation files in `/docs` directory.
