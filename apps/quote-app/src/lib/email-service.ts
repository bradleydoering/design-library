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