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
    console.error('SENDGRID_API_KEY is not configured');
    throw new Error('Email service is not configured');
  }

  try {
    await sgMail.send({
      from: process.env.FROM_EMAIL || 'noreply@cloudrenovation.ca',
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
    });
  } catch (error: any) {
    console.error('Error sending email with SendGrid:', JSON.stringify(error, null, 2));
    throw new Error('Failed to send email');
  }
}
