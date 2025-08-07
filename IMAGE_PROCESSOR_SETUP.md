# Image Processor Setup Guide

## 🎯 Overview

The Image Processor is a powerful tool in your admin panel that automates:

1. **Background Removal** - Uses remove.bg API to automatically remove backgrounds
2. **Cloud Storage** - Uploads processed images to CloudFlare R2 bucket  
3. **Database Integration** - Links images to products in Supabase by SKU
4. **Batch Processing** - Handle multiple images at once with progress tracking

## 🔑 Required API Keys & Environment Variables

Add these to your `.env.local` file:

### 1. Remove.bg API Configuration
```env
# Get your API key from https://www.remove.bg/users/sign_up
REMOVE_BG_API_KEY=your_remove_bg_api_key_here
```

### 2. CloudFlare R2 Configuration
```env
# From CloudFlare Dashboard > R2 Object Storage
CLOUDFLARE_R2_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_here
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key_here
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name_here
CLOUDFLARE_R2_PUBLIC_URL=https://your-custom-domain.com  # Optional: your custom domain
```

### 3. Supabase Configuration (Already configured)
```env
# Already in your project
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📋 Setup Instructions

### Step 1: Remove.bg API Setup
1. Go to https://www.remove.bg/users/sign_up
2. Create an account (free tier includes 50 images/month)
3. Get your API key from the dashboard
4. Add `REMOVE_BG_API_KEY` to your `.env.local`

### Step 2: CloudFlare R2 Setup
1. **Create R2 Bucket:**
   - Go to CloudFlare Dashboard
   - Navigate to R2 Object Storage
   - Create a new bucket (e.g., "product-images")
   - Note the bucket name

2. **Create API Token:**
   - Go to "Manage R2 API tokens"
   - Create token with "Object Read & Write" permissions
   - Note the Access Key ID and Secret Access Key
   - Note your Account ID from the dashboard

3. **Configure Public Access (Optional):**
   - Set up a custom domain for public access
   - Or use the default R2.dev domain

### Step 3: Database Schema (Auto-handled)
The system automatically searches for products across all material tables:
- tiles, vanities, tubs, tub_fillers, toilets, faucets, showers
- shower_glazing, mirrors, towel_bars, toilet_paper_holders, hooks, lighting

It will add these columns to matching records:
- `IMAGE_URL` - The CloudFlare R2 public URL
- `IMAGE_UPDATED_AT` - Timestamp of when image was processed

### Step 4: Install Dependencies
```bash
npm install @aws-sdk/client-s3
# or if using yarn
yarn add @aws-sdk/client-s3
```

## 🚀 How to Use

### 1. Access the Image Processor
- Go to Admin Panel → "Image Processor" tab
- Enter your admin passcode if needed

### 2. Upload Images
- **Drag & Drop:** Drag image files directly onto the upload area
- **File Browser:** Click "Select Files" to browse and choose images
- **Naming Convention:** Images should be named with their SKU (e.g., "TILE-001.jpg" → SKU: "TILE-001")

### 3. Processing Pipeline
Each image goes through 4 automated steps:
1. ✅ **File Upload** - Image uploaded and SKU extracted
2. 🔄 **Background Removal** - Remove.bg processes the image
3. ☁️ **Cloud Storage Upload** - Processed image uploaded to R2
4. 🗄️ **Database Update** - Product record updated with image URL

### 4. Monitor Progress
- Real-time progress tracking for each image
- Error handling and detailed status messages
- Preview of original vs processed images
- Batch processing with sequential API calls

## 🔧 API Endpoints Created

### `/api/admin/remove-background`
- Handles background removal via remove.bg API
- Accepts image files, returns processed PNG

### `/api/admin/upload-to-r2`  
- Uploads images to CloudFlare R2 bucket
- Returns public URL for the uploaded image

### `/api/admin/update-product-image`
- Searches for product by SKU across all material tables
- Updates record with new image URL and timestamp

## 📊 Features

### ✅ Implemented
- **Drag & Drop Interface** - Easy bulk image upload
- **SKU Auto-Detection** - Extracts SKU from filename
- **Progress Tracking** - Visual pipeline status for each image
- **Error Handling** - Detailed error messages and recovery
- **Background Removal** - Automatic via remove.bg API
- **Cloud Storage** - CloudFlare R2 integration
- **Database Updates** - Automatic product linking
- **Batch Processing** - Sequential processing to avoid API limits
- **Preview System** - Before/after image comparison

### 🎛️ Configuration Options
- **API Rate Limiting** - Sequential processing prevents overwhelming APIs
- **Error Recovery** - Failed images can be retried individually
- **SKU Validation** - Automatic SKU extraction and validation
- **Image Formats** - Supports all common image formats
- **Progress Persistence** - Track completion status per image

## 🛠️ Troubleshooting

### Common Issues

1. **"Remove.bg API key not configured"**
   - Add `REMOVE_BG_API_KEY` to `.env.local`
   - Restart your development server

2. **"CloudFlare R2 configuration missing"**
   - Verify all R2 environment variables are set
   - Check Account ID, Access Keys, and Bucket Name

3. **"Product with SKU not found"**
   - Ensure the SKU exists in one of your material tables
   - Check SKU formatting (automatic cleanup removes special chars)

4. **Images not processing**
   - Check browser console for errors
   - Verify API endpoints are accessible
   - Test individual steps via browser network tab

### Rate Limits
- **Remove.bg Free Tier:** 50 images/month
- **Remove.bg Paid:** Up to 1000+ images/month
- **CloudFlare R2:** Very generous limits for uploads
- **Processing Speed:** ~5-10 seconds per image

## 💰 Cost Estimates

### Remove.bg Pricing
- **Free:** 50 images/month
- **Subscription:** $9/month for 500 images
- **Pay-as-you-go:** $0.20 per image

### CloudFlare R2 Pricing  
- **Storage:** $0.015 per GB/month
- **Operations:** $4.50 per million requests
- **Egress:** Free for most use cases

### Example Cost for 1000 Product Images
- Remove.bg: ~$18/month (subscription)
- CloudFlare R2: ~$0.05/month (storage) + $0.005 (operations)
- **Total: ~$18/month**

## 🔒 Security Notes

- All API keys should be in `.env.local` (never commit to git)
- Service role key has admin access to Supabase
- R2 bucket should have appropriate CORS settings
- Remove.bg API key should be kept secure
- Consider IP restrictions for production deployments

## 📞 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Test individual API endpoints via browser dev tools
4. Check CloudFlare R2 and remove.bg dashboards for usage/errors

The system includes comprehensive error handling and logging to help diagnose issues quickly.