# Manual Supabase Setup Guide

Since direct database manipulation requires careful credential handling, here's a manual approach that's safer and more reliable.

## Step 1: Access Supabase Dashboard

1. Go to [supabase.com](https://supabase.com) and log in
2. Select your project: `iaenowmeacxkccgnmfzc`
3. Navigate to **SQL Editor** in the left sidebar

## Step 2: Execute Database Schema

1. In the SQL Editor, click **New Query**
2. Copy the entire contents of `supabase-schema.sql` 
3. Paste it into the SQL Editor
4. Click **Run** to execute

This will create all necessary tables:
- ✅ products
- ✅ packages  
- ✅ package_products
- ✅ package_universal_toggles
- ✅ brand_logos
- ✅ colors

## Step 3: Verify Table Creation

1. Go to **Table Editor** in the left sidebar
2. You should see all 6 tables listed
3. Click on each table to verify the structure

## Step 4: Test Connection from App

Now that your environment variables are set up, let's test the connection from your app:

```bash
node scripts/test-supabase-connection.js
```

## Step 5: Run Data Migration

Once the tables are created and connection is verified:

```bash
node scripts/migrate-to-supabase.js
```

This will transfer all your JSON data to Supabase.

## Step 6: Verify Data Migration

1. Back in Supabase Table Editor
2. Check each table has data:
   - **products**: Should have ~1000+ rows
   - **packages**: Should have your bathroom packages
   - **brand_logos**: Brand logo references
   - **colors**: Color definitions

## Alternative: SQL Files for Manual Execution

If you prefer to run smaller chunks, I can break down the schema into smaller files:

1. **01-create-tables.sql** - Just table creation
2. **02-create-indexes.sql** - Performance indexes  
3. **03-create-policies.sql** - Security policies
4. **04-create-views.sql** - Convenience views

Would you like me to create these separate files?

## Troubleshooting

### If Tables Don't Appear
- Check for SQL errors in the editor output
- Make sure you're connected to the right project
- Try running each CREATE TABLE statement individually

### If Migration Fails
- Verify environment variables are correct
- Check Supabase project settings for API access
- Ensure service role key has proper permissions

### If App Can't Connect
- Double-check `.env.local` file format
- Restart your Next.js development server
- Check browser network tab for API errors

## Next Steps After Setup

Once everything is working:

1. **Update your app** to use Supabase instead of JSON
2. **Test all functionality** with the new database
3. **Build admin features** using the new APIs
4. **Consider adding authentication** for admin access

## Support

If you encounter issues:
1. Check the Supabase dashboard logs
2. Review the migration script console output
3. Test individual API calls in the Supabase dashboard
4. Verify RLS policies allow the access you need