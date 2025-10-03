import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  const msg = {
    to,
    from: process.env.FROM_EMAIL || 'noreply@cloudrenovation.ca',
    subject,
    text,
    html,
    trackingSettings: {
      clickTracking: {
        enable: false,
        enableText: false
      },
      openTracking: {
        enable: false
      }
    }
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent successfully to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('SendGrid Error:', error);
    return { success: false, error };
  }
}

export async function sendEmailVerification(email: string, verificationUrl: string) {
  const subject = 'Verify your CloudReno account';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Account</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e3a8a; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to CloudReno Quote App</h1>
            </div>
            <div class="content">
                <h2>Verify your email address</h2>
                <p>Thanks for signing up for the CloudReno Quote App! Please click the button below to verify your email address and complete your account setup.</p>
                
                <div style="text-align: center;">
                    <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </div>
                
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace;">
                    ${verificationUrl}
                </p>
                
                <p><strong>Important:</strong> This link will expire in 24 hours for security reasons.</p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                
                <p>If you didn't request this verification email, you can safely ignore it. Someone may have entered your email address by mistake.</p>
            </div>
            <div class="footer">
                <p>CloudReno Quote App<br>
                Contractor Quoting System</p>
            </div>
        </div>
    </body>
    </html>
  `;
  
  const text = `
    Welcome to CloudReno Quote App!
    
    Please verify your email address by visiting: ${verificationUrl}
    
    This link will expire in 24 hours.
    
    If you didn't request this email, you can safely ignore it.
  `;

  return await sendEmail({ to: email, subject, html, text });
}

export async function sendPasswordReset(email: string, resetUrl: string) {
  const subject = 'Reset your CloudReno password';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e3a8a; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Password Reset</h1>
            </div>
            <div class="content">
                <h2>Reset your password</h2>
                <p>We received a request to reset the password for your CloudReno Quote App account. Click the button below to set a new password:</p>
                
                <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace;">
                    ${resetUrl}
                </p>
                
                <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                
                <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            </div>
            <div class="footer">
                <p>CloudReno Quote App<br>
                Contractor Quoting System</p>
            </div>
        </div>
    </body>
    </html>
  `;
  
  const text = `
    Password Reset - CloudReno Quote App
    
    Click this link to reset your password: ${resetUrl}
    
    This link will expire in 1 hour.
    
    If you didn't request this reset, you can safely ignore this email.
  `;

  return await sendEmail({ to: email, subject, html, text });
}

// Customer Quote Sharing

export interface QuoteEmailData {
  customerName: string;
  customerEmail: string;
  projectAddress: string;
  quoteName: string;
  bathroomType: string;
  laborTotal: number;
  token: string;
  expiresAt: Date;
}

export async function sendCustomerQuoteEmail(data: QuoteEmailData) {
  const viewQuoteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/customer/quote/${data.token}`;
  const expiryDate = new Date(data.expiresAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const subject = `Your Bathroom Renovation Quote - ${data.quoteName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Bathroom Renovation Quote</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1e3a5f;
      background-color: #f5f5f0;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background-color: #f47560;
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #1e3a5f;
      font-size: 20px;
      margin-top: 0;
    }
    .quote-details {
      background-color: #f5f5f0;
      padding: 20px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .quote-details-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0d8;
    }
    .quote-details-row:last-child {
      border-bottom: none;
      padding-top: 12px;
      font-weight: 600;
      font-size: 18px;
    }
    .label {
      color: #666;
    }
    .value {
      color: #1e3a5f;
      font-weight: 500;
    }
    .cta-button {
      display: inline-block;
      background-color: #f47560;
      color: white;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      text-align: center;
    }
    .expiry-notice {
      background-color: #fff4e6;
      border-left: 4px solid #ff9800;
      padding: 15px;
      margin: 20px 0;
      font-size: 14px;
    }
    .footer {
      background-color: #f5f5f0;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    .footer a {
      color: #f47560;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛁 Your Bathroom Renovation Quote</h1>
    </div>

    <div class="content">
      <h2>Hi ${data.customerName},</h2>

      <p>Thank you for your interest in renovating your bathroom! We're excited to share your personalized quote with you.</p>

      <div class="quote-details">
        <div class="quote-details-row">
          <span class="label">Project:</span>
          <span class="value">${data.quoteName}</span>
        </div>
        <div class="quote-details-row">
          <span class="label">Address:</span>
          <span class="value">${data.projectAddress}</span>
        </div>
        <div class="quote-details-row">
          <span class="label">Bathroom Type:</span>
          <span class="value">${data.bathroomType}</span>
        </div>
        <div class="quote-details-row">
          <span class="label">Labor Cost:</span>
          <span class="value">$${data.laborTotal.toLocaleString()}</span>
        </div>
      </div>

      <p><strong>Next Step:</strong> Browse our curated design packages and see your complete project cost (labor + materials).</p>

      <div style="text-align: center;">
        <a href="${viewQuoteUrl}" class="cta-button">
          View Your Quote & Browse Designs →
        </a>
      </div>

      <div class="expiry-notice">
        ⏰ <strong>This quote is valid until ${expiryDate}</strong><br>
        After this date, please contact us for an updated quote.
      </div>

      <p>If you have any questions or would like to discuss your project, please don't hesitate to reach out.</p>

      <p>We look forward to helping you create your dream bathroom!</p>

      <p style="margin-top: 30px;">
        Best regards,<br>
        <strong>CloudReno Team</strong>
      </p>
    </div>

    <div class="footer">
      <p>
        CloudReno - Bathroom Renovation Specialists<br>
        <a href="https://cloudrenovation.ca">cloudrenovation.ca</a>
      </p>
      <p style="font-size: 12px; color: #999; margin-top: 20px;">
        This quote was generated specifically for you and contains a secure access link.<br>
        Please do not share this email with others.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Your Bathroom Renovation Quote

Hi ${data.customerName},

Thank you for your interest in renovating your bathroom! We're excited to share your personalized quote with you.

Project Details:
- Project: ${data.quoteName}
- Address: ${data.projectAddress}
- Bathroom Type: ${data.bathroomType}
- Labor Cost: $${data.laborTotal.toLocaleString()}

Next Step: Browse our curated design packages and see your complete project cost (labor + materials).

View your quote and browse designs:
${viewQuoteUrl}

⏰ This quote is valid until ${expiryDate}
After this date, please contact us for an updated quote.

If you have any questions or would like to discuss your project, please don't hesitate to reach out.

We look forward to helping you create your dream bathroom!

Best regards,
CloudReno Team

---
CloudReno - Bathroom Renovation Specialists
cloudrenovation.ca

This quote was generated specifically for you and contains a secure access link.
Please do not share this email with others.
  `;

  return await sendEmail({ to: data.customerEmail, subject, html, text });
}

export async function sendPackageSelectionConfirmation(
  customerName: string,
  customerEmail: string,
  packageName: string,
  totalCost: number
) {
  const subject = `Package Selection Confirmed - ${packageName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Package Selection Confirmed</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1e3a5f;
      background-color: #f5f5f0;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #f47560;
      font-size: 28px;
      margin: 0;
    }
    .checkmark {
      font-size: 48px;
      color: #22c55e;
    }
    .total-cost {
      background-color: #f5f5f0;
      padding: 20px;
      border-radius: 6px;
      text-align: center;
      margin: 20px 0;
    }
    .total-cost .amount {
      font-size: 32px;
      color: #f47560;
      font-weight: bold;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="checkmark">✓</div>
      <h1>Package Selection Confirmed</h1>
    </div>

    <p>Hi ${customerName},</p>

    <p>Thank you for selecting the <strong>${packageName}</strong> package!</p>

    <div class="total-cost">
      <div style="color: #666; margin-bottom: 10px;">Total Project Cost</div>
      <div class="amount">$${totalCost.toLocaleString()}</div>
    </div>

    <p>We've notified our team of your selection and will be in touch shortly to discuss next steps and schedule your project.</p>

    <p>We're excited to help you create your dream bathroom!</p>

    <p style="margin-top: 30px;">
      Best regards,<br>
      <strong>CloudReno Team</strong>
    </p>

    <div class="footer">
      <p>CloudReno - Bathroom Renovation Specialists<br>
      <a href="https://cloudrenovation.ca" style="color: #f47560; text-decoration: none;">cloudrenovation.ca</a></p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Package Selection Confirmed

Hi ${customerName},

Thank you for selecting the ${packageName} package!

Total Project Cost: $${totalCost.toLocaleString()}

We've notified our team of your selection and will be in touch shortly to discuss next steps and schedule your project.

We're excited to help you create your dream bathroom!

Best regards,
CloudReno Team

---
CloudReno - Bathroom Renovation Specialists
cloudrenovation.ca
  `;

  return await sendEmail({ to: customerEmail, subject, html, text });
}