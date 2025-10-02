# SendGrid SMTP Troubleshooting

## API Key Status: ✅ VALID
The SendGrid API key `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` is working correctly.

## Common SendGrid SMTP Issues

### 1. Domain Verification
**Most Likely Issue**: `cloudrenovation.ca` domain may not be verified in SendGrid.

**Solution Options:**
1. **Use verified sender email** (if you have one)
2. **Add domain verification** in SendGrid dashboard
3. **Use SendGrid's default domain** temporarily

### 2. Alternative Sender Emails to Try

Instead of `noreply@cloudrenovation.ca`, try:
- Your verified email: `bradley.doering@gmail.com`
- SendGrid sandbox domain: `test@example.com` (for testing only)

### 3. Updated Supabase SMTP Configuration

Try this configuration in Supabase:

**Option A: Use your Gmail (if verified in SendGrid)**
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP Username: apikey
SMTP Password: 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
Sender Name: CloudReno
Sender Email: bradley.doering@gmail.com
```

**Option B: Verify cloudrenovation.ca domain**
1. Go to SendGrid Dashboard: https://app.sendgrid.com/settings/sender_auth/domain
2. Add and verify `cloudrenovation.ca` domain
3. Complete DNS records setup
4. Then use `noreply@cloudrenovation.ca`

### 4. Check SendGrid Dashboard
1. Go to: https://app.sendgrid.com/
2. Check "Activity" → "Email Activity" for error details
3. Look for authentication or domain errors

### 5. Test Command
After fixing sender email, test with:
```bash
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer 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" \
  -H "Content-Type: application/json" \
  -d '{
    "personalizations": [{"to": [{"email": "bradley.doering@gmail.com"}]}],
    "from": {"email": "bradley.doering@gmail.com"},
    "subject": "Supabase Email Test",
    "content": [{"type": "text/plain", "value": "Test from Supabase via SendGrid"}]
  }'
```

## What Error Did You See?
Please share the exact error message from Supabase so I can provide more specific guidance.