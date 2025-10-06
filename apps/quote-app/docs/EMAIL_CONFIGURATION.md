# Email Configuration Setup

## Problem Identified

**Root Cause**: Supabase default email provider has severe limitations:
- Only 2 emails per hour rate limit
- Many email servers block emails from `supabase.io` domain
- Intended for demo purposes only, not production use

## Solution: SendGrid SMTP Integration

### Step 1: Configure Supabase SMTP Settings

You need to configure Supabase to use SendGrid as the SMTP provider:

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/iaenowmeacxkccgnmfzc
2. **Navigate to**: Settings > Auth > SMTP Settings
3. **Configure SendGrid SMTP**:
   ```
   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   SMTP User: apikey
   SMTP Pass: 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
   Sender Name: CloudReno
   Sender Email: noreply@cloudrenovation.ca
   ```

### Step 2: Update Email Templates

1. **Navigate to**: Auth > Email Templates
2. **Configure Confirmation Email**:
   - Subject: `Verify your CloudReno contractor account`
   - Body: Custom template with proper branding

### Step 3: Verification

After SMTP configuration:
1. Test signup with `bradley.doering@gmail.com`
2. Email should arrive within 1-2 minutes
3. Check that verification link works properly

## Alternative: Local Development Email Testing

For development, you can also use Mailpit to capture emails locally:

```bash
# Install Mailpit
brew install mailpit

# Run Mailpit
mailpit

# Check emails at: http://localhost:8025
```

## Production Recommendations

1. ✅ **Use custom SMTP** (SendGrid, AWS SES, etc.)
2. ✅ **Set up SPF/DKIM records** for `cloudrenovation.ca`
3. ✅ **Monitor email deliverability** metrics
4. ✅ **Test across email providers** (Gmail, Outlook, etc.)

## Current Status

- ❌ Default Supabase email provider (rate limited)
- ✅ SendGrid API key configured in `.env.local`
- ⏳ **NEXT**: Configure Supabase SMTP settings in dashboard