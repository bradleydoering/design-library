# CloudReno Supabase Migration Guide

This guide walks you through migrating your bathroom package data from JSON to Supabase for better extensibility and data management.

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Node.js**: Ensure you have Node.js 16+ installed
3. **Supabase CLI** (optional but recommended): `npm install -g supabase`

## Step 1: Set Up Supabase Project

1. Create a new project in Supabase dashboard
2. Go to **Project Settings** → **API**
3. Copy your project URL and anon key
4. Go to **Project Settings** → **API** → **Service Role Key** and copy the service role key

## Step 2: Environment Variables

Create or update your `.env.local` file with:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Step 3: Install Dependencies

```bash
npm install @supabase/supabase-js
```

## Step 4: Create Database Schema

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-schema.sql`
4. Click **Run** to create all tables and setup

## Step 5: Run Migration Script

```bash
# Make sure you're in the project root
cd /Users/braddoering/design-library

# Install dependencies for migration script
npm install

# Run the migration
node scripts/migrate-to-supabase.js
```

## Step 6: Update Your App

### Option A: Gradual Migration (Recommended)

Replace `getMaterials()` calls gradually:

```typescript
// Before (materials.ts)
import { getMaterials } from '@/lib/materials'

// After (materials-supabase.ts)
import { getMaterials } from '@/lib/materials-supabase'
```

### Option B: Complete Switch

1. Backup your current `lib/materials.ts`
2. Replace it with `lib/materials-supabase.ts`
3. Update all imports across your app

## Step 7: Verify Migration

1. Check Supabase dashboard tables have data
2. Test your app with the new database
3. Verify package listings, product searches, and admin functions work

## Database Schema Overview

### Core Tables

- **`products`**: All bathroom products (tiles, vanities, etc.)
- **`packages`**: Bathroom design packages
- **`package_products`**: Links packages to their products
- **`package_universal_toggles`**: Package configuration settings
- **`brand_logos`**: Brand logo references
- **`colors`**: Color definitions

### Key Features

- **UUID Primary Keys**: Better for scaling and security
- **Row Level Security**: Ready for multi-tenant setups
- **Indexed Columns**: Optimized for search and filtering
- **Type Safety**: Enum types for consistent data
- **Audit Trail**: Created/updated timestamps on all records

## API Changes

### Before (JSON)
```typescript
const materials = await getMaterials()
const tiles = materials.tiles
```

### After (Supabase)
```typescript
const materials = await getMaterials() // Same interface!
const tiles = materials.tiles // Works the same

// New capabilities:
const searchResults = await searchProducts('marble', 'tiles')
const package = await getPackageById('uuid-here')
```

## Benefits

✅ **Real-time Updates**: Data changes reflect immediately  
✅ **Better Performance**: Indexed queries and optimized fetching  
✅ **Admin Features**: Easy to build admin interfaces  
✅ **Scalability**: No more massive JSON files  
✅ **Data Integrity**: Foreign keys and constraints  
✅ **Search**: Full-text search across products  
✅ **API Ready**: Built-in REST and GraphQL APIs  

## Rollback Plan

If you need to rollback:

1. Restore `lib/materials.ts` from backup
2. Update imports back to original
3. Remove Supabase dependencies if needed

The JSON file remains untouched, so rollback is safe and easy.

## Troubleshooting

### Migration Script Fails
- Check environment variables are set correctly
- Verify Supabase project is accessible
- Ensure service role key has proper permissions

### App Shows No Data
- Check browser network tab for API errors
- Verify RLS policies allow read access
- Test Supabase connection in dashboard

### Performance Issues
- Check if indexes are created properly
- Monitor query performance in Supabase dashboard
- Consider adding more specific indexes for your use cases

## Next Steps

After successful migration, you can:

1. **Build Admin Features**: Use the new APIs for admin panels
2. **Add Real-time**: Subscribe to data changes with Supabase real-time
3. **Implement Auth**: Add user authentication for admin features
4. **Optimize Queries**: Add more specific indexes based on usage patterns
5. **Data Validation**: Add custom database functions for business logic

## Support

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Migration Issues**: Check the console logs for detailed error messages
- **Database Questions**: Use Supabase dashboard SQL editor to test queries