import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(data: EmailData) {
  if (!process.env.SENDGRID_API_KEY) {
    // Development fallback - log email instead of sending
    console.log('📧 EMAIL NOTIFICATION (SendGrid not configured)');
    console.log('==========================================');
    console.log(`To: ${data.to}`);
    console.log(`Subject: ${data.subject}`);
    console.log('Text Content:');
    console.log(data.text);
    console.log('==========================================');
    
    // Don't throw error in development - just log
    return;
  }

  try {
    await sgMail.send({
      from: process.env.FROM_EMAIL || 'noreply@cloudrenovation.ca',
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
    });
    console.log(`✅ Email sent successfully to ${data.to}`);
  } catch (error: any) {
    console.error('Error sending email with SendGrid:', JSON.stringify(error, null, 2));
    throw new Error('Failed to send email');
  }
}
