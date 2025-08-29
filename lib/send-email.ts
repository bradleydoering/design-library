import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(data: EmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    throw new Error('Email service is not configured');
  }

  try {
    await resend.emails.send({
      from: 'CloudReno <noreply@cloudrenovation.ca>',
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
    });
  } catch (error: any) {
    console.error('Error sending email with Resend:', JSON.stringify(error, null, 2));
    throw new Error('Failed to send email');
  }
}